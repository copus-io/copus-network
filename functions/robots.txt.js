// Dynamic robots.txt with AI-friendly directives

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  const robotsTxt = `# Copus - The Internet Treasure Map
# Human-curated content discovery platform

User-agent: *
Allow: /

# AI Agent Quick Access
# Search API: ${config.siteUrl}/api/search?q=YOUR_QUERY
# Articles: ${config.siteUrl}/articles.txt
# AI Docs: ${config.siteUrl}/ai

Sitemap: ${config.siteUrl}/sitemap.xml

# AI-specific bot directives
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /
`

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
