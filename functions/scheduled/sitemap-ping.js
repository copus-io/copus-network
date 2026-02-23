// Automated Search Engine Notification with IndexNow
//
// IndexNow instantly notifies search engines of new/updated content.
// Supported by: Bing, Yandex, Seznam, Naver (not Google)
//
// This endpoint:
// 1. Pings IndexNow with the sitemap URL
// 2. Can be called manually, by GitHub Actions, or on new article publish

const INDEXNOW_KEY = '869f2de9e40b697bb5245a403917412f'

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network',
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)
  const SITEMAP_URL = `${config.siteUrl}/sitemap.xml`

  // IndexNow endpoints (all get notified with one ping to api.indexnow.org)
  const indexNowEndpoints = [
    { name: 'IndexNow (Bing/Yandex/Seznam/Naver)', url: 'https://api.indexnow.org/indexnow' },
  ]

  const results = []
  const startTime = Date.now()

  for (const engine of indexNowEndpoints) {
    try {
      const pingUrl = `${engine.url}?url=${encodeURIComponent(SITEMAP_URL)}&key=${INDEXNOW_KEY}`
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Copus-IndexNow/1.0' },
      })

      results.push({
        engine: engine.name,
        status: response.status,
        success: response.status === 200 || response.status === 202,
        message: response.status === 200 || response.status === 202
          ? 'Submitted successfully'
          : `HTTP ${response.status}`,
      })
    } catch (error) {
      results.push({
        engine: engine.name,
        status: 0,
        success: false,
        message: error.message,
      })
    }
  }

  const duration = Date.now() - startTime
  const allSuccess = results.every(r => r.success)

  const responseData = {
    timestamp: new Date().toISOString(),
    sitemap: SITEMAP_URL,
    siteUrl: config.siteUrl,
    duration: `${duration}ms`,
    success: allSuccess,
    results,
    indexNow: {
      key: INDEXNOW_KEY,
      keyFile: `${config.siteUrl}/${INDEXNOW_KEY}.txt`,
      supportedEngines: ['Bing', 'Yandex', 'Seznam', 'Naver'],
      note: 'Google does not support IndexNow; uses natural crawling via sitemap',
    },
  }

  return new Response(JSON.stringify(responseData, null, 2), {
    status: allSuccess ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
