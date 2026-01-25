// AI Agent Discovery Page
// Simple, plain-text friendly page for AI agents to discover Copus content

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

  // Fetch some sample articles to show
  let sampleArticles = []
  try {
    const apiUrl = `${config.apiBase}/client/home/pageArticle?pageIndex=1&pageSize=5`
    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (response.ok) {
      const json = await response.json()
      if (json.status === 1 && json.data?.data) {
        sampleArticles = json.data.data
      }
    }
  } catch (e) {
    console.error('[AI Page] Error fetching samples:', e)
  }

  // Build sample articles HTML
  const samplesHtml = sampleArticles.map(article => `
    <li>
      <strong>${escapeHtml(article.title)}</strong><br>
      URL: <a href="${config.siteUrl}/work/${article.uuid}">${config.siteUrl}/work/${article.uuid}</a><br>
      JSON: <a href="${config.siteUrl}/work/${article.uuid}?format=json">${config.siteUrl}/work/${article.uuid}?format=json</a>
    </li>
  `).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copus - AI Agent Documentation</title>
  <meta name="description" content="Documentation for AI agents to discover and access Copus curated content">
  <meta name="robots" content="index, follow">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #f23a00; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    a { color: #f23a00; }
    .endpoint { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .endpoint h3 { margin-top: 0; }
  </style>
</head>
<body>
  <h1>Copus - AI Agent Documentation</h1>

  <p><strong>Copus</strong> is a human-curated content discovery platform. Users recommend valuable internet resources with context and insights.</p>

  <div class="endpoint" style="background: #e8f5e9; border: 2px solid #4caf50;">
    <h3>MCP Server (Recommended)</h3>
    <p>Use Copus directly in <strong>Claude Desktop, Cursor, Cline, Continue, Zed</strong>, and other MCP-compatible AI tools:</p>
    <pre>npx copus-mcp-server</pre>
    <p>Add to your MCP config:</p>
    <pre>{
  "mcpServers": {
    "copus": {
      "command": "npx",
      "args": ["copus-mcp-server"]
    }
  }
}</pre>
    <p>
      <a href="https://www.npmjs.com/package/copus-mcp-server">npm</a> |
      <a href="https://github.com/copus-io/copus-mcp-server">GitHub</a>
    </p>
  </div>

  <h2>Quick Start for AI Agents</h2>

  <div class="endpoint">
    <h3>1. Search for Content</h3>
    <p>Find curations by topic:</p>
    <pre>GET ${config.siteUrl}/api/search?q=YOUR_QUERY</pre>
    <p>Parameters:</p>
    <ul>
      <li><code>q</code> (required) - Search query</li>
      <li><code>category</code> (optional) - Technology, Art, Sports, Life</li>
      <li><code>limit</code> (optional) - Max results (default 10, max 50)</li>
    </ul>
    <p>Example: <a href="${config.siteUrl}/api/search?q=AI+tools">${config.siteUrl}/api/search?q=AI+tools</a></p>
  </div>

  <div class="endpoint">
    <h3>2. Get Article Details</h3>
    <p>Get structured JSON-LD data for any article:</p>
    <pre>GET ${config.siteUrl}/work/{article-id}?format=json</pre>
    <p>Returns: title, description, keywords, key takeaways, curator credibility, engagement metrics</p>
  </div>

  <div class="endpoint">
    <h3>3. Browse All Content</h3>
    <p>Sitemap with all ${sampleArticles.length > 0 ? '150+' : ''} curated articles:</p>
    <pre><a href="${config.siteUrl}/sitemap.xml">${config.siteUrl}/sitemap.xml</a></pre>
  </div>

  <h2>Sample Articles</h2>
  <p>Here are some recent curations you can access:</p>
  <ol>
    ${samplesHtml || '<li>No samples available</li>'}
  </ol>

  <h2>All Endpoints</h2>
  <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
    <tr>
      <th>Endpoint</th>
      <th>Description</th>
    </tr>
    <tr>
      <td><a href="${config.siteUrl}/api/search?q=example">/api/search?q=QUERY</a></td>
      <td>Search curations by topic</td>
    </tr>
    <tr>
      <td>/work/{id}?format=json</td>
      <td>Get article as JSON-LD</td>
    </tr>
    <tr>
      <td><a href="${config.siteUrl}/sitemap.xml">/sitemap.xml</a></td>
      <td>All article URLs</td>
    </tr>
    <tr>
      <td><a href="${config.siteUrl}/llms.txt">/llms.txt</a></td>
      <td>LLM documentation</td>
    </tr>
    <tr>
      <td><a href="${config.siteUrl}/.well-known/ai-plugin.json">/.well-known/ai-plugin.json</a></td>
      <td>ChatGPT plugin manifest</td>
    </tr>
    <tr>
      <td><a href="${config.siteUrl}/.well-known/openapi.yaml">/.well-known/openapi.yaml</a></td>
      <td>OpenAPI specification</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/copus-mcp-server">npx copus-mcp-server</a></td>
      <td>MCP Server for Claude, Cursor, Cline, etc.</td>
    </tr>
  </table>

  <h2>Response Format</h2>
  <p>Search results return JSON-LD with schema.org types:</p>
  <pre>{
  "@context": "https://schema.org",
  "@type": "SearchResultsPage",
  "query": "AI tools",
  "totalResults": 5,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Article",
        "url": "${config.siteUrl}/work/abc123",
        "name": "Article Title",
        "description": "...",
        "jsonEndpoint": "${config.siteUrl}/work/abc123?format=json"
      }
    }
  ]
}</pre>

  <h2>Categories</h2>
  <ul>
    <li><a href="${config.siteUrl}/api/search?q=&category=Technology">Technology</a></li>
    <li><a href="${config.siteUrl}/api/search?q=&category=Art">Art</a></li>
    <li><a href="${config.siteUrl}/api/search?q=&category=Sports">Sports</a></li>
    <li><a href="${config.siteUrl}/api/search?q=&category=Life">Life</a></li>
  </ul>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
    <p>Copus - The Internet Treasure Map</p>
    <p><a href="${config.siteUrl}">Visit Copus</a> | <a href="${config.siteUrl}/llms.txt">llms.txt</a></p>
  </footer>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
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
