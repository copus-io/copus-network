// SEO/AEO Content Page Worker
// Renders marketing landing pages from _content.js definitions

import { PAGES } from './_content.js'

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    apiBase: isTest ? 'https://api-test.copus.network' : 'https://api-prod.copus.network',
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

// Cached stats (refreshed every hour)
let cachedStats = null
let statsCachedAt = 0

async function fetchStats(apiBase) {
  const now = Date.now()
  if (cachedStats && now - statsCachedAt < 3600000) return cachedStats

  try {
    const response = await fetch(`${apiBase}/client/home/statistics`, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (response.ok) {
      const json = await response.json()
      if (json.status === 1 && json.data) {
        cachedStats = {
          articles: json.data.publicArticleCount || json.data.articleCount || 0,
          users: json.data.userCount || 0,
          treasuries: json.data.spaceCount || json.data.treasuryCount || 0
        }
        statsCachedAt = now
        return cachedStats
      }
    }
  } catch (e) {
    console.error('[Content Page] Error fetching stats:', e)
  }
  return cachedStats || { articles: 260, users: 100, treasuries: 50 }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)
  const slug = context.params.slug

  const page = PAGES[slug]
  if (!page || page.retired) {
    return context.next()
  }

  // JSON-LD format for AI agents
  if (url.searchParams.get('format') === 'json') {
    const stats = await fetchStats(config.apiBase)
    const jsonLd = buildJsonLd(page, slug, config, stats)
    return new Response(JSON.stringify(jsonLd, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/ld+json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }

  const stats = await fetchStats(config.apiBase)
  let html

  switch (page.type) {
    case 'comparison':
      html = renderComparison(page, config, stats, slug)
      break
    case 'listicle':
      html = renderListicle(page, config, stats, slug)
      break
    case 'alternatives':
      html = renderAlternatives(page, config, stats, slug)
      break
    case 'concept':
    default:
      html = renderConcept(page, config, stats, slug)
      break
  }

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  })
}

// ── JSON-LD Builder ──

function buildJsonLd(page, slug, config, stats) {
  const pageUrl = `${config.siteUrl}/pages/${slug}`
  const schemas = []

  // WebPage
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription,
    url: pageUrl,
    dateModified: page.lastModified,
    publisher: {
      '@type': 'Organization',
      name: 'Copus',
      url: config.siteUrl
    }
  })

  // BreadcrumbList
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: config.siteUrl },
      { '@type': 'ListItem', position: 2, name: page.hero.badge, item: pageUrl }
    ]
  })

  // FAQPage
  if (page.faqs && page.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    })
  }

  // Type-specific schemas
  if (page.type === 'comparison' && page.products) {
    for (const product of page.products) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: product.name,
        description: product.tagline,
        applicationCategory: 'Productivity',
        offers: {
          '@type': 'Offer',
          price: product.features.Pricing === 'Free' ? '0' : undefined,
          priceCurrency: 'USD'
        }
      })
    }
  }

  if ((page.type === 'listicle' || page.type === 'alternatives') && page.items) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: page.title,
      numberOfItems: page.items.length,
      itemListElement: page.items.map(item => ({
        '@type': 'ListItem',
        position: item.rank,
        item: {
          '@type': 'SoftwareApplication',
          name: item.name,
          description: item.description,
          applicationCategory: 'Productivity',
          url: item.url
        }
      }))
    })
  }

  if (page.type === 'concept') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.title,
      description: page.metaDescription,
      dateModified: page.lastModified,
      author: { '@type': 'Organization', name: 'Copus' },
      publisher: { '@type': 'Organization', name: 'Copus', url: config.siteUrl }
    })
  }

  return schemas
}

// ── Template Renderers ──

function renderComparison(page, config, stats, slug) {
  const [productA, productB] = page.products
  const featureKeys = Object.keys(productA.features)

  const featureRows = featureKeys.map(key => `
    <tr>
      <td class="feature-name">${esc(key)}</td>
      <td>${esc(productA.features[key])}</td>
      <td>${esc(productB.features[key])}</td>
    </tr>`).join('')

  const prosConsA = renderProsCons(productA)
  const prosConsB = renderProsCons(productB)

  const body = `
    <section class="hero">
      <span class="badge">${esc(page.hero.badge)}</span>
      <h1>${esc(page.hero.headline)}</h1>
      <p class="subheadline">${esc(page.hero.subheadline)}</p>
    </section>

    <section class="stats-bar">
      <span>Join ${stats.users}+ curators</span>
      <span>${stats.articles}+ curated articles</span>
      <span>${stats.treasuries}+ treasuries</span>
    </section>

    <section class="comparison-table">
      <h2>Feature Comparison</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>${esc(productA.name)}</th>
              <th>${esc(productB.name)}</th>
            </tr>
          </thead>
          <tbody>${featureRows}</tbody>
        </table>
      </div>
    </section>

    <section class="pros-cons">
      <div class="pros-cons-grid">
        <div class="product-card">
          <h3>${esc(productA.name)}</h3>
          <p class="tagline">${esc(productA.tagline)}</p>
          ${prosConsA}
        </div>
        <div class="product-card">
          <h3>${esc(productB.name)}</h3>
          <p class="tagline">${esc(productB.tagline)}</p>
          ${prosConsB}
        </div>
      </div>
    </section>

    <section class="verdict">
      <h2>Our Verdict</h2>
      <p>${esc(page.verdict)}</p>
    </section>

    ${renderSections(page.sections)}
    ${renderFaqs(page.faqs)}
    ${renderCta(page.cta)}`

  return renderShell(page, config, slug, body, stats)
}

function renderListicle(page, config, stats, slug) {
  const itemCards = page.items.map(item => `
    <div class="item-card${item.highlight ? ' highlighted' : ''}">
      <div class="item-rank">#${item.rank}</div>
      <div class="item-content">
        <h3>${esc(item.name)}${item.highlight ? ' <span class="pick">Top Pick</span>' : ''}</h3>
        <p>${esc(item.description)}</p>
        <div class="item-meta">
          <span class="pricing">${esc(item.pricing)}</span>
          <span class="best-for">Best for: ${esc(item.bestFor)}</span>
        </div>
      </div>
    </div>`).join('')

  const body = `
    <section class="hero">
      <span class="badge">${esc(page.hero.badge)}</span>
      <h1>${esc(page.hero.headline)}</h1>
      <p class="subheadline">${esc(page.hero.subheadline)}</p>
    </section>

    <section class="stats-bar">
      <span>Join ${stats.users}+ curators</span>
      <span>${stats.articles}+ curated articles</span>
      <span>${stats.treasuries}+ treasuries</span>
    </section>

    <section class="item-list">
      ${itemCards}
    </section>

    ${renderSections(page.sections)}
    ${renderFaqs(page.faqs)}
    ${renderCta(page.cta)}`

  return renderShell(page, config, slug, body, stats)
}

function renderAlternatives(page, config, stats, slug) {
  const itemCards = page.items.map(item => `
    <div class="item-card${item.highlight ? ' highlighted' : ''}">
      <div class="item-rank">#${item.rank}</div>
      <div class="item-content">
        <h3>${esc(item.name)}${item.highlight ? ' <span class="pick">Top Pick</span>' : ''}</h3>
        <p>${esc(item.description)}</p>
        ${item.vsArena ? `<p class="vs-note"><strong>vs Are.na:</strong> ${esc(item.vsArena)}</p>` : ''}
        <div class="item-meta">
          <span class="pricing">${esc(item.pricing)}</span>
          <span class="best-for">Best for: ${esc(item.bestFor)}</span>
        </div>
      </div>
    </div>`).join('')

  const body = `
    <section class="hero">
      <span class="badge">${esc(page.hero.badge)}</span>
      <h1>${esc(page.hero.headline)}</h1>
      <p class="subheadline">${esc(page.hero.subheadline)}</p>
    </section>

    <section class="stats-bar">
      <span>Join ${stats.users}+ curators</span>
      <span>${stats.articles}+ curated articles</span>
      <span>${stats.treasuries}+ treasuries</span>
    </section>

    <section class="item-list">
      ${itemCards}
    </section>

    ${renderSections(page.sections)}
    ${renderFaqs(page.faqs)}
    ${renderCta(page.cta)}`

  return renderShell(page, config, slug, body, stats)
}

function renderConcept(page, config, stats, slug) {
  const callout = page.copusCallout ? `
    <section class="copus-callout">
      <h2>${esc(page.copusCallout.heading)}</h2>
      ${page.copusCallout.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
    </section>` : ''

  const body = `
    <section class="hero">
      <span class="badge">${esc(page.hero.badge)}</span>
      <h1>${esc(page.hero.headline)}</h1>
      <p class="subheadline">${esc(page.hero.subheadline)}</p>
    </section>

    <section class="stats-bar">
      <span>Join ${stats.users}+ curators</span>
      <span>${stats.articles}+ curated articles</span>
      <span>${stats.treasuries}+ treasuries</span>
    </section>

    ${renderSections(page.sections)}
    ${callout}
    ${renderFaqs(page.faqs)}
    ${renderCta(page.cta)}`

  return renderShell(page, config, slug, body, stats)
}

// ── Shared Partials ──

function renderSections(sections) {
  if (!sections || sections.length === 0) return ''
  return sections.map(s => {
    const bullets = s.bullets
      ? `<ul>${s.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`
      : ''
    return `
    <section class="content-section">
      <h2>${esc(s.heading)}</h2>
      ${s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
      ${bullets}
    </section>`
  }).join('')
}

function renderProsCons(product) {
  const pros = product.pros.map(p => `<li class="pro">${esc(p)}</li>`).join('')
  const cons = product.cons.map(c => `<li class="con">${esc(c)}</li>`).join('')
  return `
    <div class="pros"><h4>Pros</h4><ul>${pros}</ul></div>
    <div class="cons"><h4>Cons</h4><ul>${cons}</ul></div>`
}

function renderFaqs(faqs) {
  if (!faqs || faqs.length === 0) return ''
  const items = faqs.map(faq => `
    <details>
      <summary>${esc(faq.question)}</summary>
      <p>${esc(faq.answer)}</p>
    </details>`).join('')

  return `
    <section class="faq-section">
      <h2>Frequently Asked Questions</h2>
      ${items}
    </section>`
}

function renderCta(cta) {
  if (!cta) return ''
  return `
    <section class="cta-section">
      <h2>${esc(cta.heading)}</h2>
      <p>${esc(cta.text)}</p>
      <a href="${esc(cta.buttonUrl)}" class="cta-button">${esc(cta.buttonText)}</a>
    </section>`
}

function renderShell(page, config, slug, body, stats) {
  const pageUrl = `${config.siteUrl}/pages/${slug}`
  const jsonLdScripts = buildJsonLd(page, slug, config, stats)
    .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n  ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.metaDescription)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${pageUrl}">

  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.metaDescription)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Copus">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.metaDescription)}">

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

    /* Header */
    .site-header {
      border-bottom: 1px solid #eee;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1100px;
      margin: 0 auto;
    }
    .site-header .logo {
      font-size: 22px;
      font-weight: 700;
      color: #f23a00;
      text-decoration: none;
    }
    .site-header nav a {
      margin-left: 24px;
      color: #555;
      font-size: 14px;
    }
    .site-header nav a:hover { color: #f23a00; }

    /* Main */
    .page-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }

    /* Hero */
    .hero { text-align: center; margin-bottom: 40px; }
    .badge {
      display: inline-block;
      background: #fff3e0;
      color: #f23a00;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 12px;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .hero h1 { font-size: 36px; line-height: 1.2; margin-bottom: 16px; }
    .subheadline { font-size: 18px; color: #555; max-width: 600px; margin: 0 auto; }

    /* Stats bar */
    .stats-bar {
      display: flex;
      justify-content: center;
      gap: 32px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 40px;
      font-size: 14px;
      color: #555;
      flex-wrap: wrap;
    }
    .stats-bar span { font-weight: 600; }

    /* Comparison table */
    .comparison-table { margin-bottom: 40px; }
    .comparison-table h2 { margin-bottom: 16px; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f9f9f9; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .feature-name { font-weight: 600; white-space: nowrap; }

    /* Pros/Cons */
    .pros-cons { margin-bottom: 40px; }
    .pros-cons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .product-card { padding: 24px; background: #f9f9f9; border-radius: 8px; }
    .product-card h3 { margin-bottom: 4px; }
    .tagline { color: #777; font-size: 14px; margin-bottom: 16px; }
    .pros h4, .cons h4 { font-size: 14px; margin-bottom: 8px; }
    .pros h4 { color: #2e7d32; }
    .cons h4 { color: #c62828; }
    .pros ul, .cons ul { list-style: none; padding: 0; margin-bottom: 16px; }
    .pro::before { content: '✓ '; color: #2e7d32; font-weight: 700; }
    .con::before { content: '✗ '; color: #c62828; font-weight: 700; }
    .pros li, .cons li { padding: 4px 0; font-size: 14px; }

    /* Verdict */
    .verdict {
      padding: 24px;
      background: #fff3e0;
      border-left: 4px solid #f23a00;
      border-radius: 0 8px 8px 0;
      margin-bottom: 40px;
    }
    .verdict h2 { margin-bottom: 8px; color: #f23a00; }

    /* Item cards (listicle/alternatives) */
    .item-list { margin-bottom: 40px; }
    .item-card {
      display: flex;
      gap: 20px;
      padding: 24px;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    .item-card:hover { border-color: #f23a00; }
    .item-card.highlighted { border: 2px solid #f23a00; background: #fffaf7; }
    .item-rank {
      font-size: 24px;
      font-weight: 700;
      color: #f23a00;
      min-width: 48px;
      display: flex;
      align-items: flex-start;
      padding-top: 4px;
    }
    .item-content h3 { margin-bottom: 8px; }
    .pick {
      display: inline-block;
      background: #f23a00;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      vertical-align: middle;
      margin-left: 8px;
    }
    .item-meta { display: flex; gap: 16px; margin-top: 12px; font-size: 13px; flex-wrap: wrap; }
    .pricing { background: #e8f5e9; color: #2e7d32; padding: 2px 10px; border-radius: 10px; font-weight: 600; }
    .best-for { color: #777; }
    .vs-note { font-size: 13px; color: #555; margin-top: 8px; padding: 8px 12px; background: #f5f5f5; border-radius: 4px; }

    /* Content sections */
    .content-section { margin-bottom: 32px; }
    .content-section h2 { margin-bottom: 12px; font-size: 24px; }
    .content-section p { margin-bottom: 12px; }
    .content-section ul { margin: 12px 0; padding-left: 24px; }
    .content-section li { margin-bottom: 6px; }

    /* Copus callout */
    .copus-callout {
      padding: 24px;
      background: #e8f5e9;
      border: 2px solid #4caf50;
      border-radius: 8px;
      margin: 32px 0;
    }
    .copus-callout h2 { color: #2e7d32; margin-bottom: 12px; }
    .copus-callout p { margin-bottom: 8px; }

    /* FAQ */
    .faq-section { margin-bottom: 40px; }
    .faq-section h2 { margin-bottom: 16px; }
    details {
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 8px;
      overflow: hidden;
    }
    summary {
      padding: 16px 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 15px;
      background: #fafafa;
      list-style: none;
    }
    summary::-webkit-details-marker { display: none; }
    summary::before { content: '+ '; color: #f23a00; font-weight: 700; }
    details[open] summary::before { content: '− '; }
    details[open] summary { border-bottom: 1px solid #eee; }
    details p { padding: 16px 20px; font-size: 14px; color: #555; line-height: 1.6; }

    /* CTA */
    .cta-section {
      text-align: center;
      padding: 48px 24px;
      background: #231f20;
      color: #fff;
      border-radius: 12px;
      margin: 40px 0;
    }
    .cta-section h2 { margin-bottom: 12px; }
    .cta-section p { color: #ccc; margin-bottom: 24px; }
    .cta-button {
      display: inline-block;
      background: #f23a00;
      color: #fff;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .cta-button:hover { background: #d63200; text-decoration: none; }

    /* Footer */
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

    /* Responsive */
    @media (max-width: 768px) {
      .hero h1 { font-size: 28px; }
      .subheadline { font-size: 16px; }
      .pros-cons-grid { grid-template-columns: 1fr; }
      .stats-bar { gap: 16px; }
      .item-card { flex-direction: column; gap: 8px; }
      .item-rank { font-size: 18px; }
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
    ${body}
  </main>

  <footer class="site-footer">
    <p>Copus — The Internet Treasure Map</p>
    <p>
      <a href="${config.siteUrl}">Home</a>
      <a href="${config.siteUrl}/discovery">Discover</a>
      <a href="${config.siteUrl}/ai">AI Docs</a>
      <a href="${config.siteUrl}/llms.txt">llms.txt</a>
    </p>
    <p style="margin-top: 12px;">© ${new Date().getFullYear()} Copus. All rights reserved.</p>
  </footer>
</body>
</html>`
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
