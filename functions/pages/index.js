// Hub page for all SEO/AEO content pages
// Creates internal link structure for Google crawlability

import { PAGES, CONTENT_SLUGS } from './_content.js'

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
  const hubUrl = `${config.siteUrl}/pages`

  const typeLabels = {
    comparison: 'Comparison',
    listicle: 'Listicle',
    alternatives: 'Alternatives',
    concept: 'Guide'
  }

  const typeGroups = {}
  for (const slug of CONTENT_SLUGS) {
    const page = PAGES[slug]
    if (!page || page.retired) continue
    const type = page.type || 'concept'
    if (!typeGroups[type]) typeGroups[type] = []
    typeGroups[type].push({ slug, page })
  }

  // Build page cards grouped by type
  const sections = Object.entries(typeGroups).map(([type, items]) => {
    const cards = items.map(({ slug, page }) => `
      <a href="${config.siteUrl}/pages/${esc(slug)}" class="page-card">
        <span class="card-badge">${esc(typeLabels[type] || type)}</span>
        <h3>${esc(page.title)}</h3>
        <p>${esc(page.metaDescription)}</p>
        <span class="card-date">Updated ${esc(page.lastModified || '')}</span>
      </a>`).join('')

    return `
      <section class="type-group">
        <h2>${esc(typeLabels[type] || type)}s</h2>
        <div class="cards-grid">${cards}</div>
      </section>`
  }).join('')

  // JSON-LD
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Copus Resources — Guides, Comparisons & Tools',
      description: 'Guides, comparisons, and resources for content curation. Compare tools, learn curation strategies, and find the best platform for your workflow.',
      url: hubUrl,
      publisher: { '@type': 'Organization', name: 'Copus', url: config.siteUrl },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: CONTENT_SLUGS.length,
        itemListElement: CONTENT_SLUGS.map((slug, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${config.siteUrl}/pages/${slug}`,
          name: PAGES[slug]?.title || slug
        }))
      }
    }
  ]

  const jsonLdScripts = jsonLd
    .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n  ')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copus Resources — Guides, Comparisons & Tools</title>
  <meta name="description" content="Guides, comparisons, and resources for content curation. Compare tools, learn curation strategies, and find the best platform for your workflow.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${hubUrl}">

  <meta property="og:title" content="Copus Resources — Guides, Comparisons & Tools">
  <meta property="og:description" content="Guides, comparisons, and resources for content curation. Compare tools, learn curation strategies, and find the best platform for your workflow.">
  <meta property="og:url" content="${hubUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Copus">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Copus Resources — Guides, Comparisons & Tools">
  <meta name="twitter:description" content="Guides, comparisons, and resources for content curation.">

  ${jsonLdScripts}

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #231f20;
      line-height: 1.7;
      background: #fff;
    }
    a { color: #f23a00; text-decoration: none; }
    a:hover { text-decoration: underline; }

    .site-header {
      border-bottom: 1px solid #eee;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1100px;
      margin: 0 auto;
    }
    .site-header .logo { font-size: 22px; font-weight: 700; color: #f23a00; text-decoration: none; }
    .site-header nav a { margin-left: 24px; color: #555; font-size: 14px; }
    .site-header nav a:hover { color: #f23a00; }

    .page-content {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }

    .hero { text-align: center; margin-bottom: 48px; }
    .hero h1 { font-size: 36px; line-height: 1.2; margin-bottom: 16px; }
    .hero p { font-size: 18px; color: #555; max-width: 650px; margin: 0 auto; }

    .type-group { margin-bottom: 48px; }
    .type-group h2 { font-size: 22px; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #f23a00; display: inline-block; }

    .cards-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

    .page-card {
      display: block;
      padding: 24px;
      border: 1px solid #eee;
      border-radius: 8px;
      color: #231f20;
      text-decoration: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .page-card:hover { border-color: #f23a00; box-shadow: 0 2px 12px rgba(242, 58, 0, 0.08); text-decoration: none; }
    .page-card h3 { font-size: 18px; margin-bottom: 8px; color: #231f20; }
    .page-card p { font-size: 14px; color: #555; margin-bottom: 8px; }
    .card-badge {
      display: inline-block;
      background: #fff3e0;
      color: #f23a00;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 2px 10px;
      border-radius: 10px;
      margin-bottom: 8px;
    }
    .card-date { font-size: 12px; color: #999; }

    .site-footer {
      border-top: 1px solid #eee;
      padding: 32px 24px;
      text-align: center;
      font-size: 13px;
      color: #999;
      max-width: 1100px;
      margin: 0 auto;
    }
    .site-footer a { color: #999; margin: 0 12px; }
    .site-footer a:hover { color: #f23a00; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 28px; }
      .site-header nav { display: none; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <a href="${config.siteUrl}" class="logo">Copus</a>
    <nav>
      <a href="${config.siteUrl}/discovery">Discover</a>
      <a href="${config.siteUrl}/pages/best-content-curation-tools-2026">Tools</a>
      <a href="${config.siteUrl}/pages/what-is-content-curation">Learn</a>
      <a href="${config.siteUrl}/signup">Sign Up</a>
    </nav>
  </header>

  <main class="page-content">
    <section class="hero">
      <h1>Resources</h1>
      <p>Guides, comparisons, and tools to help you master content curation. Find the right platform, learn effective strategies, and get more from the content you save.</p>
    </section>

    ${sections}
  </main>

  <footer class="site-footer">
    <p>Copus — The Internet Treasure Map</p>
    <p>
      <a href="${config.siteUrl}">Home</a>
      <a href="${config.siteUrl}/discovery">Discover</a>
      <a href="${config.siteUrl}/pages">Resources</a>
      <a href="${config.siteUrl}/ai">AI Docs</a>
      <a href="${config.siteUrl}/llms.txt">llms.txt</a>
    </p>
    <p style="margin-top: 12px;">&copy; ${new Date().getFullYear()} Copus. All rights reserved.</p>
  </footer>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  })
}

function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
