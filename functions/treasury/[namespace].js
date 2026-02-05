// Cloudflare Worker for Treasury/Space SEO/AEO Meta Tag Injection
// This runs at the edge and injects meta tags + JSON-LD for treasury pages

const API_BASE = 'https://api-prod.copus.network'
const SITE_URL = 'https://copus.network'
const SITE_NAME = 'Copus'
const DEFAULT_IMAGE = 'https://copus.network/og-image.jpg'

export async function onRequest(context) {
  const { request, params, next } = context
  const namespace = params.namespace

  // Skip if not a page request (e.g., JS, CSS, images)
  const url = new URL(request.url)
  if (url.pathname.includes('.')) {
    return next()
  }

  try {
    // Fetch treasury/space data
    const spaceData = await fetchSpaceInfo(namespace)

    if (!spaceData) {
      return next()
    }

    // Fetch articles in this treasury
    const articles = await fetchSpaceArticles(spaceData.id)

    // Get original response
    const response = await next()

    // Inject meta tags and JSON-LD
    return new HTMLRewriter()
      .on('head', new HeadInjector(spaceData, articles))
      .on('body', new BodyInjector(spaceData, articles))
      .transform(response)

  } catch (error) {
    console.error('Treasury SEO injection error:', error)
    return next()
  }
}

async function fetchSpaceInfo(namespace) {
  try {
    const response = await fetch(`${API_BASE}/client/article/space/info/${encodeURIComponent(namespace)}`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('Failed to fetch space info:', error)
    return null
  }
}

async function fetchSpaceArticles(spaceId, pageSize = 20) {
  if (!spaceId) return []

  try {
    const response = await fetch(`${API_BASE}/client/article/space/pageArticles?spaceId=${spaceId}&pageIndex=1&pageSize=${pageSize}`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) return []

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch space articles:', error)
    return []
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
  constructor(space, articles) {
    this.space = space
    this.articles = articles
  }

  element(element) {
    const { space, articles } = this

    const spaceName = escapeHtml(space.name || 'Treasury')
    const authorName = escapeHtml(space.userInfo?.username || 'Curator')
    const articleCount = space.articleCount || articles.length || 0
    const treasuryUrl = `${SITE_URL}/treasury/${space.namespace}`
    const authorUrl = `${SITE_URL}/user/${space.userInfo?.namespace}`

    // Create description from first few articles
    let description = `A curated collection of ${articleCount} treasures by ${authorName} on Copus.`
    if (articles.length > 0) {
      const titles = articles.slice(0, 3).map(a => a.title).join(', ')
      description += ` Includes: ${titles}${articles.length > 3 ? '...' : ''}`
    }

    const metaTags = `
    <title>${spaceName} by ${authorName} | ${SITE_NAME} Treasury</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${spaceName} - Curated by ${authorName}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${space.coverUrl || DEFAULT_IMAGE}" />
    <meta property="og:url" content="${treasuryUrl}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${spaceName} - Curated by ${authorName}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${space.coverUrl || DEFAULT_IMAGE}" />
    `

    element.append(metaTags, { html: true })
  }
}

class BodyInjector {
  constructor(space, articles) {
    this.space = space
    this.articles = articles
  }

  element(element) {
    const { space, articles } = this

    const treasuryUrl = `${SITE_URL}/treasury/${space.namespace}`
    const authorUrl = `${SITE_URL}/user/${space.userInfo?.namespace}`

    // Collection schema with articles
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "Collection",
      "@id": treasuryUrl,
      "name": space.name || 'Treasury',
      "url": treasuryUrl,
      "description": `A curated collection of ${space.articleCount || 0} treasures by ${space.userInfo?.username || 'a curator'} on Copus. Each item includes the curator's notes explaining why it's valuable.`,
      "numberOfItems": space.articleCount || 0,
      "author": {
        "@type": "Person",
        "@id": `${authorUrl}#person`,
        "name": space.userInfo?.username || 'Curator',
        "url": authorUrl,
        "image": space.userInfo?.faceUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": SITE_URL
      }
    }

    // Add articles as collection items - this is key for AI to understand the curated content
    if (articles && articles.length > 0) {
      collectionSchema.hasPart = articles.map((article, index) => ({
        "@type": "CreativeWork",
        "@id": `${SITE_URL}/work/${article.uuid}`,
        "position": index + 1,
        "name": article.title,
        "url": `${SITE_URL}/work/${article.uuid}`,
        "description": article.content || undefined, // This is the curation note/reason
        "mainEntityOfPage": article.targetUrl || undefined,
        "genre": article.categoryInfo?.name || undefined,
        "datePublished": article.createAt ? new Date(article.createAt * 1000).toISOString() : undefined,
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": article.likeCount || 0
        }
      }))
    }

    // Breadcrumb schema - shows navigation path
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Copus",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": space.userInfo?.username || 'User',
          "item": authorUrl
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": space.name || 'Treasury',
          "item": treasuryUrl
        }
      ]
    }

    const schemas = [collectionSchema, breadcrumbSchema]
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`

    element.prepend(jsonLdScript, { html: true })
  }
}
