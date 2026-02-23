// Search page - helps AI agents discover and use the search API

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

  // Check if there's a query parameter
  const query = url.searchParams.get('q')

  // If query provided, redirect to API
  if (query) {
    const apiUrl = `${config.siteUrl}/api/search?q=${encodeURIComponent(query)}`
    return Response.redirect(apiUrl, 302)
  }

  // Otherwise show search page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Search Copus - Find Curated Content</title>
  <meta name="description" content="Search human-curated content recommendations on Copus">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    h1 { color: #f23a00; }
    input[type="text"] { width: 100%; padding: 15px; font-size: 18px; border: 2px solid #ddd; border-radius: 5px; }
    button { padding: 15px 30px; font-size: 18px; background: #f23a00; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; }
    .examples { margin-top: 30px; }
    .examples a { display: block; margin: 10px 0; color: #f23a00; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>Search Copus</h1>
  <p>Find human-curated content recommendations.</p>

  <form action="/search" method="get">
    <input type="text" name="q" placeholder="Search for AI tools, watermark remover, Linux..." autofocus>
    <button type="submit">Search</button>
  </form>

  <div class="examples">
    <h3>Popular Searches:</h3>
    <a href="/search?q=AI+tools">AI tools</a>
    <a href="/search?q=watermark+remover">Watermark remover</a>
    <a href="/search?q=Linux">Linux tools</a>
    <a href="/search?q=free+software">Free software</a>
  </div>

  <div class="examples">
    <h3>For AI Agents:</h3>
    <p>Use the search API directly:</p>
    <pre>GET ${config.siteUrl}/api/search?q=YOUR_QUERY</pre>
    <p>Or use this page with query parameter:</p>
    <pre>GET ${config.siteUrl}/search?q=YOUR_QUERY</pre>
    <p>Both return JSON-LD formatted results.</p>
  </div>

  <p style="margin-top: 40px;"><a href="${config.siteUrl}">← Back to Copus</a> | <a href="${config.siteUrl}/ai">AI Documentation</a></p>
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
