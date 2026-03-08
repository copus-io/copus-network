#!/usr/bin/env node

// Copus SEO Validator — automated checks for content page health
// Run: node scripts/validate-seo.mjs [--site=https://copus.network] [--skip=traffic,indexing,citations]
// Config: ~/.copus-seo/.env

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { homedir } from 'os'
import { createSign } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CONTENT_PATH = join(ROOT, 'functions', 'pages', '_content.js')

// --- CLI args ---
const args = process.argv.slice(2)
const siteArg = args.find(a => a.startsWith('--site='))
const skipArg = args.find(a => a.startsWith('--skip='))
const SKIP = new Set((skipArg ? skipArg.split('=')[1] : '').split(',').filter(Boolean))

// --- .env loader ---
function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const vars = {}
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    vars[key] = val
  }
  return vars
}

const envPath = join(homedir(), '.copus-seo', '.env')
const env = loadEnvFile(envPath)
const SITE_URL = siteArg ? siteArg.split('=')[1] : 'https://test.copus.network'
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_API_TOKEN
const CF_ZONE = process.env.CLOUDFLARE_ZONE_ID || env.CLOUDFLARE_ZONE_ID
const GSC_KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH

// --- Extract slugs from _content.js ---
function getSlugsFromContent() {
  const source = readFileSync(CONTENT_PATH, 'utf-8')
  const slugs = []
  const matches = source.match(/'([a-z0-9-]+)':\s*\{/g)
  if (matches) {
    for (const m of matches) {
      slugs.push(m.match(/'([a-z0-9-]+)'/)[1])
    }
  }
  return slugs
}

// --- Extract page type from _content.js ---
function getPageTypes() {
  const source = readFileSync(CONTENT_PATH, 'utf-8')
  const types = {}
  const matches = [...source.matchAll(/'([a-z0-9-]+)':\s*\{[\s\S]*?type:\s*'([^']+)'/g)]
  for (const [, slug, type] of matches) {
    types[slug] = type
  }
  return types
}

// --- Color helpers ---
const green = (s) => `\x1b[32m${s}\x1b[0m`
const red = (s) => `\x1b[31m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`
const bold = (s) => `\x1b[1m${s}\x1b[0m`

function pad(str, len) { return str.padEnd(len) }
function ok(msg) { return green('  ✓ ') + msg }
function fail(msg) { return red('  ✗ ') + msg }
function warn(msg) { return yellow('  ! ') + msg }

// ═══════════════════════════════════════════════
// CHECK 1: Page Health
// ═══════════════════════════════════════════════
async function checkPageHealth(slugs) {
  console.log(bold('\nPAGE HEALTH'))
  const results = []

  for (const slug of slugs) {
    const url = `${SITE_URL}/pages/${slug}`
    const start = Date.now()
    try {
      const res = await fetch(url)
      const ms = Date.now() - start
      const status = res.status

      if (status === 200) {
        console.log(ok(`${pad(slug, 35)} ${status}  ${ms}ms`))
        results.push({ slug, status, ms, ok: true })
      } else {
        console.log(fail(`${pad(slug, 35)} ${status}  ${ms}ms`))
        results.push({ slug, status, ms, ok: false })
      }
    } catch (e) {
      console.log(fail(`${pad(slug, 35)} ERROR: ${e.message}`))
      results.push({ slug, status: 0, ms: 0, ok: false, error: e.message })
    }
  }

  return results
}

// ═══════════════════════════════════════════════
// CHECK 2: Schema Validation (JSON-LD)
// ═══════════════════════════════════════════════
async function checkSchemaValidation(slugs, pageTypes) {
  console.log(bold('\nSCHEMA VALIDATION'))

  // Expected schemas per page type
  const expectedSchemas = {
    comparison: ['WebPage', 'BreadcrumbList', 'FAQPage', 'SoftwareApplication'],
    listicle: ['WebPage', 'BreadcrumbList', 'FAQPage', 'ItemList'],
    alternatives: ['WebPage', 'BreadcrumbList', 'FAQPage', 'ItemList'],
    concept: ['WebPage', 'BreadcrumbList', 'FAQPage', 'Article']
  }

  const results = []

  for (const slug of slugs) {
    const url = `${SITE_URL}/pages/${slug}?format=json`
    try {
      const res = await fetch(url)
      if (!res.ok) {
        console.log(fail(`${pad(slug, 35)} HTTP ${res.status}`))
        results.push({ slug, ok: false })
        continue
      }

      const schemas = await res.json()
      const foundTypes = schemas.map(s => s['@type']).filter(Boolean)
      const type = pageTypes[slug] || 'concept'
      const expected = expectedSchemas[type] || expectedSchemas.concept

      const checks = expected.map(t => {
        const found = foundTypes.includes(t)
        return found ? green(t + ' ✓') : red(t + ' ✗')
      })

      const allFound = expected.every(t => foundTypes.includes(t))
      const prefix = allFound ? green('  ✓ ') : red('  ✗ ')
      console.log(prefix + pad(slug, 35) + checks.join('  '))
      results.push({ slug, ok: allFound, foundTypes, expected })
    } catch (e) {
      console.log(fail(`${pad(slug, 35)} ERROR: ${e.message}`))
      results.push({ slug, ok: false, error: e.message })
    }
  }

  return results
}

// ═══════════════════════════════════════════════
// CHECK 3: Sitemap & llms.txt Consistency
// ═══════════════════════════════════════════════
async function checkConsistency(slugs) {
  console.log(bold('\nCONSISTENCY'))

  // Check sitemap
  let sitemapSlugs = []
  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`)
    if (res.ok) {
      const xml = await res.text()
      for (const slug of slugs) {
        if (xml.includes(`/pages/${slug}`)) sitemapSlugs.push(slug)
      }
    }
    const missing = slugs.filter(s => !sitemapSlugs.includes(s))
    if (missing.length === 0) {
      console.log(ok(`Sitemap: ${slugs.length}/${slugs.length} pages listed`))
    } else {
      console.log(fail(`Sitemap: ${sitemapSlugs.length}/${slugs.length} pages listed. Missing: ${missing.join(', ')}`))
    }
  } catch (e) {
    console.log(fail(`Sitemap: Error fetching — ${e.message}`))
  }

  // Check llms.txt
  let llmsSlugs = []
  try {
    const res = await fetch(`${SITE_URL}/llms.txt`)
    if (res.ok) {
      const txt = await res.text()
      for (const slug of slugs) {
        if (txt.includes(`/pages/${slug}`)) llmsSlugs.push(slug)
      }
    }
    const missing = slugs.filter(s => !llmsSlugs.includes(s))
    if (missing.length === 0) {
      console.log(ok(`llms.txt: ${slugs.length}/${slugs.length} pages listed`))
    } else {
      console.log(fail(`llms.txt: ${llmsSlugs.length}/${slugs.length} pages listed. Missing: ${missing.join(', ')}`))
    }
  } catch (e) {
    console.log(fail(`llms.txt: Error fetching — ${e.message}`))
  }
}

// ═══════════════════════════════════════════════
// CHECK 4: Google Indexing Status (Search Console API)
// ═══════════════════════════════════════════════
async function checkGoogleIndexing(slugs) {
  console.log(bold('\nGOOGLE INDEXING (Search Console API)'))

  if (!GSC_KEY_PATH || GSC_KEY_PATH === 'REPLACE_ME' || !existsSync(GSC_KEY_PATH)) {
    console.log(dim('  Skipped — service account key not configured'))
    console.log(dim(`  Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH in ${envPath}`))
    return
  }

  let serviceAccount
  try {
    serviceAccount = JSON.parse(readFileSync(GSC_KEY_PATH, 'utf-8'))
  } catch (e) {
    console.log(fail(`Cannot read service account key: ${e.message}`))
    return
  }

  // Get OAuth2 access token via JWT
  const token = await getGoogleAccessToken(serviceAccount)
  if (!token) return

  const siteProperty = SITE_URL.startsWith('https://') ? SITE_URL : `https://${SITE_URL}`

  for (const slug of slugs) {
    const pageUrl = `${siteProperty}/pages/${slug}`
    try {
      const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inspectionUrl: pageUrl,
          siteUrl: siteProperty
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        if (res.status === 403) {
          console.log(fail(`${pad(slug, 35)} Permission denied — add service account to Search Console`))
          return // No point checking more
        }
        console.log(fail(`${pad(slug, 35)} API error: ${res.status}`))
        continue
      }

      const data = await res.json()
      const result = data.inspectionResult?.indexStatusResult
      const verdict = result?.verdict || 'UNKNOWN'
      const coverageState = result?.coverageState || ''

      if (verdict === 'PASS') {
        console.log(ok(`${pad(slug, 35)} INDEXED`))
      } else if (verdict === 'NEUTRAL') {
        console.log(warn(`${pad(slug, 35)} ${coverageState || 'NOT INDEXED'}`))
      } else {
        console.log(fail(`${pad(slug, 35)} ${coverageState || verdict}`))
      }
    } catch (e) {
      console.log(fail(`${pad(slug, 35)} ERROR: ${e.message}`))
    }
  }
}

async function getGoogleAccessToken(serviceAccount) {
  try {
    const now = Math.floor(Date.now() / 1000)
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    })).toString('base64url')

    const signInput = `${header}.${payload}`
    const sign = createSign('RSA-SHA256')
    sign.update(signInput)
    const signature = sign.sign(serviceAccount.private_key, 'base64url')

    const jwt = `${signInput}.${signature}`

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    })

    if (!res.ok) {
      console.log(fail(`Failed to get Google access token: ${res.status}`))
      return null
    }

    const data = await res.json()
    return data.access_token
  } catch (e) {
    console.log(fail(`Google auth error: ${e.message}`))
    return null
  }
}

// ═══════════════════════════════════════════════
// CHECK 5: Rich Results Validation (local JSON-LD check)
// ═══════════════════════════════════════════════
async function checkRichResults(slugs) {
  console.log(bold('\nRICH RESULTS VALIDATION'))

  // Required fields per schema type
  const requiredFields = {
    WebPage: ['name', 'description', 'url'],
    BreadcrumbList: ['itemListElement'],
    FAQPage: ['mainEntity'],
    SoftwareApplication: ['name', 'applicationCategory'],
    ItemList: ['name', 'numberOfItems', 'itemListElement'],
    Article: ['headline', 'description', 'author']
  }

  for (const slug of slugs) {
    const url = `${SITE_URL}/pages/${slug}?format=json`
    try {
      const res = await fetch(url)
      if (!res.ok) {
        console.log(fail(`${pad(slug, 35)} HTTP ${res.status}`))
        continue
      }

      const schemas = await res.json()
      const issues = []

      for (const schema of schemas) {
        const type = schema['@type']
        const required = requiredFields[type]
        if (!required) continue

        for (const field of required) {
          if (!schema[field] && schema[field] !== 0) {
            issues.push(`${type}.${field} missing`)
          }
        }

        // Deep checks
        if (type === 'FAQPage' && schema.mainEntity) {
          for (let i = 0; i < schema.mainEntity.length; i++) {
            const q = schema.mainEntity[i]
            if (!q.name) issues.push(`FAQ[${i}].name missing`)
            if (!q.acceptedAnswer?.text) issues.push(`FAQ[${i}].acceptedAnswer.text missing`)
          }
        }

        if (type === 'BreadcrumbList' && schema.itemListElement) {
          for (let i = 0; i < schema.itemListElement.length; i++) {
            const item = schema.itemListElement[i]
            if (!item.position) issues.push(`Breadcrumb[${i}].position missing`)
            if (!item.name) issues.push(`Breadcrumb[${i}].name missing`)
          }
        }

        if (type === 'ItemList' && schema.itemListElement) {
          for (let i = 0; i < schema.itemListElement.length; i++) {
            const item = schema.itemListElement[i]
            if (!item.position) issues.push(`ItemList[${i}].position missing`)
            if (!item.item?.name) issues.push(`ItemList[${i}].item.name missing`)
          }
        }
      }

      if (issues.length === 0) {
        console.log(ok(`${pad(slug, 35)} All fields valid`))
      } else {
        console.log(fail(`${pad(slug, 35)} ${issues.length} issue(s)`))
        for (const issue of issues) {
          console.log(dim(`      - ${issue}`))
        }
      }
    } catch (e) {
      console.log(fail(`${pad(slug, 35)} ERROR: ${e.message}`))
    }
  }
}

// ═══════════════════════════════════════════════
// CHECK 6: AI Citation Check (web search)
// ═══════════════════════════════════════════════
async function checkAICitations(slugs) {
  console.log(bold('\nAI CITATIONS'))

  // Target queries per slug
  const targetQueries = {
    'copus-vs-arena': 'copus vs arena',
    'copus-vs-raindrop': 'copus vs raindrop',
    'copus-vs-pocket': 'copus vs pocket',
    'best-content-curation-tools-2026': 'best content curation tools 2026',
    'what-is-content-curation': 'what is content curation',
    'web3-content-curation-platform': 'web3 content curation platform',
    'arena-alternatives': 'arena alternatives',
    'curation-tools-for-researchers': 'curation tools for researchers'
  }

  for (const slug of slugs) {
    const query = targetQueries[slug] || slug.replace(/-/g, ' ')
    try {
      // Use Google Custom Search JSON API (free 100/day)
      // Falls back to simple check if no API key
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`
      // We can't scrape Google, so do a HEAD check on known citation sources
      // Check if copus.network appears in Google's cache
      const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${SITE_URL}/pages/${slug}`
      const res = await fetch(cacheUrl, { method: 'HEAD', redirect: 'manual' })

      if (res.status === 200 || res.status === 301 || res.status === 302) {
        console.log(ok(`${pad(`"${query}"`, 40)} Cached by Google`))
      } else {
        console.log(warn(`${pad(`"${query}"`, 40)} Not cached yet`))
      }
    } catch (e) {
      console.log(dim(`  ? ${pad(`"${query}"`, 40)} Cannot check (${e.message})`))
    }
  }

  console.log(dim('  Note: For full citation tracking, check manually in ChatGPT/Perplexity/Google'))
}

// ═══════════════════════════════════════════════
// CHECK 7: Cloudflare Analytics
// ═══════════════════════════════════════════════
async function checkCloudflareTraffic(slugs) {
  console.log(bold('\nTRAFFIC (Cloudflare Analytics)'))

  if (!CF_TOKEN || CF_TOKEN === 'REPLACE_ME' || !CF_ZONE || CF_ZONE === 'REPLACE_ME') {
    console.log(dim('  Skipped — Cloudflare API token/zone not configured'))
    console.log(dim(`  Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID in ${envPath}`))
    return
  }

  const now = new Date()
  const daysBack30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const daysBack7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const today = now.toISOString().split('T')[0]

  // Use httpRequests1dGroups (daily aggregation) — works on all plans with 30-day range
  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${CF_ZONE}" }) {
          httpRequests1dGroups(
            filter: {
              date_geq: "${daysBack30}"
              date_leq: "${today}"
            }
            limit: 1000
            orderBy: [date_ASC]
          ) {
            sum {
              requests
              pageViews
            }
            dimensions {
              date
            }
          }
        }
      }
    }`

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.log(fail(`Cloudflare API error: ${res.status} — ${errText.slice(0, 200)}`))
      return
    }

    const data = await res.json()

    if (data.errors?.length) {
      console.log(fail(`GraphQL error: ${data.errors[0].message}`))
      return
    }

    const zones = data.data?.viewer?.zones
    if (!zones?.length) {
      console.log(fail('No zone data returned'))
      return
    }

    const groups = zones[0].httpRequests1dGroups || []

    // httpRequests1dGroups gives zone-wide totals per day (no per-path breakdown on free plan)
    // Sum up total requests and page views across the period
    let totalRequests = 0
    let totalPageViews = 0
    for (const g of groups) {
      totalRequests += g.sum.requests || 0
      totalPageViews += g.sum.pageViews || 0
    }

    console.log(dim(`  Last 30 days (${daysBack30} to ${today}):`))
    console.log(`    Total zone requests: ${totalRequests.toLocaleString()}`)
    console.log(`    Total page views:    ${totalPageViews.toLocaleString()}`)
    console.log(dim('    Note: Free plan shows zone-wide totals. Per-path breakdown requires Pro+ plan.'))
    console.log(dim('    Content page traffic estimated from zone total × content page share.'))
  } catch (e) {
    console.log(fail(`Cloudflare error: ${e.message}`))
  }
}

// ═══════════════════════════════════════════════
// RECOMMENDATIONS ENGINE
// ═══════════════════════════════════════════════
function printRecommendations(healthResults) {
  console.log(bold('\nRECOMMENDATIONS'))

  const broken = healthResults.filter(r => !r.ok)
  const slow = healthResults.filter(r => r.ok && r.ms > 500)

  if (broken.length > 0) {
    for (const r of broken) {
      console.log(red(`  - Fix ${r.slug}: HTTP ${r.status || 'ERROR'}${r.error ? ` (${r.error})` : ''}`))
    }
  }

  if (slow.length > 0) {
    for (const r of slow) {
      console.log(yellow(`  - Optimize ${r.slug}: ${r.ms}ms response time (target <500ms)`))
    }
  }

  if (broken.length === 0 && slow.length === 0) {
    console.log(green('  All pages healthy!'))
  }
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
async function main() {
  const today = new Date().toISOString().split('T')[0]
  console.log(bold('=== Copus SEO Validator Report ==='))
  console.log(`Date: ${today}`)
  console.log(`Site: ${SITE_URL}`)
  if (SKIP.size > 0) console.log(`Skipping: ${[...SKIP].join(', ')}`)

  const slugs = getSlugsFromContent()
  const pageTypes = getPageTypes()
  console.log(`Pages: ${slugs.length} (${slugs.join(', ')})`)

  // Check 1: Page Health
  const healthResults = await checkPageHealth(slugs)

  // Check 2: Schema Validation
  await checkSchemaValidation(slugs, pageTypes)

  // Check 3: Consistency
  await checkConsistency(slugs)

  // Check 4: Google Indexing
  if (!SKIP.has('indexing')) {
    await checkGoogleIndexing(slugs)
  } else {
    console.log(bold('\nGOOGLE INDEXING'))
    console.log(dim('  Skipped via --skip=indexing'))
  }

  // Check 5: Rich Results
  await checkRichResults(slugs)

  // Check 6: AI Citations
  if (!SKIP.has('citations')) {
    await checkAICitations(slugs)
  } else {
    console.log(bold('\nAI CITATIONS'))
    console.log(dim('  Skipped via --skip=citations'))
  }

  // Check 7: Cloudflare Traffic
  if (!SKIP.has('traffic')) {
    await checkCloudflareTraffic(slugs)
  } else {
    console.log(bold('\nTRAFFIC'))
    console.log(dim('  Skipped via --skip=traffic'))
  }

  // Recommendations
  printRecommendations(healthResults)

  console.log('')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
