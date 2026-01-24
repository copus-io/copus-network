// Automated Search Engine Notification
//
// Modern search engines (Google, Bing) have deprecated simple ping endpoints.
// Current indexing methods:
//
// 1. Natural Crawling (ACTIVE - No setup required)
//    - robots.txt with Sitemap directive ✓
//    - sitemap.xml with all URLs ✓
//    - AI bot access configured ✓
//
// 2. IndexNow Protocol (OPTIONAL - Requires key setup)
//    - Supported by: Bing, Yandex, Seznam, Naver
//    - Setup: Generate key, host at /{key}.txt, use in requests
//
// 3. Webmaster Tools APIs (OPTIONAL - Requires authentication)
//    - Google Search Console: https://search.google.com/search-console
//    - Bing Webmaster Tools: https://www.bing.com/webmasters
//
// This endpoint provides status info and optional IndexNow pings.

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network',
    // To enable IndexNow:
    // 1. Generate a key (any 32+ char hex string)
    // 2. Create /static/{key}.txt with the key as content
    // 3. Set INDEXNOW_KEY environment variable in Cloudflare
    indexNowKey: null, // Set via env var in production
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)
  const SITEMAP_URL = `${config.siteUrl}/sitemap.xml`

  // Check for IndexNow key in environment
  const indexNowKey = context.env?.INDEXNOW_KEY || config.indexNowKey

  const status = {
    timestamp: new Date().toISOString(),
    sitemap: SITEMAP_URL,
    siteUrl: config.siteUrl,
  }

  // Status of each indexing method
  const indexingMethods = {
    naturalCrawling: {
      status: 'active',
      description: 'Search engines will discover content via robots.txt and sitemap.xml',
      files: {
        robotsTxt: `${config.siteUrl}/robots.txt`,
        sitemapXml: SITEMAP_URL,
        llmsTxt: `${config.siteUrl}/llms.txt`,
      },
    },
    indexNow: {
      status: indexNowKey ? 'configured' : 'not_configured',
      description: indexNowKey
        ? 'IndexNow is configured and will ping Bing/Yandex'
        : 'Set INDEXNOW_KEY env var to enable instant indexing',
      supportedEngines: ['Bing', 'Yandex', 'Seznam', 'Naver'],
    },
    webmasterTools: {
      status: 'manual',
      description: 'Submit sitemap manually for priority indexing',
      links: {
        google: 'https://search.google.com/search-console',
        bing: 'https://www.bing.com/webmasters',
      },
    },
  }

  // If IndexNow key is configured, ping the engines
  const pingResults = []
  if (indexNowKey) {
    const indexNowEndpoints = [
      { name: 'Bing', url: 'https://www.bing.com/indexnow' },
      { name: 'Yandex', url: 'https://yandex.com/indexnow' },
    ]

    for (const engine of indexNowEndpoints) {
      try {
        const pingUrl = `${engine.url}?url=${encodeURIComponent(SITEMAP_URL)}&key=${indexNowKey}`
        const response = await fetch(pingUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Copus-IndexNow/1.0' },
        })

        pingResults.push({
          engine: engine.name,
          status: response.status,
          success: response.status === 200 || response.status === 202,
          message: response.status === 200 ? 'Submitted' : `HTTP ${response.status}`,
        })
      } catch (error) {
        pingResults.push({
          engine: engine.name,
          status: 0,
          success: false,
          message: error.message,
        })
      }
    }
  }

  const responseData = {
    ...status,
    indexingMethods,
    ...(pingResults.length > 0 && { pingResults }),
    recommendations: [
      'Sitemap is automatically discovered via robots.txt',
      'For faster indexing, submit sitemap to Google Search Console and Bing Webmaster Tools',
      indexNowKey ? 'IndexNow pings are active' : 'Consider setting up IndexNow for instant indexing',
    ],
  }

  return new Response(JSON.stringify(responseData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
