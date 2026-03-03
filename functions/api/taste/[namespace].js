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
const TASTE_SERVICE_KEY = 'gCniCeAxOiy1hytx-rQEyKBd926yg8gchpXhND2gnrk'

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

const CACHE_TTL = 300 // 5 minutes

export async function onRequest(context) {
  const { request, params } = context
  let namespace = params.namespace

  // Remove .json extension if present
  if (namespace.endsWith('.json')) {
    namespace = namespace.slice(0, -5)
  }

  // Parse query params (for ?key= private access)
  const url = new URL(request.url)
  const accessKey = url.searchParams.get('key')

  // Set CORS headers for API access
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': `public, max-age=${CACHE_TTL}`
  }

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  // Build a canonical cache key (ignoring _t cache-busting param)
  const cacheKey = new URL(request.url)
  cacheKey.searchParams.delete('_t')
  const cache = caches.default

  // Try edge cache first
  const cached = await cache.match(cacheKey.toString())
  if (cached) {
    // Clone and update CORS headers (cache may strip them)
    const response = new Response(cached.body, cached)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('X-Cache', 'HIT')
    return response
  }

  try {
    // Fetch user profile by namespace
    const userInfo = await fetchUserInfo(namespace)

    if (!userInfo) {
      return new Response(JSON.stringify({
        error: 'User not found',
        namespace: namespace
      }), { status: 404, headers })
    }

    // Check if taste profile is set to private
    // Allow access if ?key matches the user's uuid (private link)
    if (userInfo.isTasteVisible === false) {
      if (!accessKey || accessKey !== userInfo.uuid) {
        return new Response(JSON.stringify({
          error: 'This taste profile is private',
          namespace: namespace,
          message: 'The owner has set their taste profile to private.'
        }), { status: 403, headers })
      }
    }

    // Fetch user's treasuries
    const treasuries = await fetchUserTreasuries(userInfo.id)

    // Build taste profile with access control consideration
    const tasteProfile = await buildTasteProfile(userInfo, treasuries)

    const response = new Response(JSON.stringify(tasteProfile), { headers })

    // Store in edge cache (non-blocking)
    context.waitUntil(cache.put(cacheKey.toString(), response.clone()))

    return response

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
      { headers: { 'Content-Type': 'application/json', 'X-Taste-Service-Key': TASTE_SERVICE_KEY } }
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

const MAX_CURATIONS = 50 // Cap total curations for AI-friendly response size

async function fetchTreasuryArticles(spaceId, limit = 100) {
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

    return articles
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
    // What this is
    about: 'Taste profile on Copus — things this person found valuable across the internet, saved and annotated.',
    // Only reference URLs that exist in this data
    _note: 'Only cite URLs from the curations array. Do not invent links.',

    '@context': 'https://schema.org',
    '@type': 'Person',
    name: userInfo.username,
    namespace: userInfo.namespace,
    url: `${SITE_URL}/u/${userInfo.namespace}`,
    bio: userInfo.bio || null,
    avatar: userInfo.faceUrl || null,

    stats: {
      publicCurations: userInfo.statistics?.publicArticleCount || 0,
      privateCurations: userInfo.statistics?.privateArticleCount || 0,
      collected: userInfo.statistics?.collectedArticleCount || 0,
    },

    // Treasuries: user-organized categories. Names and descriptions are set by the user.
    // titles[] lists ALL items in each category — use this as a table of contents.
    treasuries: [],

    // Most recent curations with full data (notes, URLs, original links).
    // Curation notes explain WHY this person saved each item.
    curations: [],

    summary: null,
    fetchedAt: new Date().toISOString()
  }

  // Process all treasuries in parallel for faster response
  profile.treasuries = await Promise.all(
    treasuries.map(treasury => {
      const accessLevel = getTreasuryAccessLevel(treasury)
      return buildTreasuryData(treasury, userInfo, accessLevel)
    })
  )

  // Build deduplicated flat curations list, sorted by most recent first
  const seenUuids = new Set()
  let allCurations = profile.treasuries.flatMap(treasury =>
    (treasury.articles || []).filter(article => {
      if (seenUuids.has(article.uuid)) return false
      seenUuids.add(article.uuid)
      return true
    })
  )

  // Sort by curatedAt descending (most recent first)
  allCurations.sort((a, b) => {
    const dateA = a.curatedAt ? new Date(a.curatedAt).getTime() : 0
    const dateB = b.curatedAt ? new Date(b.curatedAt).getTime() : 0
    return dateB - dateA
  })

  // Cap at MAX_CURATIONS — AI agents get diminishing returns beyond ~50
  const totalUniqueCurations = allCurations.length
  profile.curations = allCurations.slice(0, MAX_CURATIONS)

  if (totalUniqueCurations > MAX_CURATIONS) {
    profile.stats.curationsShown = MAX_CURATIONS
    profile.stats.curationsTotal = totalUniqueCurations
  }

  // Strip full articles from treasuries — keep metadata + complete title index
  // Treasury names/descriptions are user-curated category labels (e.g. "Films I liked")
  // The title list gives AI agents full awareness of what's in each category
  profile.treasuries = profile.treasuries.map(({ articles, ...meta }) => ({
    ...meta,
    titles: (articles || []).map(a => a.title)
  }))

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
    const url = `${API_BASE}/client/article/space/info/${encodeURIComponent(namespace)}`
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cf: { cacheTtl: 300 } // Cache for 5 minutes
    })
    if (!response.ok) {
      console.error(`[fetchTreasurySeoData] Failed to fetch ${namespace}: ${response.status}`)
      return null
    }
    const data = await response.json()
    if (data.status === 1 && data.data?.seoDataByAi) {
      const seoData = parseSeoData(data.data.seoDataByAi)
      return seoData
    }
    return null
  } catch (error) {
    console.error(`[fetchTreasurySeoData] Error for ${namespace}:`, error)
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

  // Parse AI-generated SEO data from treasury object (comes from pageMySpaces API)
  const seoData = parseSeoData(treasury.seoDataByAi) || {}

  const baseData = {
    name: displayName,
    description: seoData.description || treasury.description || null,
    url: `${SITE_URL}/treasury/${treasury.namespace}`,
    articleCount: treasury.articleCount || 0,
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
      // Full access - skip fetch for empty treasuries
      if (!treasury.articleCount) {
        return { ...baseData, articles: [] }
      }
      const articles = treasury.id ? await fetchTreasuryArticles(treasury.id) : []
      if (!Array.isArray(articles)) {
        return { ...baseData, articles: [] }
      }
      return {
        ...baseData,
        articles: articles.map(article => {
          return {
            title: article.title,
            uuid: article.uuid,
            url: `${SITE_URL}/work/${article.uuid}`,
            curationNote: article.content || null, // The curator's reason/note
            originalUrl: article.targetUrl || null,
            format: detectFormat(article.targetUrl), // Auto-detected: article, video, tool, podcast, film, book, game, etc.
            category: article.categoryInfo?.name || null,
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
    return {
      title: article.title,
      uuid: article.uuid,
      url: `${SITE_URL}/work/${article.uuid}`,
      // No curation note for teaser - that's the valuable part
      format: detectFormat(article.targetUrl),
      category: article.categoryInfo?.name || null,
    }
  })
}

/**
 * Generate an AI-friendly summary of the user's taste
 * Includes counts of public/private/paid treasuries and top interest tags
 */
function generateSummary(userInfo, treasuries) {
  const treasuryNames = treasuries
    .filter(t => t.articleCount > 0)
    .map(t => t.name)

  const total = userInfo.statistics?.publicArticleCount || 0

  if (total === 0) return `${userInfo.username} hasn't curated anything yet.`

  let summary = `${userInfo.username} — ${total} curations`
  if (userInfo.bio) summary += `. ${userInfo.bio}`
  if (treasuryNames.length > 0) summary += `. Categories: ${treasuryNames.join(', ')}`

  return summary
}
