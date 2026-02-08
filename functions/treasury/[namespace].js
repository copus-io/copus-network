// Cloudflare Worker for Treasury/Space SEO/AEO Meta Tag Injection
// This runs at the edge and injects meta tags + JSON-LD for treasury pages
//
// Access Control:
// - PUBLIC: Full content in SSR
// - PRIVATE: Shows "private treasury" message, no content
// - PAY_TO_ACCESS: Shows teaser (titles only), price info, unlock CTA

const API_BASE = 'https://api-prod.copus.network'
const SITE_URL = 'https://copus.network'
const SITE_NAME = 'Copus'
const DEFAULT_IMAGE = 'https://copus.network/og-image.jpg'

// Access levels
const ACCESS_LEVEL = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PAY_TO_ACCESS: 'pay_to_access'
}

/**
 * Determine access level from treasury data
 */
function getTreasuryAccessLevel(space) {
  if (space.accessLevel) return space.accessLevel
  if (space.visibility === 1 || space.isPrivate) return ACCESS_LEVEL.PRIVATE
  if (space.visibility === 2 || space.isPaid || space.requiresPayment) return ACCESS_LEVEL.PAY_TO_ACCESS
  return ACCESS_LEVEL.PUBLIC
}

export async function onRequest(context) {
  const { request, params, next } = context
  const namespace = params.namespace

  const url = new URL(request.url)

  // Skip if not a page request unless JSON format requested
  if (url.pathname.includes('.') && !url.search.includes('format=json')) {
    return next()
  }

  // Check for JSON format request
  const wantsJson = url.searchParams.get('format') === 'json'

  try {
    // Fetch treasury/space data
    const spaceData = await fetchSpaceInfo(namespace)

    if (!spaceData) {
      if (wantsJson) {
        return new Response(JSON.stringify({ error: 'Treasury not found', namespace }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }
      return next()
    }

    // Fetch articles in this treasury
    const articles = await fetchSpaceArticles(spaceData.id)

    // Return JSON if requested - bypasses Cloudflare challenges
    if (wantsJson) {
      const accessLevel = getTreasuryAccessLevel(spaceData)
      const jsonResponse = buildTreasuryJsonResponse(spaceData, articles, accessLevel)
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

    // Inject meta tags and JSON-LD, and remove default meta tags
    return new HTMLRewriter()
      .on('head', new HeadInjector(spaceData, articles))
      .on('title[data-rh="true"]', new ElementRemover())
      .on('meta[data-rh="true"]', new ElementRemover())
      .on('link[data-rh="true"]', new ElementRemover())
      .on('body', new BodyInjector(spaceData, articles))
      .transform(response)

  } catch (error) {
    console.error('Treasury SEO injection error:', error)
    if (wantsJson) {
      return new Response(JSON.stringify({
        error: 'Failed to fetch treasury',
        details: String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    return next()
  }
}

/**
 * Build JSON response for ?format=json requests
 * Respects access control levels
 */
function buildTreasuryJsonResponse(space, articles, accessLevel) {
  const treasuryUrl = `${SITE_URL}/treasury/${space.namespace}`
  const authorUrl = `${SITE_URL}/user/${space.userInfo?.namespace}`

  const baseResponse = {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: space.name || 'Treasury',
    namespace: space.namespace,
    url: treasuryUrl,
    description: space.description || null,
    image: space.coverUrl || space.faceUrl || DEFAULT_IMAGE,
    accessLevel: accessLevel,
    articleCount: space.articleCount || 0,
    author: {
      name: space.userInfo?.username || 'Curator',
      namespace: space.userInfo?.namespace,
      url: authorUrl,
      avatar: space.userInfo?.faceUrl,
      bio: space.userInfo?.bio || null
    },
    fetchedAt: new Date().toISOString()
  }

  // Handle access levels
  if (accessLevel === ACCESS_LEVEL.PRIVATE) {
    return {
      ...baseResponse,
      message: 'This treasury is private',
      articles: []
    }
  }

  if (accessLevel === ACCESS_LEVEL.PAY_TO_ACCESS) {
    return {
      ...baseResponse,
      message: 'Pay to access full content',
      price: {
        amount: space.price || space.accessPrice || null,
        currency: space.currency || 'USDC',
        unlockUrl: `${treasuryUrl}?unlock=true`
      },
      // Teaser: titles only, no curation notes
      articles: (articles || []).slice(0, 5).map(a => ({
        title: a.title,
        uuid: a.uuid,
        url: `${SITE_URL}/work/${a.uuid}`
      }))
    }
  }

  // Public: full content
  return {
    ...baseResponse,
    articles: (articles || []).map(a => ({
      title: a.title,
      uuid: a.uuid,
      url: `${SITE_URL}/work/${a.uuid}`,
      curationNote: a.content || null,
      originalUrl: a.targetUrl || null,
      category: a.categoryInfo?.name || null,
      treasureCount: a.likeCount || 0,
      curatedAt: a.createAt ? new Date(a.createAt * 1000).toISOString() : null
    }))
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
    // API returns nested structure: data.data.data is the array
    if (data.data && Array.isArray(data.data.data)) {
      return data.data.data
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data
    }
    return []
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

// Remove elements with data-rh="true" attribute (default meta tags)
class ElementRemover {
  element(element) {
    element.remove()
  }
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

    // Use treasury's own description (curator's recommendation), fallback to auto-generated
    let description = space.description
    if (!description) {
      description = `A curated collection of ${articleCount} treasures by ${authorName}.`
      if (articles.length > 0) {
        const titles = articles.slice(0, 3).map(a => a.title).join(', ')
        description += ` Includes: ${titles}${articles.length > 3 ? '...' : ''}`
      }
    }

    // Use coverUrl first, then faceUrl (profile image), then default
    const image = space.coverUrl || space.faceUrl || DEFAULT_IMAGE

    // IMPORTANT: Use prepend to inject BEFORE the default meta tags
    // Link preview scrapers use the first occurrence of each meta tag
    const metaTags = `
    <title>${spaceName} by ${authorName} - ${SITE_NAME}</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <!-- Open Graph - Treasury Specific -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${spaceName}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${treasuryUrl}" />

    <!-- Twitter Card - Treasury Specific -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${spaceName}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    `

    // Prepend to ensure treasury meta tags appear BEFORE defaults
    element.prepend(metaTags, { html: true })
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
    const spaceName = space.name || 'Treasury'
    const authorName = space.userInfo?.username || 'Curator'
    const articleCount = space.articleCount || 0
    const accessLevel = getTreasuryAccessLevel(space)

    // Use treasury's own description (curator's recommendation)
    const treasuryDescription = space.description || `A curated collection of ${articleCount} treasures by ${authorName}.`
    const treasuryImage = space.coverUrl || space.faceUrl || DEFAULT_IMAGE

    // Collection schema with articles
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "Collection",
      "@id": treasuryUrl,
      "name": spaceName,
      "description": treasuryDescription,
      "url": treasuryUrl,
      "image": treasuryImage,
      "numberOfItems": articleCount,
      "author": {
        "@type": "Person",
        "@id": `${authorUrl}#person`,
        "name": authorName,
        "url": authorUrl,
        "image": space.userInfo?.faceUrl,
        "description": space.userInfo?.bio || undefined
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/logo.png`
        }
      }
    }

    // Customize description and content based on access level
    let ssrContent = ''

    if (accessLevel === ACCESS_LEVEL.PRIVATE) {
      // Private treasury - minimal info
      collectionSchema.description = `A private curated collection by ${authorName} on Copus. This treasury is only visible to the owner.`

      ssrContent = `
        <div id="copus-ssr-treasury" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;">
          <header>
            <h1>${escapeHtml(spaceName)} (Private)</h1>
            <p><strong>Curated by:</strong> <a href="${authorUrl}">${escapeHtml(authorName)}</a></p>
            <p><strong>Access:</strong> Private - This treasury is only visible to its owner.</p>
          </header>
          <footer>
            <p><a href="${authorUrl}">View ${escapeHtml(authorName)}'s public profile</a></p>
          </footer>
        </div>
      `
    } else if (accessLevel === ACCESS_LEVEL.PAY_TO_ACCESS) {
      // Paid treasury - show teaser (titles only, no curation notes)
      const price = space.price || space.accessPrice || 'varies'
      const currency = space.currency || 'USDC'

      collectionSchema.description = `A premium curated collection of ${articleCount} treasures by ${authorName} on Copus. Pay to unlock full curation notes and insights.`
      collectionSchema.isAccessibleForFree = false
      if (space.price) {
        collectionSchema.offers = {
          "@type": "Offer",
          "price": space.price,
          "priceCurrency": currency,
          "url": `${treasuryUrl}?unlock=true`
        }
      }

      // Teaser articles - titles only, no curation notes
      if (articles && articles.length > 0) {
        collectionSchema.hasPart = articles.slice(0, 5).map((article, index) => ({
          "@type": "CreativeWork",
          "@id": `${SITE_URL}/work/${article.uuid}`,
          "position": index + 1,
          "name": article.title,
          "url": `${SITE_URL}/work/${article.uuid}`
          // No description (curation note) - that's the paid content
        }))
      }

      const teaserHtml = articles && articles.length > 0
        ? articles.slice(0, 5).map((a, i) => `
            <li><a href="${SITE_URL}/work/${a.uuid}">${escapeHtml(a.title)}</a></li>`).join('')
        : '<li>No preview available</li>'

      ssrContent = `
        <div id="copus-ssr-treasury" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;">
          <header>
            <h1>${escapeHtml(spaceName)} (Premium)</h1>
            <p><strong>Curated by:</strong> <a href="${authorUrl}">${escapeHtml(authorName)}</a></p>
            <p><strong>Total Items:</strong> ${articleCount} curated treasures</p>
            <p><strong>Access:</strong> Pay-to-access. Unlock to see full curation notes and insights.</p>
            <p><strong>Price:</strong> ${price} ${currency}</p>
            <p><strong>Unlock:</strong> <a href="${treasuryUrl}?unlock=true">${treasuryUrl}?unlock=true</a></p>
          </header>

          <main>
            <h2>Preview (Titles Only)</h2>
            <p>Below is a preview of what's in this treasury. Pay to unlock full curation notes:</p>
            <ul>
              ${teaserHtml}
              ${articles.length > 5 ? `<li>...and ${articles.length - 5} more</li>` : ''}
            </ul>
          </main>

          <footer>
            <p>This is a premium treasury on Copus. The curator's insights and notes are available after payment.</p>
            <p><a href="${authorUrl}">View ${escapeHtml(authorName)}'s profile</a> | <a href="${SITE_URL}">Back to Copus Home</a></p>
          </footer>
        </div>
      `
    } else {
      // Public treasury - full content
      // Keep the curator's description as primary, it's already set in collectionSchema
      collectionSchema.isAccessibleForFree = true

      // Add articles as collection items
      if (articles && articles.length > 0) {
        collectionSchema.hasPart = articles.map((article, index) => ({
          "@type": "CreativeWork",
          "@id": `${SITE_URL}/work/${article.uuid}`,
          "position": index + 1,
          "name": article.title,
          "url": `${SITE_URL}/work/${article.uuid}`,
          "description": article.content || undefined,
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

      const articlesHtml = articles && articles.length > 0
        ? articles.map((a, i) => `
            <article>
              <h3>${i + 1}. <a href="${SITE_URL}/work/${a.uuid}">${escapeHtml(a.title)}</a></h3>
              ${a.content ? `<p><strong>Curation Note:</strong> ${escapeHtml(a.content.slice(0, 300))}${a.content.length > 300 ? '...' : ''}</p>` : ''}
              ${a.targetUrl ? `<p><strong>Original Source:</strong> <a href="${escapeHtml(a.targetUrl)}">${escapeHtml(a.targetUrl)}</a></p>` : ''}
              <p><strong>Treasured:</strong> ${a.likeCount || 0} times</p>
            </article>`).join('')
        : '<p>No articles in this treasury yet.</p>'

      ssrContent = `
        <div id="copus-ssr-treasury" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;">
          <header>
            <h1>${escapeHtml(spaceName)}</h1>
            <p><strong>Curated by:</strong> <a href="${authorUrl}">${escapeHtml(authorName)}</a></p>
            ${space.description ? `<p><strong>About this Treasury:</strong> ${escapeHtml(space.description)}</p>` : ''}
            <p><strong>Total Items:</strong> ${articleCount} curated treasures</p>
            <p><strong>Access:</strong> Public</p>
            <p><strong>Treasury URL:</strong> <a href="${treasuryUrl}">${treasuryUrl}</a></p>
          </header>

          <main>
            <h2>Curated Content</h2>
            <p>Below are the items ${escapeHtml(authorName)} has curated in this treasury, each with their curation notes explaining why it's valuable:</p>
            ${articlesHtml}
          </main>

          <footer>
            <p>This is a treasury on Copus, a human-curated content discovery platform.</p>
            <p><a href="${authorUrl}">View ${escapeHtml(authorName)}'s profile</a> | <a href="${SITE_URL}">Back to Copus Home</a></p>
          </footer>
        </div>
      `
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
          "name": authorName,
          "item": authorUrl
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": spaceName,
          "item": treasuryUrl
        }
      ]
    }

    const schemas = [collectionSchema, breadcrumbSchema]
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`

    element.prepend(jsonLdScript + ssrContent, { html: true })
  }
}
