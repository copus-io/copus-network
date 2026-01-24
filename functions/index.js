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

  // SSR content for AI agents
  const ssrContent = `
    <div id="copus-ssr-homepage" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;">
      <header>
        <h1>Copus - The Internet Treasure Map</h1>
        <p>A human-curated content discovery platform where people recommend valuable internet resources.</p>
      </header>

      <section>
        <h2>What is Copus?</h2>
        <p>Copus is a platform where humans curate and recommend quality web content. Each curation includes:</p>
        <ul>
          <li>The original source URL being recommended</li>
          <li>A curator's note explaining why it's valuable</li>
          <li>AI-enhanced metadata (key takeaways, facts, target audience)</li>
          <li>Curator credibility information</li>
        </ul>
      </section>

      <section>
        <h2>For AI Agents: How to Access Content</h2>
        <p><strong>Search for curations:</strong></p>
        <pre>${config.siteUrl}/api/search?q=YOUR_QUERY</pre>
        <p>Example searches:</p>
        <ul>
          <li><a href="${config.siteUrl}/api/search?q=AI+tools">Search for AI tools</a></li>
          <li><a href="${config.siteUrl}/api/search?q=watermark+remover">Search for watermark remover</a></li>
          <li><a href="${config.siteUrl}/api/search?q=Linux">Search for Linux tools</a></li>
        </ul>

        <p><strong>Get article details:</strong></p>
        <pre>${config.siteUrl}/work/{article-id}?format=json</pre>

        <p><strong>Full documentation:</strong></p>
        <p><a href="${config.siteUrl}/ai">${config.siteUrl}/ai</a> - Complete AI agent documentation</p>
      </section>

      <section>
        <h2>Recent Curations</h2>
        <p>Here are recently curated content recommendations:</p>
        <ol>
          ${articlesHtml || '<li>Loading...</li>'}
        </ol>
      </section>

      <section>
        <h2>Categories</h2>
        <ul>
          <li><a href="${config.siteUrl}/api/search?q=&category=Technology">Technology</a> - Software, AI, developer tools</li>
          <li><a href="${config.siteUrl}/api/search?q=&category=Art">Art</a> - Creative tools, design resources</li>
          <li><a href="${config.siteUrl}/api/search?q=&category=Sports">Sports</a> - Sports content and tools</li>
          <li><a href="${config.siteUrl}/api/search?q=&category=Life">Life</a> - Lifestyle and productivity</li>
        </ul>
      </section>

      <section>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="${config.siteUrl}/api/search?q=">Search API</a> - Search all curated content</li>
          <li><a href="${config.siteUrl}/ai">AI Documentation</a> - Full guide for AI agents</li>
          <li><a href="${config.siteUrl}/sitemap.xml">Sitemap</a> - All article URLs</li>
          <li><a href="${config.siteUrl}/llms.txt">llms.txt</a> - LLM documentation</li>
        </ul>
      </section>

      <footer>
        <p>Copus - The Internet Treasure Map. Human-curated content for AI and human discovery.</p>
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
