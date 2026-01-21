// SEO Worker - Phase 4: Correct field mappings based on actual API response

const SITE_NAME = 'Copus'
const DEFAULT_IMAGE = 'https://copus.network/og-image.jpg'

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    apiBase: isTest ? 'https://api-test.copus.network' : 'https://api-prod.copus.network',
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

// Parse seoData JSON string
function parseSeoData(seoDataString) {
  if (!seoDataString) return {}
  try {
    return JSON.parse(seoDataString)
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
        seoData = parseSeoData(article.seoData)
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

  // Inject real meta tags
  return new HTMLRewriter()
    .on('head', new HeadInjector(article, seoData, config.siteUrl))
    .on('body', new BodyInjector(article, seoData, config.siteUrl))
    .transform(response)
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
    const keywords = escapeHtml(seoData.keywords || '')
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

    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
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
    }

    if (publishedTime) schema.datePublished = publishedTime
    if (modifiedTime) schema.dateModified = modifiedTime

    // Add keywords if available
    if (seoData.keywords) {
      schema.keywords = seoData.keywords
    }

    const jsonLd = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    element.prepend(jsonLd, { html: true })
  }
}
