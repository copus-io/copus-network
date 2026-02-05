// Cloudflare Worker for User Profile SEO/AEO Meta Tag Injection
// This runs at the edge and injects meta tags + JSON-LD for user profiles

const API_BASE = 'https://api-prod.copus.network'
const SITE_URL = 'https://copus.network'
const SITE_NAME = 'Copus'
const DEFAULT_AVATAR = 'https://copus.network/og-image.jpg'

export async function onRequest(context) {
  const { request, params, next } = context
  const namespace = params.namespace

  // Skip if not a page request (e.g., JS, CSS, images)
  const url = new URL(request.url)
  if (url.pathname.includes('.')) {
    return next()
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

    // Person schema with treasuries
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${profileUrl}#person`,
      "name": user.username || user.namespace,
      "url": profileUrl,
      "identifier": user.namespace,
      "description": user.bio || `${user.username} is a curator on Copus, an open-web curation network.`,
      "image": user.faceUrl || DEFAULT_AVATAR,
      "sameAs": [`${SITE_URL}/u/${user.namespace}`],
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WriteAction",
          "userInteractionCount": user.statistics?.articleCount || 0,
          "description": "Number of curations created"
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": user.statistics?.likedArticleCount || 0,
          "description": "Number of items treasured"
        }
      ]
    }

    // Add treasuries as owned collections - helps AI navigate
    if (treasuries && treasuries.length > 0) {
      personSchema.owns = {
        "@type": "ItemList",
        "name": `${user.username}'s Treasuries`,
        "description": `Curated collections by ${user.username} on Copus. Visit each treasury to see the curated content.`,
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
            "description": `A curated collection with ${treasury.articleCount || 0} treasures. Visit this treasury to see ${user.username}'s curated content and curation notes.`
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
          "name": user.username || user.namespace,
          "item": profileUrl
        }
      ]
    }

    const schemas = [personSchema, breadcrumbSchema]
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`

    element.prepend(jsonLdScript, { html: true })
  }
}
