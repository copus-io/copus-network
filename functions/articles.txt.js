// Plain text article list for AI agents
// Much easier to parse than XML sitemap

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

  // Fetch all articles
  const allArticles = []
  let pageIndex = 1
  const pageSize = 100

  try {
    while (pageIndex <= 10) { // Max 1000 articles
      const apiUrl = `${config.apiBase}/client/home/pageArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`
      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) break

      const json = await response.json()
      if (json.status !== 1 || !json.data?.data) break

      allArticles.push(...json.data.data)

      if (json.data.data.length < pageSize) break
      pageIndex++
    }
  } catch (e) {
    console.error('[articles.txt] Error:', e)
  }

  // Build plain text output with FULL content details
  let output = `# Copus Articles - Human-Curated Content Recommendations
# Total: ${allArticles.length} curated recommendations
# Topics: AI tools, productivity, personal growth, self-improvement, mindfulness, technology, art, free software
# Search: ${config.siteUrl}/api/search?q=YOUR_QUERY

`

  for (const article of allArticles) {
    const authorName = article.authorInfo?.username || 'Anonymous'
    const description = article.description || article.summary || ''
    const category = article.category || ''
    const keywords = article.keywords ? article.keywords.join(', ') : ''
    const targetUrl = article.targetUrl || ''

    output += `## ${article.title}
URL: ${config.siteUrl}/work/${article.uuid}
${category ? `Category: ${category}` : ''}
${description ? `Description: ${description}` : ''}
${keywords ? `Keywords: ${keywords}` : ''}
${targetUrl ? `Original Source: ${targetUrl}` : ''}
Curated by: ${authorName}

`
  }

  return new Response(output, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
