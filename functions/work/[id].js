// Minimal SEO Worker - Phase 1: Test basic HTMLRewriter functionality
// No API calls, just inject a test meta tag to confirm worker runs

export async function onRequest(context) {
  const { params, next } = context
  const articleId = params.id

  // Get original response first - only call next() once!
  const response = await next()

  // Skip non-HTML responses
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    return response
  }

  try {
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
    // On error, we can't return original response (already consumed)
    // Log error and return a basic error indicator
    console.error('[SEO Worker] Transform error:', error)
    // Return the response as-is (may be partially consumed)
    return response
  }
}
