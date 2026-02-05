// Cloudflare Worker for AI-readable Taste Profile API
// Endpoint: /api/taste/[namespace].json
// Returns structured JSON data about a user's curated content

const API_BASE = 'https://api-prod.copus.network'
const SITE_URL = 'https://copus.network'

// Access levels for treasuries (for future implementation)
const ACCESS_LEVEL = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PAY_TO_ACCESS: 'pay_to_access'
}

export async function onRequest(context) {
  const { request, params } = context
  let namespace = params.namespace

  // Remove .json extension if present
  if (namespace.endsWith('.json')) {
    namespace = namespace.slice(0, -5)
  }

  // Set CORS headers for API access
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
  }

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  try {
    // Fetch user profile
    const userInfo = await fetchUserInfo(namespace)

    if (!userInfo) {
      return new Response(JSON.stringify({
        error: 'User not found',
        namespace: namespace
      }), { status: 404, headers })
    }

    // Fetch user's treasuries
    const treasuries = await fetchUserTreasuries(userInfo.id)

    // Build taste profile with access control consideration
    const tasteProfile = await buildTasteProfile(userInfo, treasuries)

    return new Response(JSON.stringify(tasteProfile, null, 2), { headers })

  } catch (error) {
    console.error('Taste API error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to fetch taste profile',
      message: error.message
    }), { status: 500, headers })
  }
}

async function fetchUserInfo(namespace) {
  try {
    const response = await fetch(
      `${API_BASE}/client/userHome/userInfo?namespace=${encodeURIComponent(namespace)}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (data.status !== 1) return null

    return data.data
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    return null
  }
}

async function fetchUserTreasuries(userId) {
  try {
    const response = await fetch(
      `${API_BASE}/client/userHome/pageMySpaces?targetUserId=${userId}&pageIndex=1&pageSize=50`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch treasuries:', error)
    return []
  }
}

async function fetchTreasuryArticles(spaceId, limit = 10) {
  try {
    const response = await fetch(
      `${API_BASE}/client/article/space/pageArticles?spaceId=${spaceId}&pageIndex=1&pageSize=${limit}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch treasury articles:', error)
    return []
  }
}

/**
 * Determine access level for a treasury
 * TODO: Update this when access control is implemented in the API
 */
function getTreasuryAccessLevel(treasury) {
  // Future: Check treasury.accessLevel or treasury.visibility
  // For now, all treasuries are public
  return ACCESS_LEVEL.PUBLIC
}

/**
 * Build the taste profile based on access levels
 */
async function buildTasteProfile(userInfo, treasuries) {
  const profile = {
    // Metadata
    '@context': 'https://schema.org',
    '@type': 'Person',

    // Basic info (always visible)
    name: userInfo.username,
    namespace: userInfo.namespace,
    url: `${SITE_URL}/user/${userInfo.namespace}`,
    shortUrl: `${SITE_URL}/u/${userInfo.namespace}`,

    // Bio and avatar
    bio: userInfo.bio || null,
    avatar: userInfo.faceUrl || null,

    // Statistics
    stats: {
      curationsCreated: userInfo.statistics?.articleCount || 0,
      itemsTreasured: userInfo.statistics?.likedArticleCount || 0,
      treasuresReceived: userInfo.statistics?.myArticleLikedCount || 0
    },

    // Treasuries with access control
    treasuries: [],

    // AI-friendly summary
    summary: null,

    // Timestamp
    fetchedAt: new Date().toISOString()
  }

  // Process each treasury based on access level
  for (const treasury of treasuries) {
    const accessLevel = getTreasuryAccessLevel(treasury)
    const treasuryData = await buildTreasuryData(treasury, userInfo, accessLevel)
    profile.treasuries.push(treasuryData)
  }

  // Generate AI-friendly summary
  profile.summary = generateSummary(userInfo, profile.treasuries)

  return profile
}

/**
 * Build treasury data based on access level
 */
async function buildTreasuryData(treasury, userInfo, accessLevel) {
  // Determine display name based on space type
  let displayName = treasury.name
  if (treasury.spaceType === 1) {
    displayName = `${userInfo.username}'s Treasury`
  } else if (treasury.spaceType === 2) {
    displayName = `${userInfo.username}'s Curations`
  }

  const baseData = {
    name: displayName,
    namespace: treasury.namespace,
    url: `${SITE_URL}/treasury/${treasury.namespace}`,
    articleCount: treasury.articleCount || 0,
    accessLevel: accessLevel
  }

  // Handle different access levels
  switch (accessLevel) {
    case ACCESS_LEVEL.PRIVATE:
      return {
        ...baseData,
        message: 'This treasury is private',
        articles: []
      }

    case ACCESS_LEVEL.PAY_TO_ACCESS:
      return {
        ...baseData,
        message: 'Pay to access full content',
        // Show teaser - just titles, no curation notes
        articles: treasury.id ? await fetchTreasuryArticlesTeaser(treasury.id) : []
      }

    case ACCESS_LEVEL.PUBLIC:
    default:
      // Full access - fetch articles with curation notes
      const articles = treasury.id ? await fetchTreasuryArticles(treasury.id, 20) : []
      return {
        ...baseData,
        articles: articles.map(article => ({
          title: article.title,
          uuid: article.uuid,
          url: `${SITE_URL}/work/${article.uuid}`,
          curationNote: article.content || null, // The curator's reason/note
          originalUrl: article.targetUrl || null,
          category: article.categoryInfo?.name || null,
          treasureCount: article.likeCount || 0,
          curatedAt: article.createAt ? new Date(article.createAt * 1000).toISOString() : null
        }))
      }
  }
}

/**
 * Fetch articles teaser (titles only, for pay-to-access)
 */
async function fetchTreasuryArticlesTeaser(spaceId) {
  const articles = await fetchTreasuryArticles(spaceId, 5)
  return articles.map(article => ({
    title: article.title,
    uuid: article.uuid,
    url: `${SITE_URL}/work/${article.uuid}`,
    // No curation note for teaser
    category: article.categoryInfo?.name || null
  }))
}

/**
 * Generate an AI-friendly summary of the user's taste
 */
function generateSummary(userInfo, treasuries) {
  const publicTreasuries = treasuries.filter(t => t.accessLevel === ACCESS_LEVEL.PUBLIC)
  const totalArticles = publicTreasuries.reduce((sum, t) => sum + t.articles.length, 0)

  if (totalArticles === 0) {
    return `${userInfo.username} is a curator on Copus but hasn't curated any public content yet.`
  }

  // Collect categories
  const categories = {}
  publicTreasuries.forEach(treasury => {
    treasury.articles.forEach(article => {
      if (article.category) {
        categories[article.category] = (categories[article.category] || 0) + 1
      }
    })
  })

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)

  // Collect sample curation notes
  const sampleNotes = publicTreasuries
    .flatMap(t => t.articles)
    .filter(a => a.curationNote && a.curationNote.length > 20)
    .slice(0, 3)
    .map(a => `"${a.curationNote.slice(0, 100)}${a.curationNote.length > 100 ? '...' : ''}"`)

  let summary = `${userInfo.username} is a curator on Copus with ${userInfo.statistics?.articleCount || 0} curations`

  if (topCategories.length > 0) {
    summary += ` focusing on ${topCategories.join(', ')}`
  }

  summary += `. They have ${publicTreasuries.length} public treasuries containing curated content.`

  if (userInfo.bio) {
    summary += ` Bio: "${userInfo.bio}"`
  }

  if (sampleNotes.length > 0) {
    summary += ` Sample curation notes: ${sampleNotes.join(' | ')}`
  }

  return summary
}
