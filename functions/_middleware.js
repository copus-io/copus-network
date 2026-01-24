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

  // Fetch MORE articles for the SSR content (50 articles for better coverage)
  let recentArticles = []
  try {
    const apiUrl = `${config.apiBase}/client/home/pageArticle?pageIndex=1&pageSize=50`
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

  // Build RICH articles HTML with descriptions for AI readability
  const articlesHtml = recentArticles.map((article, index) => {
    const authorName = article.authorInfo?.username || 'Anonymous'
    const description = article.description || article.summary || ''
    const category = article.category || 'Uncategorized'
    const keywords = article.keywords ? article.keywords.join(', ') : ''
    return `
      <article>
        <h3>${index + 1}. <a href="${config.siteUrl}/work/${article.uuid}">${escapeHtml(article.title)}</a></h3>
        <p><strong>Category:</strong> ${escapeHtml(category)}</p>
        ${description ? `<p><strong>Description:</strong> ${escapeHtml(description)}</p>` : ''}
        ${keywords ? `<p><strong>Keywords:</strong> ${escapeHtml(keywords)}</p>` : ''}
        <p><strong>Curated by:</strong> ${escapeHtml(authorName)}</p>
        <p><strong>Link:</strong> <a href="${config.siteUrl}/work/${article.uuid}">${config.siteUrl}/work/${article.uuid}</a></p>
      </article>`
  }).join('\n')

  // SSR content for AI agents - CONTENT FIRST, then API
  const ssrContent = `
    <div id="copus-ssr-homepage" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;">
      <header>
        <h1>Copus - The Internet Treasure Map</h1>
        <p>Human-curated content discovery platform with ${recentArticles.length}+ recommendations.</p>
      </header>

      <nav>
        <h2>Browse by Topic (click to view content)</h2>
        <ul>
          <li><a href="${config.siteUrl}/topics/personal-growth">Personal Growth</a> - Self-development, emotional growth</li>
          <li><a href="${config.siteUrl}/topics/self-improvement">Self Improvement</a> - Skills, habits, becoming better</li>
          <li><a href="${config.siteUrl}/topics/mindfulness">Mindfulness</a> - Meditation, awareness</li>
          <li><a href="${config.siteUrl}/topics/mental-health">Mental Health</a> - Psychological wellbeing</li>
          <li><a href="${config.siteUrl}/topics/productivity">Productivity</a> - Getting things done</li>
          <li><a href="${config.siteUrl}/topics/ai-tools">AI Tools</a> - Artificial intelligence</li>
          <li><a href="${config.siteUrl}/topics/free-software">Free Software</a> - Open source tools</li>
          <li><a href="${config.siteUrl}/topics/linux">Linux</a> - Linux tools and tutorials</li>
          <li><a href="${config.siteUrl}/topics/technology">Technology</a> - Tech tools and news</li>
          <li><a href="${config.siteUrl}/topics/art">Art</a> - Creative resources</li>
          <li><a href="${config.siteUrl}/topics/health">Health</a> - Wellness and fitness</li>
        </ul>
        <p><a href="${config.siteUrl}/topics">View all topics</a></p>
      </nav>

      <main>
        <h2>Curated Content on Copus (${recentArticles.length} articles)</h2>
        <p>Below are human-curated recommendations. Each includes the original URL, curator's insights, and why it's valuable.</p>
        ${articlesHtml || '<p>No articles available</p>'}
      </main>

      <section>
        <h2>Search for More Content</h2>
        <p>Use the search API to find specific topics:</p>
        <pre>${config.siteUrl}/api/search?q=YOUR_QUERY</pre>
        <p>Example searches:</p>
        <ul>
          <li><a href="${config.siteUrl}/api/search?q=AI+tools">AI tools</a></li>
          <li><a href="${config.siteUrl}/api/search?q=personal+growth">Personal growth</a></li>
          <li><a href="${config.siteUrl}/api/search?q=productivity">Productivity</a></li>
          <li><a href="${config.siteUrl}/api/search?q=mindfulness">Mindfulness</a></li>
          <li><a href="${config.siteUrl}/api/search?q=self+improvement">Self improvement</a></li>
          <li><a href="${config.siteUrl}/api/search?q=free+software">Free software</a></li>
        </ul>
        <p>Categories: <a href="${config.siteUrl}/api/search?q=&category=Technology">Technology</a> | <a href="${config.siteUrl}/api/search?q=&category=Art">Art</a> | <a href="${config.siteUrl}/api/search?q=&category=Sports">Sports</a> | <a href="${config.siteUrl}/api/search?q=&category=Life">Life</a></p>
      </section>

      <footer>
        <p>Copus - Human-curated content for AI and human discovery.</p>
        <p>More: <a href="${config.siteUrl}/articles.txt">All articles (text)</a> | <a href="${config.siteUrl}/sitemap.xml">Sitemap</a></p>
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
