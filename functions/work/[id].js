// Minimal SEO Worker - Phase 1: Test basic HTMLRewriter functionality
// No API calls, just inject a test meta tag to confirm worker runs

export async function onRequest(context) {
  const { request, params, next } = context
  const articleId = params.id

  // Skip static assets
  const url = new URL(request.url)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    return next()
  }

  try {
    // Get original response
    const response = await next()

    // Only transform HTML
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return response
    }

    // Simple transformation - just add a test meta tag
    return new HTMLRewriter()
      .on('head', {
        element(element) {
          element.append(`
    <!-- SEO Worker Active -->
    <meta name="seo-worker" content="active" />
    <meta name="article-id" content="${articleId}" />
          `, { html: true })
        }
      })
      .transform(response)

  } catch (error) {
    // On any error, return original page
    console.error('[SEO Worker] Error:', error)
    return next()
  }
}
