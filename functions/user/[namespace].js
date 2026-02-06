// Cloudflare Worker for User Profile SEO/AEO Meta Tag Injection
// This runs at the edge and injects meta tags + JSON-LD for user profiles

const API_BASE = 'https://api-prod.copus.network'
const SITE_URL = 'https://copus.network'
const SITE_NAME = 'Copus'
const DEFAULT_AVATAR = 'https://copus.network/og-image.jpg'

export async function onRequest(context) {
  const { request, params, next } = context
  const namespace = params.namespace

  const url = new URL(request.url)

  // Skip if not a page request (e.g., JS, CSS, images) unless JSON format requested
  if (url.pathname.includes('.') && !url.search.includes('format=json')) {
    return next()
  }

  // Check for JSON format request
  const wantsJson = url.searchParams.get('format') === 'json'

  // Handle JSON format request separately with simpler error handling
  if (wantsJson) {
    try {
      const userData = await fetchUserInfo(namespace)

      if (!userData) {
        return new Response(JSON.stringify({ error: 'User not found', namespace }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }

      // Fetch treasuries separately (don't let it break the response)
      let treasuriesData = []
      try {
        treasuriesData = await fetchUserTreasuries(namespace)
      } catch (e) {
        console.error('Failed to fetch treasuries:', e)
      }

      const jsonResponse = buildUserJsonResponse(userData, treasuriesData)
      return new Response(JSON.stringify(jsonResponse, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Failed to fetch user profile',
        details: String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
  }

  try {
    // Fetch user data and treasuries in parallel
    const [userData, treasuriesData] = await Promise.all([
      fetchUserInfo(namespace),
      fetchUserTreasuries(namespace)
    ])

    if (!userData) {
      return next()
    }

    // Get original response
    const response = await next()

    // Inject meta tags and JSON-LD
    return new HTMLRewriter()
      .on('head', new HeadInjector(userData, treasuriesData))
      .on('body', new BodyInjector(userData, treasuriesData))
      .transform(response)

  } catch (error) {
    console.error('User profile SEO injection error:', error)
    return next()
  }
}

/**
 * Build JSON response for ?format=json requests
 */
function buildUserJsonResponse(user, treasuries) {
  const profileUrl = `${SITE_URL}/user/${user.namespace}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.username,
    namespace: user.namespace,
    url: profileUrl,
    shortUrl: `${SITE_URL}/u/${user.namespace}`,
    bio: user.bio || null,
    avatar: user.faceUrl || DEFAULT_AVATAR,
    stats: {
      curationsCreated: user.statistics?.articleCount || 0,
      itemsTreasured: user.statistics?.likedArticleCount || 0,
      treasuresReceived: user.statistics?.myArticleLikedCount || 0
    },
    treasuries: (treasuries || []).map(t => ({
      name: t.name || 'Unnamed Treasury',
      namespace: t.namespace,
      url: `${SITE_URL}/treasury/${t.namespace}`,
      articleCount: t.articleCount || 0
    })),
    tasteProfileUrl: `${SITE_URL}/api/taste/${user.namespace}.json`,
    fetchedAt: new Date().toISOString()
  }
}

async function fetchUserInfo(namespace) {
  try {
    const response = await fetch(`${API_BASE}/client/userHome/userInfo?namespace=${encodeURIComponent(namespace)}`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    return null
  }
}

async function fetchUserTreasuries(namespace) {
  try {
    // First get user ID from userInfo, then fetch their spaces
    const userResponse = await fetch(`${API_BASE}/client/userHome/userInfo?namespace=${encodeURIComponent(namespace)}`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!userResponse.ok) return []

    const userData = await userResponse.json()
    const userId = userData.data?.id || userData.id

    if (!userId) return []

    const spacesResponse = await fetch(`${API_BASE}/client/userHome/pageMySpaces?targetUserId=${userId}&pageIndex=1&pageSize=50`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!spacesResponse.ok) return []

    const spacesData = await spacesResponse.json()
    return spacesData.data || []
  } catch (error) {
    console.error('Failed to fetch user treasuries:', error)
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
  constructor(user, treasuries) {
    this.user = user
    this.treasuries = treasuries
  }

  element(element) {
    const { user, treasuries } = this

    const name = escapeHtml(user.username || user.namespace || '')
    const bio = escapeHtml(user.bio || `${name} is a curator on Copus, discovering and sharing valuable content.`)
    const avatar = user.faceUrl || DEFAULT_AVATAR
    const profileUrl = `${SITE_URL}/user/${user.namespace}`
    const articleCount = user.statistics?.articleCount || 0
    const treasuredCount = user.statistics?.likedArticleCount || 0

    const metaTags = `
    <title>${name} (@${user.namespace}) - Curator Profile | ${SITE_NAME}</title>
    <meta name="description" content="${bio} | ${articleCount} curations, ${treasuredCount} treasured items on Copus." />

    <!-- Open Graph -->
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${name} - Curator on Copus" />
    <meta property="og:description" content="${bio}" />
    <meta property="og:image" content="${avatar}" />
    <meta property="og:url" content="${profileUrl}" />
    <meta property="profile:username" content="${user.namespace}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${name} - Curator on Copus" />
    <meta name="twitter:description" content="${bio}" />
    <meta name="twitter:image" content="${avatar}" />
    `

    element.append(metaTags, { html: true })
  }
}

class BodyInjector {
  constructor(user, treasuries) {
    this.user = user
    this.treasuries = treasuries
  }

  element(element) {
    const { user, treasuries } = this

    const profileUrl = `${SITE_URL}/user/${user.namespace}`
    const name = user.username || user.namespace
    const bio = user.bio || `${name} is a curator on Copus.`
    const articleCount = user.statistics?.articleCount || 0
    const treasuredCount = user.statistics?.likedArticleCount || 0

    // Person schema with treasuries
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${profileUrl}#person`,
      "name": name,
      "url": profileUrl,
      "identifier": user.namespace,
      "description": user.bio || `${name} is a curator on Copus, an open-web curation network.`,
      "image": user.faceUrl || DEFAULT_AVATAR,
      "sameAs": [`${SITE_URL}/u/${user.namespace}`],
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WriteAction",
          "userInteractionCount": articleCount,
          "description": "Number of curations created"
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": treasuredCount,
          "description": "Number of items treasured"
        }
      ]
    }

    // Add treasuries as owned collections - helps AI navigate
    if (treasuries && treasuries.length > 0) {
      personSchema.owns = {
        "@type": "ItemList",
        "name": `${name}'s Treasuries`,
        "description": `Curated collections by ${name} on Copus. Visit each treasury to see the curated content.`,
        "numberOfItems": treasuries.length,
        "itemListElement": treasuries.map((treasury, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Collection",
            "@id": `${SITE_URL}/treasury/${treasury.namespace}`,
            "name": treasury.name || 'Unnamed Treasury',
            "url": `${SITE_URL}/treasury/${treasury.namespace}`,
            "numberOfItems": treasury.articleCount || 0,
            "description": `A curated collection with ${treasury.articleCount || 0} treasures. Visit this treasury to see ${name}'s curated content and curation notes.`
          }
        }))
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
          "name": "Copus",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": name,
          "item": profileUrl
        }
      ]
    }

    const schemas = [personSchema, breadcrumbSchema]
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`

    // Build readable HTML content for AI agents (hidden from visual users)
    const treasuriesHtml = treasuries && treasuries.length > 0
      ? treasuries.map((t, i) => `
          <li>
            <a href="${SITE_URL}/treasury/${t.namespace}">${escapeHtml(t.name || 'Unnamed Treasury')}</a>
            - ${t.articleCount || 0} curated items
          </li>`).join('')
      : '<li>No public treasuries yet</li>'

    const ssrContent = `
      <div id="copus-ssr-profile" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;">
        <header>
          <h1>${escapeHtml(name)} - Curator Profile</h1>
          <p><strong>Username:</strong> @${escapeHtml(user.namespace)}</p>
          <p><strong>Bio:</strong> ${escapeHtml(bio)}</p>
          <p><strong>Stats:</strong> ${articleCount} curations created, ${treasuredCount} items treasured</p>
          <p><strong>Profile URL:</strong> <a href="${profileUrl}">${profileUrl}</a></p>
          <p><strong>Taste Profile (JSON):</strong> <a href="${SITE_URL}/api/taste/${user.namespace}.json">${SITE_URL}/api/taste/${user.namespace}.json</a></p>
        </header>

        <main>
          <h2>${escapeHtml(name)}'s Treasuries</h2>
          <p>Browse ${escapeHtml(name)}'s curated collections:</p>
          <ul>
            ${treasuriesHtml}
          </ul>
        </main>

        <footer>
          <p>This is ${escapeHtml(name)}'s profile on Copus, a human-curated content discovery platform.</p>
          <p><a href="${SITE_URL}">Back to Copus Home</a> | <a href="${SITE_URL}/api/taste/${user.namespace}.json">Get JSON taste profile</a></p>
        </footer>
      </div>
    `

    element.prepend(jsonLdScript + ssrContent, { html: true })
  }
}
