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
  const q = url.searchParams.get('q')
  const category = url.searchParams.get('category')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  if (!q) {
    return new Response(JSON.stringify({
      error: 'Missing required parameter: q',
      usage: {
        endpoint: `${config.siteUrl}/api/search`,
        parameters: {
          q: 'Search query (required)',
          category: 'Filter by category: Technology, Art, Sports, Life (optional)',
          limit: 'Number of results, max 50 (default: 10)',
          offset: 'Pagination offset (default: 0)'
        },
        example: `${config.siteUrl}/api/search?q=AI+tools&category=Technology&limit=10`
      }
    }, null, 2), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Build API URL
    let apiUrl = `${config.apiBase}/client/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
    if (category) {
      apiUrl += `&category=${encodeURIComponent(category)}`
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

    // Transform to JSON-LD format for AI agents
    const results = data.data.results.map(article => ({
      '@type': 'Article',
      'identifier': article.uuid,
      'url': `${config.siteUrl}/work/${article.uuid}`,
      'name': article.title,
      'description': article.description,
      'originalSource': article.targetUrl,
      'category': article.category,
      'keywords': article.keywords,
      'author': {
        '@type': 'Person',
        'name': article.author.username,
        'url': `${config.siteUrl}/u/${article.author.namespace}`
      },
      'datePublished': new Date(article.publishAt * 1000).toISOString(),
      'interactionStatistic': [
        {
          '@type': 'InteractionCounter',
          'interactionType': 'https://schema.org/ViewAction',
          'userInteractionCount': article.viewCount
        },
        {
          '@type': 'InteractionCounter',
          'interactionType': 'https://schema.org/BookmarkAction',
          'userInteractionCount': article.likeCount
        }
      ],
      'jsonEndpoint': `${config.siteUrl}/work/${article.uuid}?format=json`
    }))

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      'query': q,
      'totalResults': data.data.total,
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
        'hasMore': offset + results.length < data.data.total,
        'nextPage': offset + results.length < data.data.total
          ? `${config.siteUrl}/api/search?q=${encodeURIComponent(q)}${category ? `&category=${encodeURIComponent(category)}` : ''}&limit=${limit}&offset=${offset + limit}`
          : null
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
