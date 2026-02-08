// Cloudflare Worker for SEO/AEO Meta Tag Injection
// This runs at the edge and injects meta tags before HTML reaches the browser

const API_BASE = 'https://api-prod.copus.network'
const SITE_URL = 'https://copus.network'
const SITE_NAME = 'Copus'
const DEFAULT_IMAGE = 'https://copus.network/og-image.jpg'

export async function onRequest(context) {
  const { request, params, next } = context
  const articleId = params.id

  // Skip if not a page request (e.g., JS, CSS, images)
  const url = new URL(request.url)
  if (url.pathname.includes('.') && !url.search.includes('format=json')) {
    return next()
  }

  // Check for JSON format request
  const wantsJson = url.searchParams.get('format') === 'json'

  try {
    // Fetch article data from API
    const articleData = await fetchArticle(articleId)

    if (!articleData) {
      if (wantsJson) {
        return new Response(JSON.stringify({ error: 'Article not found', id: articleId }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }
      return next()
    }

    // Parse seoData
    const seoData = parseSeoData(articleData.seoData)

    // Return JSON if requested - this bypasses Cloudflare challenges
    if (wantsJson) {
      const jsonResponse = buildJsonResponse(articleData, seoData)
      return new Response(JSON.stringify(jsonResponse, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      })
    }

    // Get original response
    const response = await next()

    // Inject meta tags and JSON-LD
    return new HTMLRewriter()
      .on('head', new HeadInjector(articleData, seoData))
      .on('body', new BodyInjector(articleData, seoData))
      .transform(response)

  } catch (error) {
    console.error('SEO injection error:', error)
    if (wantsJson) {
      return new Response(JSON.stringify({ error: 'Failed to fetch article' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    return next()
  }
}

/**
 * Build JSON response for ?format=json requests
 * Returns structured data that AI agents can easily parse
 */
function buildJsonResponse(article, seoData) {
  const articleUrl = `${SITE_URL}/work/${article.id || article.uuid}`
  const authorUrl = article.namespace
    ? `${SITE_URL}/u/${article.namespace}`
    : `${SITE_URL}/user/${article.userId}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    id: article.id || article.uuid,
    title: article.title,
    url: articleUrl,
    description: seoData.description || article.description || null,
    keywords: seoData.keywords || [],
    image: article.coverImage || DEFAULT_IMAGE,
    originalSource: article.targetUrl || null,
    curationNote: article.content || null,
    category: article.category || null,
    author: {
      name: article.userName,
      namespace: article.namespace,
      url: authorUrl
    },
    stats: {
      views: article.viewCount || 0,
      treasures: article.treasureCount || article.likeCount || 0,
      comments: article.commentCount || 0
    },
    dates: {
      published: article.createdAt || null,
      modified: article.updatedAt || article.createdAt || null
    },
    keyTakeaways: seoData.keyTakeaways || [],
    fetchedAt: new Date().toISOString()
  }
}

async function fetchArticle(articleId) {
  try {
    const response = await fetch(`${API_BASE}/client/article/${articleId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('Failed to fetch article:', error)
    return null
  }
}

function parseSeoData(seoDataString) {
  if (!seoDataString) {
    return {}
  }

  try {
    const parsed = JSON.parse(seoDataString)
    return typeof parsed === 'string' ? { description: parsed } : parsed
  } catch {
    return {}
  }
}

function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

class HeadInjector {
  constructor(article, seoData) {
    this.article = article
    this.seoData = seoData
  }

  element(element) {
    const { article, seoData } = this

    const title = escapeHtml(article.title || '')
    const description = escapeHtml(seoData.description || article.description || '')
    const keywords = (seoData.keywords || []).map(escapeHtml).join(', ')
    const image = article.coverImage || DEFAULT_IMAGE
    const articleUrl = `${SITE_URL}/work/${article.id}`
    const authorName = escapeHtml(article.userName || '')

    // IMPORTANT: Use prepend to inject BEFORE the default meta tags
    // Link preview scrapers use the first occurrence of each meta tag
    const metaTags = `
    <title>${title} - ${SITE_NAME}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />

    <!-- Open Graph - Article Specific -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${articleUrl}" />

    <!-- Twitter Card - Article Specific -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />

    <!-- Article Meta -->
    <meta property="article:author" content="${authorName}" />
    <meta property="article:published_time" content="${article.createdAt || ''}" />
    `

    // Prepend to ensure article meta tags appear BEFORE defaults
    element.prepend(metaTags, { html: true })
  }
}

class BodyInjector {
  constructor(article, seoData) {
    this.article = article
    this.seoData = seoData
  }

  element(element) {
    const { article, seoData } = this

    const articleUrl = `${SITE_URL}/work/${article.id}`
    const authorUrl = article.namespace
      ? `${SITE_URL}/u/${article.namespace}`
      : `${SITE_URL}/user/${article.userId}/treasury`

    // Main Article/WebPage schema
    const mainSchema = {
      "@context": "https://schema.org",
      "@type": seoData.schemaType || "Article",
      "name": article.title,
      "headline": article.title,
      "description": seoData.description || article.description || "",
      "url": articleUrl,
      "image": article.coverImage || DEFAULT_IMAGE,
      "datePublished": article.createdAt,
      "dateModified": article.updatedAt || article.createdAt,
      "keywords": (seoData.keywords || []).join(", "),
      "author": {
        "@type": "Person",
        "name": article.userName,
        "url": authorUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      }
    }

    // Add AEO-specific data if available
    if (seoData.aeoData) {
      mainSchema.about = seoData.aeoData.targetAudience
      if (seoData.aeoData.facts && seoData.aeoData.facts.length > 0) {
        mainSchema.abstract = seoData.aeoData.facts.join('. ')
      }
    }

    // Add key takeaways as article sections
    if (seoData.keyTakeaways && seoData.keyTakeaways.length > 0) {
      mainSchema.articleSection = seoData.keyTakeaways
    }

    // Interaction statistics
    if (article.treasureCount || article.commentCount) {
      mainSchema.interactionStatistic = []

      if (article.treasureCount) {
        mainSchema.interactionStatistic.push({
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": article.treasureCount
        })
      }

      if (article.commentCount) {
        mainSchema.interactionStatistic.push({
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/CommentAction",
          "userInteractionCount": article.commentCount
        })
      }
    }

    // Breadcrumb schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Discovery",
          "item": `${SITE_URL}/discovery`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": article.title,
          "item": articleUrl
        }
      ]
    }

    // FAQPage schema from key takeaways (AEO optimization)
    let faqSchema = null
    if (seoData.keyTakeaways && seoData.keyTakeaways.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": seoData.keyTakeaways.map((takeaway, index) => ({
          "@type": "Question",
          "name": generateQuestion(takeaway, article.title, index),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": takeaway
          }
        }))
      }
    }

    // Combine all schemas
    const schemas = [mainSchema, breadcrumbSchema]
    if (faqSchema) {
      schemas.push(faqSchema)
    }

    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`

    element.prepend(jsonLdScript, { html: true })
  }
}

function generateQuestion(takeaway, title, index) {
  const lower = takeaway.toLowerCase()

  if (lower.includes('best') || lower.includes('great for')) {
    return `What is ${title} best for?`
  }
  if (lower.includes('feature') || lower.includes('include')) {
    return `What features does ${title} have?`
  }
  if (lower.includes('free') || lower.includes('cost')) {
    return `Is ${title} free to use?`
  }
  if (lower.includes('use') || lower.includes('work')) {
    return `How does ${title} work?`
  }

  const patterns = [
    `What should I know about ${title}?`,
    `What are the key benefits of ${title}?`,
    `Why is ${title} recommended?`,
    `What makes ${title} unique?`
  ]

  return patterns[index % patterns.length]
}
