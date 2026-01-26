// Search API Proxy for AI Agents
// Returns JSON-LD formatted search results for AI discoverability

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

  // Get search parameters
  const q = url.searchParams.get('q') || ''
  const category = url.searchParams.get('category')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  try {
    let apiUrl
    let isSearchMode = false

    if (q.trim()) {
      // Search mode - use search endpoint
      isSearchMode = true
      apiUrl = `${config.apiBase}/client/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
      if (category) {
        apiUrl += `&category=${encodeURIComponent(category)}`
      }
    } else {
      // Browse mode - return recent articles (no query needed)
      apiUrl = `${config.apiBase}/client/home/pageArticle?pageIndex=${Math.floor(offset / limit) + 1}&pageSize=${limit}`
    }

    // Fetch from backend
    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 1 || !data.data) {
      throw new Error('Invalid API response')
    }

    // Handle both search results and browse results
    const rawArticles = isSearchMode ? data.data.results : data.data.data
    const total = isSearchMode ? data.data.total : (data.data.total || rawArticles.length)

    // Transform to JSON-LD format for AI agents
    const results = rawArticles.map(article => {
      const authorInfo = article.authorInfo || article.author || {}
      return {
        '@type': 'Article',
        'identifier': article.uuid,
        'url': `${config.siteUrl}/work/${article.uuid}`,
        'name': article.title,
        'description': article.description || article.summary || '',
        'originalSource': article.targetUrl,
        'category': article.category,
        'keywords': article.keywords || [],
        'author': {
          '@type': 'Person',
          'name': authorInfo.username || 'Anonymous',
          'url': `${config.siteUrl}/u/${authorInfo.namespace || ''}`
        },
        'datePublished': article.publishAt
          ? new Date(article.publishAt * 1000).toISOString()
          : new Date(article.createTime || Date.now()).toISOString(),
        'interactionStatistic': [
          {
            '@type': 'InteractionCounter',
            'interactionType': 'https://schema.org/ViewAction',
            'userInteractionCount': article.viewCount || 0
          },
          {
            '@type': 'InteractionCounter',
            'interactionType': 'https://schema.org/BookmarkAction',
            'userInteractionCount': article.likeCount || 0
          }
        ],
        'jsonEndpoint': `${config.siteUrl}/work/${article.uuid}?format=json`
      }
    })

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': isSearchMode ? 'SearchResultsPage' : 'CollectionPage',
      'name': isSearchMode ? `Search: ${q}` : 'Recent Curations on Copus',
      'description': isSearchMode
        ? `Search results for "${q}" on Copus`
        : 'Browse recent human-curated content recommendations',
      'query': q || null,
      'totalResults': total,
      'numberOfItems': results.length,
      'itemListElement': results.map((item, index) => ({
        '@type': 'ListItem',
        'position': offset + index + 1,
        'item': item
      })),
      'provider': {
        '@type': 'Organization',
        'name': 'Copus',
        'url': config.siteUrl,
        'description': 'Human-curated content discovery platform - The Internet Treasure Map'
      },
      'pagination': {
        'offset': offset,
        'limit': limit,
        'hasMore': offset + results.length < total,
        'nextPage': offset + results.length < total
          ? `${config.siteUrl}/api/search?${q ? `q=${encodeURIComponent(q)}&` : ''}${category ? `category=${encodeURIComponent(category)}&` : ''}limit=${limit}&offset=${offset + limit}`
          : null
      },
      'searchSuggestions': isSearchMode ? null : {
        'note': 'Try searching for specific topics:',
        'examples': [
          `${config.siteUrl}/api/search?q=AI+tools`,
          `${config.siteUrl}/api/search?q=personal+growth`,
          `${config.siteUrl}/api/search?q=productivity`,
          `${config.siteUrl}/api/search?q=watermark+remover`,
          `${config.siteUrl}/api/search?q=free+software`
        ],
        'categories': ['Technology', 'Art', 'Sports', 'Life']
      }
    }

    return new Response(JSON.stringify(jsonLd, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Search failed',
      message: error.message
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
