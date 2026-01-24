// Pre-built topic pages for AI agents
// ChatGPT cannot construct URLs with query params, so we create direct topic pages

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    apiBase: isTest ? 'https://api-test.copus.network' : 'https://api-prod.copus.network',
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

// Map URL-friendly topic slugs to search queries
const TOPIC_QUERIES = {
  'personal-growth': 'personal growth',
  'self-improvement': 'self improvement',
  'mindfulness': 'mindfulness',
  'productivity': 'productivity',
  'ai-tools': 'AI tools',
  'free-software': 'free software',
  'linux': 'Linux',
  'watermark-remover': 'watermark remover',
  'technology': 'technology',
  'art': 'art',
  'design': 'design',
  'health': 'health',
  'mental-health': 'mental health',
  'wellness': 'wellness',
  'creativity': 'creativity',
  'learning': 'learning',
  'books': 'books',
  'tools': 'tools',
  'software': 'software',
  'open-source': 'open source'
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  // Get topic from URL path
  const topic = context.params.topic
  const query = TOPIC_QUERIES[topic] || topic.replace(/-/g, ' ')

  try {
    // Search for this topic
    const apiUrl = `${config.apiBase}/client/search?q=${encodeURIComponent(query)}&limit=50`
    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' }
    })

    let articles = []
    let total = 0

    if (response.ok) {
      const data = await response.json()
      if (data.status === 1 && data.data) {
        articles = data.data.results || []
        total = data.data.total || 0
      }
    }

    // Build HTML page with results
    const articlesHtml = articles.length > 0
      ? articles.map((article, index) => {
          const authorInfo = article.authorInfo || article.author || {}
          return `
            <article>
              <h3>${index + 1}. <a href="${config.siteUrl}/work/${article.uuid}">${escapeHtml(article.title)}</a></h3>
              <p><strong>Category:</strong> ${escapeHtml(article.category || 'General')}</p>
              ${article.description ? `<p><strong>Description:</strong> ${escapeHtml(article.description)}</p>` : ''}
              ${article.keywords?.length ? `<p><strong>Keywords:</strong> ${escapeHtml(article.keywords.join(', '))}</p>` : ''}
              <p><strong>Original source:</strong> <a href="${article.targetUrl}">${escapeHtml(article.targetUrl || '')}</a></p>
              <p><strong>Curated by:</strong> ${escapeHtml(authorInfo.username || 'Anonymous')}</p>
              <p><strong>JSON:</strong> <a href="${config.siteUrl}/work/${article.uuid}?format=json">${config.siteUrl}/work/${article.uuid}?format=json</a></p>
            </article>
            <hr>`
        }).join('\n')
      : '<p>No content found for this topic yet. Try browsing <a href="/topics">all topics</a>.</p>'

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(query)} - Copus Curated Content</title>
  <meta name="description" content="Human-curated ${query} content recommendations on Copus. ${total} results found.">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #f23a00; }
    a { color: #f23a00; }
    article { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
    article h3 { margin-top: 0; }
    hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    .nav { margin-bottom: 20px; }
    .nav a { margin-right: 15px; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="${config.siteUrl}">Home</a>
    <a href="${config.siteUrl}/topics">All Topics</a>
    <a href="${config.siteUrl}/articles.txt">All Articles</a>
  </nav>

  <h1>${escapeHtml(query)} on Copus</h1>
  <p><strong>${total} curated recommendations found.</strong></p>
  <p>These are human-curated content recommendations about ${escapeHtml(query)}.</p>

  <section>
    <h2>Results</h2>
    ${articlesHtml}
  </section>

  <section>
    <h2>Related Topics</h2>
    <ul>
      <li><a href="${config.siteUrl}/topics/personal-growth">Personal Growth</a></li>
      <li><a href="${config.siteUrl}/topics/self-improvement">Self Improvement</a></li>
      <li><a href="${config.siteUrl}/topics/mindfulness">Mindfulness</a></li>
      <li><a href="${config.siteUrl}/topics/productivity">Productivity</a></li>
      <li><a href="${config.siteUrl}/topics/ai-tools">AI Tools</a></li>
      <li><a href="${config.siteUrl}/topics/free-software">Free Software</a></li>
    </ul>
  </section>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
    <p>Copus - The Internet Treasure Map</p>
    <p><a href="${config.siteUrl}/topics">Browse all topics</a> | <a href="${config.siteUrl}/articles.txt">All articles (text)</a></p>
  </footer>
</body>
</html>`

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    })

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
