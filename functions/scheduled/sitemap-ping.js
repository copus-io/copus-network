// Automated Sitemap Ping for Search Engines
// Runs on a schedule to notify Google and Bing of sitemap updates
//
// Cloudflare Pages doesn't support cron triggers directly.
// This function can be:
// 1. Called manually via /scheduled/sitemap-ping
// 2. Triggered by an external cron service (e.g., cron-job.org, GitHub Actions)
// 3. Called from backend when new articles are published

const SITEMAP_URL = 'https://copus.network/sitemap.xml';

const SEARCH_ENGINES = [
  {
    name: 'Google',
    pingUrl: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  },
  {
    name: 'Bing',
    pingUrl: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  },
  // IndexNow for Bing/Yandex (requires API key setup)
  // {
  //   name: 'IndexNow',
  //   pingUrl: `https://api.indexnow.org/indexnow?url=${encodeURIComponent(SITEMAP_URL)}&key=YOUR_KEY`,
  // },
];

export async function onRequest(context) {
  const results = [];
  const startTime = Date.now();

  for (const engine of SEARCH_ENGINES) {
    try {
      const response = await fetch(engine.pingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Copus-Sitemap-Pinger/1.0',
        },
      });

      results.push({
        engine: engine.name,
        status: response.status,
        success: response.ok,
        message: response.ok ? 'Sitemap ping successful' : `HTTP ${response.status}`,
      });
    } catch (error) {
      results.push({
        engine: engine.name,
        status: 0,
        success: false,
        message: error.message,
      });
    }
  }

  const duration = Date.now() - startTime;
  const allSuccess = results.every(r => r.success);

  const response = {
    timestamp: new Date().toISOString(),
    sitemap: SITEMAP_URL,
    duration: `${duration}ms`,
    success: allSuccess,
    results,
  };

  // Log for debugging
  console.log('[Sitemap Ping]', JSON.stringify(response));

  return new Response(JSON.stringify(response, null, 2), {
    status: allSuccess ? 200 : 207, // 207 Multi-Status if partial success
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
