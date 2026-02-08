// Cloudflare Worker for AI-readable Taste Profile API
// Endpoint: /api/taste/[namespace].json
// Returns structured JSON data about a user's curated content
//
// Access Control (future):
// - PUBLIC: Full content visible to everyone
// - PRIVATE: Only visible to treasury owner (requires auth token)
// - PAY_TO_ACCESS: Teaser visible, full content requires payment proof
//
// Query params:
// - ?access_token=xxx - For accessing private/paid content (future)

const API_BASE = 'https://api-prod.copus.network'
const SITE_URL = 'https://copus.network'

// Auto-detect content format from URL
function detectFormat(url) {
  if (!url) return 'unknown'

  const urlLower = url.toLowerCase()

  // Video platforms
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be') ||
      urlLower.includes('vimeo.com') || urlLower.includes('tiktok.com') ||
      urlLower.includes('twitch.tv')) {
    return 'video'
  }

  // Podcast platforms
  if (urlLower.includes('spotify.com/episode') || urlLower.includes('podcasts.apple.com') ||
      urlLower.includes('overcast.fm') || urlLower.includes('pocketcasts.com') ||
      urlLower.includes('anchor.fm')) {
    return 'podcast'
  }

  // Music platforms
  if (urlLower.includes('spotify.com/track') || urlLower.includes('spotify.com/album') ||
      urlLower.includes('soundcloud.com') || urlLower.includes('bandcamp.com') ||
      urlLower.includes('music.apple.com')) {
    return 'music'
  }

  // Image/Art platforms
  if (urlLower.includes('instagram.com') || urlLower.includes('behance.net') ||
      urlLower.includes('dribbble.com') || urlLower.includes('artstation.com') ||
      urlLower.includes('flickr.com') || urlLower.includes('unsplash.com')) {
    return 'image'
  }

  // Tool/App indicators
  if (urlLower.includes('github.com') || urlLower.includes('gitlab.com') ||
      urlLower.includes('.app') || urlLower.includes('apps.apple.com') ||
      urlLower.includes('play.google.com') || urlLower.includes('producthunt.com')) {
    return 'tool'
  }

  // Film/Movie databases
  if (urlLower.includes('imdb.com') || urlLower.includes('letterboxd.com') ||
      urlLower.includes('mubi.com') || urlLower.includes('criterion.com') ||
      urlLower.includes('rottentomatoes.com')) {
    return 'film'
  }

  // Book platforms
  if (urlLower.includes('goodreads.com') || urlLower.includes('amazon.com/dp') ||
      urlLower.includes('bookshop.org') || urlLower.includes('audible.com')) {
    return 'book'
  }

  // Game platforms
  if (urlLower.includes('store.steampowered.com') || urlLower.includes('itch.io') ||
      urlLower.includes('epicgames.com') || urlLower.includes('gog.com')) {
    return 'game'
  }

  // Social/Thread
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com') ||
      urlLower.includes('threads.net') || urlLower.includes('mastodon')) {
    return 'social_post'
  }

  // Research/Academic
  if (urlLower.includes('arxiv.org') || urlLower.includes('scholar.google') ||
      urlLower.includes('researchgate.net') || urlLower.includes('.edu/') ||
      urlLower.includes('doi.org')) {
    return 'research'
  }

  // Newsletter/Article platforms
  if (urlLower.includes('substack.com') || urlLower.includes('medium.com') ||
      urlLower.includes('mirror.xyz') || urlLower.includes('ghost.io')) {
    return 'article'
  }

  // Default to article for most web content
  return 'article'
}

// Access levels for treasuries
// Backend should return one of these in treasury.accessLevel or treasury.visibility
const ACCESS_LEVEL = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PAY_TO_ACCESS: 'pay_to_access'
}

// Map possible backend field values to our access levels
const ACCESS_LEVEL_MAP = {
  // Numeric values (if backend uses numbers)
  0: ACCESS_LEVEL.PUBLIC,
  1: ACCESS_LEVEL.PRIVATE,
  2: ACCESS_LEVEL.PAY_TO_ACCESS,
  // String values
  'public': ACCESS_LEVEL.PUBLIC,
  'private': ACCESS_LEVEL.PRIVATE,
  'pay_to_access': ACCESS_LEVEL.PAY_TO_ACCESS,
  'paid': ACCESS_LEVEL.PAY_TO_ACCESS,
  // Default
  undefined: ACCESS_LEVEL.PUBLIC,
  null: ACCESS_LEVEL.PUBLIC
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
    // API returns nested structure: data.data.data is the array
    if (data.data && Array.isArray(data.data.data)) {
      return data.data.data
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data
    }
    return []
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
    // API returns nested structure: data.data.data is the array
    let articles = []
    if (data.data && Array.isArray(data.data.data)) {
      articles = data.data.data
    } else if (data.data && Array.isArray(data.data)) {
      articles = data.data
    }

    // Enrich articles with seoDataByAi (fetch in parallel, limit to first 20)
    const enrichedArticles = await Promise.all(
      articles.slice(0, 20).map(async (article) => {
        const seoData = await fetchArticleSeoData(article.uuid)
        return { ...article, seoDataByAi: seoData }
      })
    )

    return enrichedArticles
  } catch (error) {
    console.error('Failed to fetch treasury articles:', error)
    return []
  }
}

/**
 * Fetch article details to get seoDataByAi (AI-generated tags, category, keywords)
 * Note: seoDataByAi comes as a JSON string from the backend, needs parsing
 */
async function fetchArticleSeoData(uuid) {
  if (!uuid) return null
  try {
    const response = await fetch(
      `${API_BASE}/client/reader/article/info?uuid=${uuid}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (data.status === 1 && data.data?.seoDataByAi) {
      // seoDataByAi is a JSON string, parse it
      try {
        return JSON.parse(data.data.seoDataByAi)
      } catch (parseError) {
        return null
      }
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Determine access level for a treasury
 * Reads from backend API response, with fallback to PUBLIC
 *
 * Expected backend fields (in order of priority):
 * - treasury.accessLevel: 'public' | 'private' | 'pay_to_access'
 * - treasury.visibility: 0 (public) | 1 (private) | 2 (paid)
 * - treasury.isPrivate: boolean (legacy support)
 */
function getTreasuryAccessLevel(treasury) {
  // Check accessLevel field (preferred)
  if (treasury.accessLevel !== undefined) {
    return ACCESS_LEVEL_MAP[treasury.accessLevel] || ACCESS_LEVEL.PUBLIC
  }

  // Check visibility field (numeric)
  if (treasury.visibility !== undefined) {
    return ACCESS_LEVEL_MAP[treasury.visibility] || ACCESS_LEVEL.PUBLIC
  }

  // Check legacy isPrivate boolean
  if (treasury.isPrivate === true) {
    return ACCESS_LEVEL.PRIVATE
  }

  // Check isPaid boolean
  if (treasury.isPaid === true || treasury.requiresPayment === true) {
    return ACCESS_LEVEL.PAY_TO_ACCESS
  }

  // Default to public
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
 *
 * For PAY_TO_ACCESS treasuries, includes:
 * - price: { amount, currency, paymentUrl }
 * - teaser articles (titles only, no curation notes)
 *
 * For PRIVATE treasuries:
 * - No content shown
 * - Message indicating privacy
 *
 * For PUBLIC treasuries:
 * - Full articles with curation notes
 */
/**
 * Parse seoDataByAi JSON string from backend
 */
function parseSeoData(seoDataString) {
  if (!seoDataString) return null
  try {
    const parsed = JSON.parse(seoDataString)
    return typeof parsed === 'string' ? { description: parsed } : parsed
  } catch {
    return null
  }
}

/**
 * Fetch treasury info to get seoDataByAi
 */
async function fetchTreasurySeoData(namespace) {
  if (!namespace) return null
  try {
    const response = await fetch(
      `${API_BASE}/client/article/space/info/${encodeURIComponent(namespace)}`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    if (!response.ok) return null
    const data = await response.json()
    if (data.status === 1 && data.data?.seoDataByAi) {
      return parseSeoData(data.data.seoDataByAi)
    }
    return null
  } catch {
    return null
  }
}

async function buildTreasuryData(treasury, userInfo, accessLevel) {
  // Determine display name based on space type
  let displayName = treasury.name
  if (treasury.spaceType === 1) {
    displayName = `${userInfo.username}'s Treasury`
  } else if (treasury.spaceType === 2) {
    displayName = `${userInfo.username}'s Curations`
  }

  // Fetch AI-generated SEO data for this treasury
  const seoData = await fetchTreasurySeoData(treasury.namespace) || {}

  const baseData = {
    name: displayName,
    // Use AI description if available, fallback to curator's description
    description: seoData.description || treasury.description || null,
    namespace: treasury.namespace,
    url: `${SITE_URL}/treasury/${treasury.namespace}`,
    articleCount: treasury.articleCount || 0,
    accessLevel: accessLevel,
    // AI-generated treasury metadata
    keywords: seoData.keywords || [],
    tags: seoData.tags || [],
    category: seoData.category || null,
    keyThemes: seoData.keyThemes || [],
    targetAudience: seoData.targetAudience || null,
    collectionInsight: seoData.collectionInsight || null,
    curatorCredibility: seoData.curatorCredibility || null
  }

  // Handle different access levels
  switch (accessLevel) {
    case ACCESS_LEVEL.PRIVATE:
      return {
        ...baseData,
        message: 'This treasury is private. Only the owner can view its contents.',
        articles: []
      }

    case ACCESS_LEVEL.PAY_TO_ACCESS:
      // Build price info from backend data
      const priceInfo = {
        amount: treasury.price || treasury.accessPrice || null,
        currency: treasury.currency || 'USDC',
        paymentUrl: `${SITE_URL}/treasury/${treasury.namespace}?unlock=true`
      }

      return {
        ...baseData,
        message: 'This treasury requires payment to access full content. Teaser titles shown below.',
        price: priceInfo,
        // Show teaser - just titles, no curation notes (the valuable part)
        articles: treasury.id ? await fetchTreasuryArticlesTeaser(treasury.id) : []
      }

    case ACCESS_LEVEL.PUBLIC:
    default:
      // Full access - fetch articles with curation notes and AI-generated metadata
      const articles = treasury.id ? await fetchTreasuryArticles(treasury.id, 20) : []
      if (!Array.isArray(articles)) {
        return { ...baseData, articles: [] }
      }
      return {
        ...baseData,
        articles: articles.map(article => {
          const seo = article.seoDataByAi || {}
          return {
            title: article.title,
            uuid: article.uuid,
            url: `${SITE_URL}/work/${article.uuid}`,
            curationNote: article.content || null, // The curator's reason/note
            originalUrl: article.targetUrl || null,
            format: detectFormat(article.targetUrl), // Auto-detected: article, video, tool, podcast, film, book, game, etc.
            // AI-generated metadata from seoDataByAi
            category: seo.category || article.categoryInfo?.name || null,
            tags: seo.tags || [],
            keywords: seo.keywords || [],
            keyTakeaways: seo.keyTakeaways || [],
            // Engagement stats
            treasureCount: article.likeCount || 0,
            curatedAt: article.createAt ? new Date(article.createAt * 1000).toISOString() : null
          }
        })
      }
  }
}

/**
 * Fetch articles teaser (titles only, for pay-to-access)
 */
async function fetchTreasuryArticlesTeaser(spaceId) {
  const articles = await fetchTreasuryArticles(spaceId, 5)
  if (!Array.isArray(articles)) return []
  return articles.map(article => {
    const seo = article.seoDataByAi || {}
    return {
      title: article.title,
      uuid: article.uuid,
      url: `${SITE_URL}/work/${article.uuid}`,
      // No curation note for teaser - that's the valuable part
      format: detectFormat(article.targetUrl),
      category: seo.category || article.categoryInfo?.name || null,
      tags: seo.tags || []
    }
  })
}

/**
 * Generate an AI-friendly summary of the user's taste
 * Includes counts of public/private/paid treasuries and top interest tags
 */
function generateSummary(userInfo, treasuries) {
  const publicTreasuries = treasuries.filter(t => t.accessLevel === ACCESS_LEVEL.PUBLIC)
  const privateTreasuries = treasuries.filter(t => t.accessLevel === ACCESS_LEVEL.PRIVATE)
  const paidTreasuries = treasuries.filter(t => t.accessLevel === ACCESS_LEVEL.PAY_TO_ACCESS)

  const totalArticles = publicTreasuries.reduce((sum, t) => sum + t.articles.length, 0)

  if (totalArticles === 0 && privateTreasuries.length === 0 && paidTreasuries.length === 0) {
    return `${userInfo.username} is a curator on Copus but hasn't curated any content yet.`
  }

  // Collect categories from public content
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

  // Collect all tags from public content for interest mapping
  const tagCounts = {}
  publicTreasuries.forEach(treasury => {
    treasury.articles.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
  })

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag)

  // Collect sample curation notes from public content
  const sampleNotes = publicTreasuries
    .flatMap(t => t.articles)
    .filter(a => a.curationNote && a.curationNote.length > 20)
    .slice(0, 3)
    .map(a => `"${a.curationNote.slice(0, 100)}${a.curationNote.length > 100 ? '...' : ''}"`)

  let summary = `${userInfo.username} is a curator on Copus with ${userInfo.statistics?.articleCount || 0} total curations`

  if (topCategories.length > 0) {
    summary += ` focusing on ${topCategories.join(', ')}`
  }

  summary += '.'

  // Add top interest tags for AI agents
  if (topTags.length > 0) {
    summary += ` Top interest tags: ${topTags.join(', ')}.`
  }

  // Treasury breakdown
  const treasuryParts = []
  if (publicTreasuries.length > 0) {
    treasuryParts.push(`${publicTreasuries.length} public`)
  }
  if (paidTreasuries.length > 0) {
    treasuryParts.push(`${paidTreasuries.length} premium (pay-to-access)`)
  }
  if (privateTreasuries.length > 0) {
    treasuryParts.push(`${privateTreasuries.length} private`)
  }

  if (treasuryParts.length > 0) {
    summary += ` They have ${treasuryParts.join(', ')} treasuries.`
  }

  if (userInfo.bio) {
    summary += ` Bio: "${userInfo.bio}"`
  }

  if (sampleNotes.length > 0) {
    summary += ` Sample curation notes: ${sampleNotes.join(' | ')}`
  }

  return summary
}
