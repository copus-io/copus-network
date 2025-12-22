/**
 * Cloudflare Worker for Dynamic Meta Tags
 *
 * This worker intercepts requests from social media crawlers and serves
 * the correct Open Graph meta tags for article/work pages.
 *
 * Deploy: wrangler publish
 */

// Bot user agents that need pre-rendered meta tags
const BOT_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
  'Applebot',
];

// Check if request is from a social media bot
function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot.toLowerCase()));
}

// Extract work ID from URL path
function getWorkId(pathname) {
  const match = pathname.match(/^\/work\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
}

// Fetch article data from API
async function fetchArticleData(uuid, apiBaseUrl) {
  try {
    const response = await fetch(`${apiBaseUrl}/client/reader/article/info?uuid=${uuid}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== 1 || !data.data) return null;

    return data.data;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

// Generate HTML with proper meta tags
function generateMetaTagsHtml(article, url) {
  const title = article.title || 'Copus';
  const description = (article.content || '').substring(0, 160).replace(/"/g, '&quot;');
  const image = article.coverUrl || 'https://copus.network/og-image.jpg';
  const author = article.authorInfo?.username || 'Copus Creator';
  const publishedTime = article.createAt
    ? new Date(article.createAt * 1000).toISOString()
    : new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title} | Copus</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${description}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${url}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Copus" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="en_US" />
  <meta property="article:published_time" content="${publishedTime}" />
  <meta property="article:author" content="${author}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@copus_network" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title.replace(/"/g, '\\"')}",
    "description": "${description.replace(/"/g, '\\"')}",
    "image": "${image}",
    "url": "${url}",
    "datePublished": "${publishedTime}",
    "author": {
      "@type": "Person",
      "name": "${author}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Copus",
      "logo": {
        "@type": "ImageObject",
        "url": "https://copus.network/logo.png"
      }
    }
  }
  </script>

  <!-- Redirect browsers to SPA -->
  <meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>
  <p>Redirecting to <a href="${url}">${title}</a>...</p>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    // Only process /work/:id routes for bots
    const workId = getWorkId(url.pathname);

    if (workId && isBot(userAgent)) {
      // Determine API base URL based on hostname
      const apiBaseUrl = url.hostname.includes('test')
        ? 'https://api-test.copus.network'
        : 'https://api-prod.copus.network';

      const article = await fetchArticleData(workId, apiBaseUrl);

      if (article) {
        const html = generateMetaTagsHtml(article, url.toString());
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          },
        });
      }
    }

    // For non-bot requests or if article not found, pass through to origin
    return fetch(request);
  },
};
