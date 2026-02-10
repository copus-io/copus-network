// Curator Discovery API
// Endpoint: /api/discover?topic=X
// Returns curators with expertise in a given topic
//
// How it works:
// 1. Search articles matching the topic
// 2. Aggregate by curator (author)
// 3. Enrich with curator info and matching treasuries
// 4. Return ranked by relevance

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    apiBase: isTest ? 'https://api-test.copus.network' : 'https://api-prod.copus.network',
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  const topic = url.searchParams.get('topic') || url.searchParams.get('q') || ''
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 20)

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=600' // Cache 10 minutes
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  if (!topic.trim()) {
    return new Response(JSON.stringify({
      error: 'Missing topic parameter',
      usage: '/api/discover?topic=AI+tools',
      examples: [
        '/api/discover?topic=crypto',
        '/api/discover?topic=personal+growth',
        '/api/discover?topic=productivity',
        '/api/discover?topic=AI'
      ]
    }, null, 2), { status: 400, headers })
  }

  try {
    // Search for articles matching the topic
    const searchResponse = await fetch(
      `${config.apiBase}/client/search?q=${encodeURIComponent(topic)}&limit=100`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!searchResponse.ok) {
      throw new Error(`Search API returned ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    if (searchData.status !== 1 || !searchData.data?.results) {
      return new Response(JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Curators for: ${topic}`,
        description: `No curators found for "${topic}". Try a different search term.`,
        numberOfItems: 0,
        itemListElement: []
      }, null, 2), { headers })
    }

    const articles = searchData.data.results

    // Aggregate by curator
    const curatorMap = new Map()

    for (const article of articles) {
      const author = article.authorInfo || article.author
      if (!author?.namespace) continue

      const namespace = author.namespace

      if (!curatorMap.has(namespace)) {
        curatorMap.set(namespace, {
          namespace,
          username: author.username || namespace,
          avatar: author.faceUrl || null,
          matchingArticles: [],
          treasuries: new Set(),
          categories: {},
          keywords: new Set()
        })
      }

      const curator = curatorMap.get(namespace)
      curator.matchingArticles.push({
        title: article.title,
        uuid: article.uuid,
        url: `${config.siteUrl}/work/${article.uuid}`
      })

      // Track treasury if available
      if (article.spaceInfo?.namespace) {
        curator.treasuries.add(article.spaceInfo.namespace)
      }

      // Track categories
      const category = article.categoryInfo?.name || article.category
      if (category) {
        curator.categories[category] = (curator.categories[category] || 0) + 1
      }

      // Track keywords
      if (article.keywords && Array.isArray(article.keywords)) {
        article.keywords.forEach(k => curator.keywords.add(k))
      }
    }

    // Fetch additional curator info and rank by relevance
    const curators = Array.from(curatorMap.values())
      .sort((a, b) => b.matchingArticles.length - a.matchingArticles.length)
      .slice(0, limit)

    // Enrich with full curator info
    const enrichedCurators = await Promise.all(
      curators.map(async (curator) => {
        const userInfo = await fetchUserInfo(config.apiBase, curator.namespace)
        const treasuryInfo = await fetchCuratorTreasuries(config.apiBase, config.siteUrl, curator.namespace, topic)

        return {
          '@type': 'Person',
          name: userInfo?.username || curator.username,
          namespace: curator.namespace,
          url: `${config.siteUrl}/user/${curator.namespace}`,
          shortUrl: `${config.siteUrl}/u/${curator.namespace}`,
          tasteProfileUrl: `${config.siteUrl}/api/taste/${curator.namespace}.json`,
          avatar: userInfo?.faceUrl || curator.avatar,
          bio: userInfo?.bio || null,
          stats: {
            totalCurations: userInfo?.statistics?.articleCount || 0,
            matchingCurations: curator.matchingArticles.length,
            relevanceScore: calculateRelevance(curator, articles.length)
          },
          topCategories: Object.entries(curator.categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({ name, count })),
          keywords: Array.from(curator.keywords).slice(0, 10),
          matchingTreasuries: treasuryInfo,
          sampleCurations: curator.matchingArticles.slice(0, 3)
        }
      })
    )

    const response = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Curators for: ${topic}`,
      description: `Human curators on Copus with expertise in "${topic}". Each curator has treasuries containing curated content on this topic.`,
      query: topic,
      numberOfItems: enrichedCurators.length,
      totalMatches: curatorMap.size,
      itemListElement: enrichedCurators.map((curator, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: curator
      })),
      _aiHints: {
        usage: 'These curators have demonstrated interest and expertise in this topic through their curations.',
        nextSteps: [
          'Visit tasteProfileUrl for full curator profile with all treasuries',
          'Visit matchingTreasuries[].url for curated content on this topic',
          'Use /api/search?q=TOPIC for content-focused results instead of curator-focused'
        ],
        relatedEndpoints: {
          search: `${config.siteUrl}/api/search?q=${encodeURIComponent(topic)}`,
          topics: `${config.siteUrl}/topics/`
        }
      },
      fetchedAt: new Date().toISOString()
    }

    return new Response(JSON.stringify(response, null, 2), { headers })

  } catch (error) {
    console.error('Discover API error:', error)
    return new Response(JSON.stringify({
      error: 'Discovery failed',
      message: error.message
    }, null, 2), { status: 500, headers })
  }
}

async function fetchUserInfo(apiBase, namespace) {
  try {
    const response = await fetch(
      `${apiBase}/client/userHome/userInfo?namespace=${encodeURIComponent(namespace)}`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    if (!response.ok) return null
    const data = await response.json()
    return data.status === 1 ? data.data : null
  } catch {
    return null
  }
}

async function fetchCuratorTreasuries(apiBase, siteUrl, namespace, topic) {
  try {
    // First get user ID
    const userInfo = await fetchUserInfo(apiBase, namespace)
    if (!userInfo?.id) return []

    // Fetch treasuries
    const response = await fetch(
      `${apiBase}/client/userHome/pageMySpaces?targetUserId=${userInfo.id}&pageIndex=1&pageSize=20`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    if (!response.ok) return []

    const data = await response.json()
    let treasuries = []
    if (data.data?.data && Array.isArray(data.data.data)) {
      treasuries = data.data.data
    } else if (Array.isArray(data.data)) {
      treasuries = data.data
    }

    // Filter and format treasuries that might match the topic
    const topicLower = topic.toLowerCase()

    return treasuries
      .map(t => {
        const seoData = parseSeoData(t.seoDataByAi) || {}
        const name = t.name || ''
        const description = seoData.description || t.description || ''
        const keywords = seoData.keywords || []
        const themes = seoData.keyThemes || []

        // Calculate relevance to topic
        const allText = [name, description, ...keywords, ...themes].join(' ').toLowerCase()
        const isRelevant = allText.includes(topicLower) ||
          keywords.some(k => k.toLowerCase().includes(topicLower)) ||
          themes.some(t => t.toLowerCase().includes(topicLower))

        return {
          name: t.spaceType === 1 ? `${userInfo.username}'s Treasury` :
                t.spaceType === 2 ? `${userInfo.username}'s Curations` : name,
          namespace: t.namespace,
          url: `${siteUrl}/treasury/${t.namespace}`,
          jsonUrl: `${siteUrl}/treasury/${t.namespace}?format=json`,
          articleCount: t.articleCount || 0,
          description: seoData.description || t.description || null,
          keywords: keywords.slice(0, 5),
          keyThemes: themes.slice(0, 3),
          isRelevant
        }
      })
      .filter(t => t.isRelevant || t.articleCount > 0)
      .sort((a, b) => (b.isRelevant ? 1 : 0) - (a.isRelevant ? 1 : 0))
      .slice(0, 5)

  } catch (error) {
    console.error('Failed to fetch treasuries:', error)
    return []
  }
}

function parseSeoData(seoDataString) {
  if (!seoDataString) return null
  try {
    const parsed = JSON.parse(seoDataString)
    return typeof parsed === 'string' ? { description: parsed } : parsed
  } catch {
    return null
  }
}

function calculateRelevance(curator, totalArticles) {
  // Simple relevance score based on matching article ratio
  const matchRatio = curator.matchingArticles.length / Math.max(totalArticles, 1)
  return Math.round(matchRatio * 100) / 100
}
