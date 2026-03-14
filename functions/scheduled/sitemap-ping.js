// IndexNow Batch URL Submission for Copus
//
// IndexNow instantly notifies Bing, Yandex, Seznam, Naver of new/updated content.
// Google does NOT support IndexNow — uses natural crawling via sitemap.
//
// This endpoint:
// 1. Fetches recent articles from the Copus API (last 24h by default)
// 2. Submits their URLs via IndexNow batch POST (up to 10,000 URLs per call)
// 3. Also includes static pages and marketing pages
//
// Triggered by: GitHub Actions (daily + on push), manual visit, or external cron.
//
// Query params:
//   ?hours=48    — look back 48 hours instead of default 24
//   ?all=true    — submit ALL articles (use sparingly, for initial seeding)

const INDEXNOW_KEY = '869f2de9e40b697bb5245a403917412f'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    apiBase: isTest ? 'https://api-test.copus.network' : 'https://api-prod.copus.network',
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network',
    host: isTest ? 'test.copus.network' : 'copus.network',
  }
}

async function fetchRecentArticles(apiBase, hoursBack, fetchAll) {
  const articles = []
  let pageIndex = 1
  const pageSize = 100
  const cutoff = fetchAll ? 0 : Date.now() - hoursBack * 60 * 60 * 1000

  try {
    while (pageIndex <= 50) {
      const apiUrl = `${apiBase}/client/home/pageArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`
      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) break

      const json = await response.json()
      if (json.status !== 1 || !json.data?.data) break

      const batch = json.data.data
      let foundOld = false

      for (const article of batch) {
        if (!article.uuid) continue
        const publishTime = article.publishAt
          ? (article.publishAt > 9999999999 ? article.publishAt : article.publishAt * 1000)
          : 0

        if (fetchAll || publishTime >= cutoff) {
          articles.push({
            uuid: article.uuid,
            publishAt: publishTime,
            namespace: article.authorInfo?.namespace,
            spaceNamespace: article.spaceInfo?.namespace,
          })
        } else {
          foundOld = true
        }
      }

      // Stop if we've hit articles older than our cutoff (they're sorted by recency)
      if (foundOld && !fetchAll) break
      if (batch.length < pageSize) break
      pageIndex++
    }
  } catch (e) {
    console.error('[IndexNow] Error fetching articles:', e)
  }

  return articles
}

function buildUrlList(config, articles) {
  const urls = new Set()

  // Always include key pages
  urls.add(`${config.siteUrl}/`)
  urls.add(`${config.siteUrl}/explore/new`)
  urls.add(`${config.siteUrl}/published`)

  // Add article URLs
  for (const article of articles) {
    urls.add(`${config.siteUrl}/work/${article.uuid}`)

    // Also submit the author profile (their page changed too)
    if (article.namespace) {
      urls.add(`${config.siteUrl}/u/${article.namespace}`)
    }
    // And the treasury page if applicable
    if (article.spaceNamespace) {
      urls.add(`${config.siteUrl}/treasury/${article.spaceNamespace}`)
    }
  }

  return [...urls]
}

async function submitToIndexNow(host, urls) {
  // IndexNow batch POST: submit up to 10,000 URLs at once
  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10000),
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'Copus-IndexNow/2.0',
    },
    body: JSON.stringify(body),
  })

  return {
    status: response.status,
    success: response.status === 200 || response.status === 202,
    message: response.status === 200 ? 'OK — URLs submitted'
      : response.status === 202 ? 'Accepted — URLs queued for processing'
      : response.status === 400 ? 'Bad request — invalid format'
      : response.status === 403 ? 'Forbidden — key mismatch'
      : response.status === 422 ? 'Unprocessable — URLs don\'t match host'
      : response.status === 429 ? 'Too many requests — rate limited'
      : `HTTP ${response.status}`,
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  const hoursBack = parseInt(url.searchParams.get('hours') || '24', 10)
  const fetchAll = url.searchParams.get('all') === 'true'

  const startTime = Date.now()

  // 1. Fetch recent articles
  const articles = await fetchRecentArticles(config.apiBase, hoursBack, fetchAll)

  // 2. Build URL list
  const urls = buildUrlList(config, articles)

  // 3. Submit to IndexNow
  let result
  if (urls.length === 0) {
    result = { status: 0, success: true, message: 'No new URLs to submit' }
  } else {
    try {
      result = await submitToIndexNow(config.host, urls)
    } catch (error) {
      result = { status: 0, success: false, message: error.message }
    }
  }

  const duration = Date.now() - startTime

  const responseData = {
    timestamp: new Date().toISOString(),
    siteUrl: config.siteUrl,
    duration: `${duration}ms`,
    success: result.success,
    articlesFound: articles.length,
    urlsSubmitted: urls.length,
    lookback: fetchAll ? 'all' : `${hoursBack}h`,
    result,
    sampleUrls: urls.slice(0, 10),
    indexNow: {
      key: INDEXNOW_KEY,
      keyFile: `https://${config.host}/${INDEXNOW_KEY}.txt`,
      supportedEngines: ['Bing', 'Yandex', 'Seznam', 'Naver'],
      note: 'Google does not support IndexNow; uses natural crawling via sitemap',
    },
  }

  return new Response(JSON.stringify(responseData, null, 2), {
    status: result.success ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
