// llms.txt - Machine-readable documentation for LLMs

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

  const llmsTxt = `# Copus - The Internet Treasure Map
# Human-curated content discovery platform

## QUICK START
Search: ${config.siteUrl}/api/search?q=YOUR_QUERY

## SEARCH EXAMPLES
- ${config.siteUrl}/api/search?q=AI+tools
- ${config.siteUrl}/api/search?q=watermark+remover
- ${config.siteUrl}/api/search?q=free+software
- ${config.siteUrl}/api/search?q=Linux+tools

## CATEGORIES
- ${config.siteUrl}/api/search?q=&category=Technology
- ${config.siteUrl}/api/search?q=&category=Art
- ${config.siteUrl}/api/search?q=&category=Sports
- ${config.siteUrl}/api/search?q=&category=Life

## ENDPOINTS
- /api/search?q=QUERY - Search curations (JSON-LD)
- /work/{id}?format=json - Article details (JSON-LD)
- /articles.txt - Plain text article list
- /sitemap.xml - XML sitemap
- /ai - AI documentation page

## CONTENT GUIDES
- /pages/what-is-content-curation - What is Content Curation (Complete Guide)
- /pages/best-content-curation-tools-2026 - Best Content Curation Tools 2026
- /pages/copus-vs-arena - Copus vs Are.na Comparison
- /pages/copus-vs-raindrop - Copus vs Raindrop.io Comparison
- /pages/copus-vs-pocket - Copus vs Pocket Comparison
- /pages/web3-content-curation-platform - Web3 Content Curation Platform
- /pages/arena-alternatives - Are.na Alternatives
- /pages/curation-tools-for-researchers - Curation Tools for Researchers

## ABOUT
Copus is a platform where humans curate and share valuable internet resources.
Each curation includes:
- The original URL being recommended
- Curator's note explaining why it's valuable
- Key takeaways and facts
- Curator credibility information

## RESPONSE FORMAT
Search returns JSON-LD with schema.org types:
- @type: SearchResultsPage
- itemListElement: Array of articles with title, URL, description

## CONTACT
Website: ${config.siteUrl}
`

  return new Response(llmsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
