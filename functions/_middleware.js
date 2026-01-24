// Homepage SSR for AI Agents
// Injects readable content into the homepage for AI crawlers

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    apiBase: isTest ? 'https://api-test.copus.network' : 'https://api-prod.copus.network',
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

export async function onRequest(context) {
  const { next } = context
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  // Only process homepage (/ or /home)
  const path = url.pathname
  if (path !== '/' && path !== '/home' && path !== '/index.html') {
    return next()
  }

  // Get original response
  const response = await next()

  // Skip non-HTML responses
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    return response
  }

  // Fetch recent articles for the SSR content
  let recentArticles = []
  try {
    const apiUrl = `${config.apiBase}/client/home/pageArticle?pageIndex=1&pageSize=10`
    const apiResponse = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (apiResponse.ok) {
      const json = await apiResponse.json()
      if (json.status === 1 && json.data?.data) {
        recentArticles = json.data.data
      }
    }
  } catch (e) {
    console.error('[Homepage SSR] Error fetching articles:', e)
  }

  // Build recent articles HTML
  const articlesHtml = recentArticles.map(article => {
    const authorName = article.authorInfo?.username || 'Anonymous'
    return `
      <li>
        <a href="${config.siteUrl}/work/${article.uuid}">${escapeHtml(article.title)}</a>
        - curated by ${escapeHtml(authorName)}
        (<a href="${config.siteUrl}/work/${article.uuid}?format=json">JSON</a>)
      </li>`
  }).join('\n')

  // SSR content for AI agents - SEARCH API FIRST for speed
  const ssrContent = `
    <div id="copus-ssr-homepage" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;">
      <nav>
        <strong>SEARCH API:</strong> <a href="${config.siteUrl}/api/search?q=YOUR_QUERY">${config.siteUrl}/api/search?q=YOUR_QUERY</a>
      </nav>

      <section>
        <h2>Search Copus Content</h2>
        <p>Find curated recommendations instantly:</p>
        <ul>
          <li><a href="${config.siteUrl}/api/search?q=AI+tools">AI tools</a></li>
          <li><a href="${config.siteUrl}/api/search?q=personal+growth">Personal growth</a></li>
          <li><a href="${config.siteUrl}/api/search?q=productivity">Productivity</a></li>
          <li><a href="${config.siteUrl}/api/search?q=watermark+remover">Watermark remover</a></li>
          <li><a href="${config.siteUrl}/api/search?q=free+software">Free software</a></li>
          <li><a href="${config.siteUrl}/api/search?q=Linux">Linux tools</a></li>
          <li><a href="${config.siteUrl}/api/search?q=mindfulness">Mindfulness</a></li>
          <li><a href="${config.siteUrl}/api/search?q=self+improvement">Self improvement</a></li>
        </ul>
        <p>Categories: <a href="${config.siteUrl}/api/search?q=&category=Technology">Technology</a> | <a href="${config.siteUrl}/api/search?q=&category=Art">Art</a> | <a href="${config.siteUrl}/api/search?q=&category=Sports">Sports</a> | <a href="${config.siteUrl}/api/search?q=&category=Life">Life</a></p>
        <p>Browse all: <a href="${config.siteUrl}/api/search">${config.siteUrl}/api/search</a> (no query = recent articles)</p>
      </section>

      <header>
        <h1>Copus - The Internet Treasure Map</h1>
        <p>Human-curated content discovery. ${recentArticles.length}+ recommendations available.</p>
      </header>

      <section>
        <h2>Recent Curations</h2>
        <ol>
          ${articlesHtml || '<li>Loading...</li>'}
        </ol>
      </section>

      <section>
        <h2>API Endpoints</h2>
        <ul>
          <li><a href="${config.siteUrl}/api/search?q=">/api/search?q=QUERY</a> - Search curations (JSON-LD)</li>
          <li><a href="${config.siteUrl}/search">/search</a> - Search page</li>
          <li><a href="${config.siteUrl}/articles.txt">/articles.txt</a> - Plain text article list</li>
          <li>/work/{id}?format=json - Article as JSON-LD</li>
          <li><a href="${config.siteUrl}/ai">/ai</a> - AI documentation</li>
          <li><a href="${config.siteUrl}/sitemap.xml">/sitemap.xml</a> - XML sitemap</li>
        </ul>
      </section>

      <footer>
        <p>Copus - Human-curated content for AI and human discovery.</p>
      </footer>
    </div>
  `

  // Inject SSR content into body
  return new HTMLRewriter()
    .on('body', {
      element(el) {
        el.prepend(ssrContent, { html: true })
      }
    })
    .transform(response)
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
