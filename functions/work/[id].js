// SEO Worker - Phase 5: Use AI-generated seoDataByAi field

const SITE_NAME = 'Copus'
const DEFAULT_IMAGE = 'https://copus.network/og-image.jpg'

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    apiBase: isTest ? 'https://api-test.copus.network' : 'https://api-prod.copus.network',
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

// Parse JSON string safely
function parseJsonString(jsonString) {
  if (!jsonString) return {}
  try {
    return JSON.parse(jsonString)
  } catch {
    return {}
  }
}

export async function onRequest(context) {
  const { params, next } = context
  const articleId = params.id
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  // Get original response first - only call next() once!
  const response = await next()

  // Skip non-HTML responses
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    return response
  }

  // Fetch article data
  let article = null
  let seoData = {}
  try {
    const apiUrl = `${config.apiBase}/client/reader/article/info?uuid=${articleId}`
    const apiResponse = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' }
    })

    if (apiResponse.ok) {
      const json = await apiResponse.json()
      if (json.status === 1 && json.data) {
        article = json.data
        // Prefer AI-generated seoDataByAi, fall back to manual seoData
        const aiSeoData = parseJsonString(article.seoDataByAi)
        const manualSeoData = parseJsonString(article.seoData)
        // Merge: AI data takes priority, manual data as fallback
        seoData = { ...manualSeoData, ...aiSeoData }
      }
    }
  } catch (e) {
    console.error('[SEO Worker] API fetch failed:', e)
  }

  // If no article data, just mark worker as active
  if (!article) {
    return new HTMLRewriter()
      .on('head', {
        element(el) {
          el.append(`<meta name="seo-worker" content="no-data" />`, { html: true })
        }
      })
      .transform(response)
  }

  // Remove existing meta tags and inject new ones
  // This ensures our AI-generated tags are the ONLY ones crawlers see
  const transformedResponse = new HTMLRewriter()
    // Remove existing tags that we'll replace
    .on('title', new TagRemover())
    .on('meta[name="description"]', new TagRemover())
    .on('meta[name="keywords"]', new TagRemover())
    .on('meta[property^="og:"]', new TagRemover())
    .on('meta[name^="twitter:"]', new TagRemover())
    .on('meta[property^="article:"]', new TagRemover())
    .on('link[rel="canonical"]', new TagRemover())
    // Remove existing JSON-LD scripts (we'll add our own)
    .on('script[type="application/ld+json"]', new TagRemover())
    // Inject our new tags
    .on('head', new HeadInjector(article, seoData, config.siteUrl))
    .on('body', new BodyInjector(article, seoData, config.siteUrl))
    .transform(response)

  // Create new response with headers that prevent Cloudflare edge caching
  // This ensures crawlers always get fresh, worker-processed content
  const newResponse = new Response(transformedResponse.body, {
    status: transformedResponse.status,
    statusText: transformedResponse.statusText,
    headers: transformedResponse.headers
  })

  // Override cache headers to prevent edge caching for crawlers
  newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  newResponse.headers.set('CDN-Cache-Control', 'no-cache')
  newResponse.headers.set('Cloudflare-CDN-Cache-Control', 'no-cache')

  return newResponse
}

// Remove elements that we want to replace with our own
class TagRemover {
  element(element) {
    element.remove()
  }
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(timestamp) {
  if (!timestamp || isNaN(timestamp)) return ''
  try {
    const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000
    const date = new Date(ms)
    return isNaN(date.getTime()) ? '' : date.toISOString()
  } catch {
    return ''
  }
}

class HeadInjector {
  constructor(article, seoData, siteUrl) {
    this.article = article
    this.seoData = seoData
    this.siteUrl = siteUrl
  }

  element(element) {
    const { article, seoData, siteUrl } = this

    const title = escapeHtml(article.title || '')
    // Use seoData.description if available, otherwise truncate content
    const description = escapeHtml(
      seoData.description ||
      (article.content ? article.content.substring(0, 160) : '') ||
      article.title ||
      ''
    )
    // Keywords: use AI keywords string, or join tags array, or empty
    let keywords = ''
    if (seoData.keywords) {
      keywords = escapeHtml(seoData.keywords)
    } else if (seoData.tags && Array.isArray(seoData.tags)) {
      keywords = escapeHtml(seoData.tags.join(', '))
    }
    // Image is directly on article.coverUrl
    const image = article.coverUrl || DEFAULT_IMAGE
    const articleUrl = `${siteUrl}/work/${article.uuid}`

    // Author info is nested in article.authorInfo
    const authorInfo = article.authorInfo || {}
    const authorName = escapeHtml(authorInfo.username || '')

    const publishedTime = formatDate(article.createAt)
    const modifiedTime = formatDate(article.updateAt || article.createAt)

    const metaTags = `
    <!-- SEO Worker: Article Meta -->
    <meta name="seo-worker" content="active" />
    <title>${title} - ${SITE_NAME}</title>
    <meta name="description" content="${description}" />
    ${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}
    <link rel="canonical" href="${articleUrl}" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${articleUrl}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />

    <!-- Article Meta -->
    ${authorName ? `<meta property="article:author" content="${authorName}" />` : ''}
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}" />` : ''}
    `

    element.append(metaTags, { html: true })
  }
}

class BodyInjector {
  constructor(article, seoData, siteUrl) {
    this.article = article
    this.seoData = seoData
    this.siteUrl = siteUrl
  }

  element(element) {
    const { article, seoData, siteUrl } = this

    // Author info is nested in article.authorInfo
    const authorInfo = article.authorInfo || {}
    const authorName = authorInfo.username || ''
    const authorId = authorInfo.id
    const authorNamespace = authorInfo.namespace

    const articleUrl = `${siteUrl}/work/${article.uuid}`
    // Build author URL: prefer namespace, then id
    let authorUrl = siteUrl
    if (authorNamespace) {
      authorUrl = `${siteUrl}/u/${authorNamespace}`
    } else if (authorId) {
      authorUrl = `${siteUrl}/user/${authorId}/treasury`
    }

    // Image is directly on article.coverUrl
    const image = article.coverUrl || DEFAULT_IMAGE
    const description = seoData.description ||
      (article.content ? article.content.substring(0, 300) : '') ||
      article.title || ''

    const publishedTime = formatDate(article.createAt)
    const modifiedTime = formatDate(article.updateAt || article.createAt) || publishedTime

    // Use AI-determined schemaType or default to Article
    // Note: SoftwareApplication requires extra fields, so we default to Article for safety
    let schemaType = seoData.schemaType || 'Article'

    // For types that require special fields, fall back to Article if we don't have them
    const specialTypes = ['SoftwareApplication', 'HowTo']
    if (specialTypes.includes(schemaType)) {
      // SoftwareApplication needs: name + (2 of: offers, aggregateRating, applicationCategory, operatingSystem)
      // HowTo needs: name + step
      // Since we're a curation platform (recommendations), Article/Review is more appropriate anyway
      schemaType = 'Article'
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "name": article.title,
      "headline": article.title,
      "description": description,
      "image": image,
      "url": articleUrl,
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": siteUrl,
        "logo": { "@type": "ImageObject", "url": `${siteUrl}/logo.png` }
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": articleUrl }
    }

    // Only add author if we have a name
    if (authorName) {
      schema.author = {
        "@type": "Person",
        "name": authorName,
        "url": authorUrl
      }
      // Add curator credibility if available
      if (seoData.curatorCredibility) {
        schema.author.description = seoData.curatorCredibility
      }
    }

    if (publishedTime) schema.datePublished = publishedTime
    if (modifiedTime) schema.dateModified = modifiedTime

    // Add keywords if available
    if (seoData.keywords) {
      schema.keywords = seoData.keywords
    }

    // Add AI-generated AEO data
    const aeoData = seoData.aeoData || {}
    if (aeoData.targetAudience) {
      schema.audience = {
        "@type": "Audience",
        "audienceType": aeoData.targetAudience
      }
    }
    if (aeoData.facts && aeoData.facts.length > 0) {
      schema.abstract = aeoData.facts.join('. ')
    }

    // Add key takeaways as article sections
    if (seoData.keyTakeaways && seoData.keyTakeaways.length > 0) {
      schema.articleSection = seoData.keyTakeaways
    }

    // Add tags if available
    if (seoData.tags && seoData.tags.length > 0) {
      schema.keywords = seoData.tags.join(', ')
    }

    // Add category if available
    if (seoData.category) {
      schema.articleSection = seoData.category
    }

    const jsonLd = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    element.prepend(jsonLd, { html: true })
  }
}
