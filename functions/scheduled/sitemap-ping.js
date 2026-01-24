// Automated Sitemap Ping for Search Engines
// Runs on a schedule to notify Bing of sitemap updates
//
// Note: Google deprecated their /ping endpoint in 2023.
// Google indexing now happens via:
// - Natural crawling (following robots.txt and sitemap.xml)
// - Google Search Console API (manual submission)
//
// This function can be:
// 1. Called manually via /scheduled/sitemap-ping
// 2. Triggered by GitHub Actions (daily cron)
// 3. Called from backend when new articles are published

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)
  const SITEMAP_URL = `${config.siteUrl}/sitemap.xml`

  const SEARCH_ENGINES = [
    {
      name: 'Bing',
      pingUrl: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
      note: 'Bing sitemap ping',
    },
    {
      name: 'Bing-IndexNow',
      pingUrl: `https://www.bing.com/indexnow?url=${encodeURIComponent(SITEMAP_URL)}`,
      note: 'Bing IndexNow protocol (also notifies Yandex)',
    },
  ]

  const results = []
  const startTime = Date.now()

  for (const engine of SEARCH_ENGINES) {
    try {
      const response = await fetch(engine.pingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Copus-Sitemap-Pinger/1.0',
        },
      })

      results.push({
        engine: engine.name,
        status: response.status,
        success: response.ok || response.status === 202 || response.status === 203,
        message: response.ok ? 'Ping successful' : `HTTP ${response.status}`,
        note: engine.note,
      })
    } catch (error) {
      results.push({
        engine: engine.name,
        status: 0,
        success: false,
        message: error.message,
        note: engine.note,
      })
    }
  }

  const duration = Date.now() - startTime
  const anySuccess = results.some(r => r.success)

  const responseData = {
    timestamp: new Date().toISOString(),
    sitemap: SITEMAP_URL,
    duration: `${duration}ms`,
    success: anySuccess,
    results,
    notes: {
      google: 'Google deprecated /ping in 2023. Indexing via natural crawling + Search Console.',
      bing: 'Bing supports both /ping and IndexNow protocols.',
    },
  }

  console.log('[Sitemap Ping]', JSON.stringify(responseData))

  return new Response(JSON.stringify(responseData, null, 2), {
    status: anySuccess ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
