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

// Extract hostname safely
function getHostname(url) {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

// Build JSON response for AI agents (?format=json)
function buildJsonResponse(article, seoData, siteUrl) {
  const authorInfo = article.authorInfo || {}
  const aeoData = seoData.aeoData || {}

  // Build author URL
  let authorUrl = siteUrl
  if (authorInfo.namespace) {
    authorUrl = `${siteUrl}/u/${authorInfo.namespace}`
  } else if (authorInfo.id) {
    authorUrl = `${siteUrl}/user/${authorInfo.id}/treasury`
  }

  const publishedTime = formatDate(article.createAt)
  const modifiedTime = formatDate(article.updateAt || article.createAt)

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "id": article.uuid,
    "url": `${siteUrl}/work/${article.uuid}`,
    "name": article.title,
    "headline": article.title,
    "description": seoData.description || (article.content ? article.content.substring(0, 300) : '') || article.title || '',
    "abstract": aeoData.facts ? aeoData.facts.join('. ') : null,
    "image": article.coverUrl || DEFAULT_IMAGE,
    "keywords": seoData.tags || (seoData.keywords ? seoData.keywords.split(', ') : []),
    "articleSection": seoData.category || null,
    "author": {
      "@type": "Person",
      "name": authorInfo.username || 'Anonymous',
      "url": authorUrl,
      "description": seoData.curatorCredibility || authorInfo.bio || null
    },
    "audience": aeoData.targetAudience ? {
      "@type": "Audience",
      "audienceType": aeoData.targetAudience
    } : null,
    "datePublished": publishedTime || null,
    "dateModified": modifiedTime || publishedTime || null,
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": siteUrl
    },
    "source": {
      "originalUrl": article.targetUrl || null,
      "domain": getHostname(article.targetUrl),
      "title": article.targetTitle || article.title
    },
    "curation": {
      "curatorNote": article.content || null,
      "keyTakeaways": seoData.keyTakeaways || [],
      "problemSolved": aeoData.problemSolved || null,
      "uniqueValue": aeoData.uniqueValue || null
    },
    "engagement": {
      "viewCount": article.viewCount || 0,
      "collectedInTreasuries": article.likeCount || 0,
      "commentCount": article.commentCount || 0
    }
  }
}

export async function onRequest(context) {
  const { params, next } = context
  const articleId = params.id
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  // Check if JSON format requested (for AI agents)
  const formatJson = url.searchParams.get('format') === 'json'

  // Fetch article data first (needed for both JSON and HTML responses)
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

  // If JSON format requested, return structured JSON for AI agents
  if (formatJson) {
    if (!article) {
      return new Response(JSON.stringify({ error: 'Work not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      })
    }

    const jsonResponse = buildJsonResponse(article, seoData, config.siteUrl)
    return new Response(JSON.stringify(jsonResponse, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    })
  }

  // Get original response for HTML transformation
  const response = await next()

  // Skip non-HTML responses
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    return response
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

// Format date for human display
function formatDisplayDate(timestamp) {
  if (!timestamp || isNaN(timestamp)) return ''
  try {
    const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000
    const date = new Date(ms)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:url" content="${articleUrl}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${title}" />

    <!-- Article Meta -->
    ${authorName ? `<meta property="article:author" content="${authorName}" />` : ''}
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}" />` : ''}

    <!-- AI Agent Discovery -->
    <link rel="alternate" type="application/json" href="${articleUrl}?format=json" title="JSON representation for AI agents" />
    <link rel="search" type="application/json" href="${siteUrl}/api/search" title="Search Copus curations" />
    <link rel="help" href="${siteUrl}/ai" title="AI agent documentation" />
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

    // Build SSR article content for crawlers
    // This is the actual readable content that AI/search crawlers will index
    const displayDate = formatDisplayDate(article.createAt)
    const curatorNote = article.content || ''
    const sourceUrl = article.targetUrl || ''
    const sourceDomain = getHostname(sourceUrl) || ''
    // Note: aeoData already defined above for JSON-LD

    // Build tags HTML
    const tags = seoData.tags || []
    const tagsHtml = tags.length > 0
      ? `<p><strong>Topics:</strong> ${tags.map(t => escapeHtml(t)).join(', ')}</p>`
      : ''

    // Build key takeaways HTML
    const keyTakeaways = seoData.keyTakeaways || []
    const takeawaysHtml = keyTakeaways.length > 0
      ? `<section><h3>Key Takeaways</h3><ul>${keyTakeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></section>`
      : ''

    // Build facts HTML
    const facts = aeoData.facts || []
    const factsHtml = facts.length > 0
      ? `<section><h3>Key Facts</h3><ul>${facts.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul></section>`
      : ''

    // Build audience HTML
    const audienceHtml = aeoData.targetAudience
      ? `<p><strong>Recommended for:</strong> ${escapeHtml(aeoData.targetAudience)}</p>`
      : ''

    // Build category HTML
    const categoryHtml = seoData.category
      ? `<p><strong>Category:</strong> ${escapeHtml(seoData.category)}</p>`
      : ''

    // SSR Article - optimized for AI agent discoverability
    // Structure prioritizes: factual statements, keywords, authority signals
    // Note: Using left:-9999px instead of clip:rect to ensure text extractors can read content
    const ssrArticle = `
    <article id="copus-ssr-content" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;">
      <header>
        <h1>${escapeHtml(article.title)}</h1>
        <p>Curated by <a href="${authorUrl}">${escapeHtml(authorName)}</a>${displayDate ? ` on ${displayDate}` : ''}</p>
      </header>

      ${seoData.description ? `
      <section>
        <h2>Summary</h2>
        <p>${escapeHtml(seoData.description)}</p>
      </section>
      ` : ''}

      ${factsHtml}
      ${takeawaysHtml}

      ${seoData.curatorCredibility ? `
      <section>
        <h2>Why Trust This Recommendation</h2>
        <p>${escapeHtml(seoData.curatorCredibility)}</p>
      </section>
      ` : ''}

      ${sourceUrl ? `
      <section>
        <h2>Original Source</h2>
        <p><a href="${escapeHtml(sourceUrl)}" rel="nofollow noopener">${escapeHtml(sourceDomain)}</a></p>
        ${article.targetTitle ? `<p>Original title: ${escapeHtml(article.targetTitle)}</p>` : ''}
      </section>
      ` : ''}

      ${aeoData.problemSolved ? `<p><strong>Problem solved:</strong> ${escapeHtml(aeoData.problemSolved)}</p>` : ''}
      ${aeoData.uniqueValue ? `<p><strong>Unique value:</strong> ${escapeHtml(aeoData.uniqueValue)}</p>` : ''}
      ${audienceHtml}
      ${categoryHtml}
      ${tagsHtml}

      ${curatorNote ? `
      <section>
        <h2>Curator's Personal Note</h2>
        <p>${escapeHtml(curatorNote)}</p>
      </section>
      ` : ''}

      <section>
        <h2>Engagement</h2>
        <p><strong>${article.viewCount || 0}</strong> views, collected in <strong>${article.likeCount || 0}</strong> treasuries, <strong>${article.commentCount || 0}</strong> comments</p>
      </section>

      <footer>
        <p>This content is curated on <a href="${siteUrl}">Copus</a>, the Internet Treasure Map.</p>
        <p><a href="${articleUrl}">View full curation</a></p>
        <p><strong>For AI agents:</strong></p>
        <ul>
          <li>This article as JSON: <a href="${articleUrl}?format=json">${articleUrl}?format=json</a></li>
          <li>Search all curations: <a href="${siteUrl}/api/search?q=QUERY">${siteUrl}/api/search?q=QUERY</a></li>
          <li>AI documentation: <a href="${siteUrl}/ai">${siteUrl}/ai</a></li>
        </ul>
      </footer>
    </article>
    `

    // Prepend both SSR article and JSON-LD
    element.prepend(ssrArticle + jsonLd, { html: true })
  }
}
