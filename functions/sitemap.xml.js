// Dynamic Sitemap Generator for Copus
// Helps search engines and AI crawlers discover all content

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    apiBase: isTest ? 'https://api-test.copus.network' : 'https://api-prod.copus.network',
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

function formatDate(timestamp) {
  if (!timestamp || isNaN(timestamp)) return null
  try {
    const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000
    const date = new Date(ms)
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  // Fetch all articles (paginated)
  const allArticles = []
  let pageIndex = 1
  const pageSize = 100
  let hasMore = true

  try {
    while (hasMore && pageIndex <= 50) { // Safety limit: 5000 articles max
      const apiUrl = `${config.apiBase}/client/home/pageArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`
      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) break

      const json = await response.json()
      if (json.status !== 1 || !json.data?.data) break

      const articles = json.data.data
      allArticles.push(...articles)

      // Check if there are more pages
      hasMore = articles.length === pageSize && allArticles.length < json.data.totalCount
      pageIndex++
    }
  } catch (e) {
    console.error('[Sitemap] Error fetching articles:', e)
  }

  // Generate sitemap XML
  const urls = []

  // Add homepage
  urls.push({
    loc: config.siteUrl,
    changefreq: 'daily',
    priority: '1.0'
  })

  // Add discovery page
  urls.push({
    loc: `${config.siteUrl}/discovery`,
    changefreq: 'hourly',
    priority: '0.9'
  })

  // Add all articles
  for (const article of allArticles) {
    if (!article.uuid) continue

    const lastmod = formatDate(article.publishAt || article.createAt)
    urls.push({
      loc: `${config.siteUrl}/work/${article.uuid}`,
      lastmod,
      changefreq: 'weekly',
      priority: '0.8'
    })
  }

  // Build XML
  const xmlUrls = urls.map(u => {
    let entry = `  <url>\n    <loc>${escapeXml(u.loc)}</loc>`
    if (u.lastmod) entry += `\n    <lastmod>${u.lastmod}</lastmod>`
    if (u.changefreq) entry += `\n    <changefreq>${u.changefreq}</changefreq>`
    if (u.priority) entry += `\n    <priority>${u.priority}</priority>`
    entry += `\n  </url>`
    return entry
  }).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  })
}

function escapeXml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
