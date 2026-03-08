#!/usr/bin/env node

// Auto-refresh content pages using Claude API
// Reads current _content.js, updates stats/claims, suggests new pages
// Run: node scripts/refresh-content-pages.mjs [--dry-run]
// Config: ~/.copus-seo/.env (ANTHROPIC_API_KEY required)

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { homedir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CONTENT_PATH = join(ROOT, 'functions', 'pages', '_content.js')
const SITEMAP_PATH = join(ROOT, 'functions', 'sitemap.xml.js')
const LLMS_PATH = join(ROOT, 'functions', 'llms.txt.js')

const DRY_RUN = process.argv.includes('--dry-run')

// --- .env loader (no npm dependency) ---
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
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    vars[key] = val
  }
  return vars
}

const envPath = join(homedir(), '.copus-seo', '.env')
const envVars = loadEnvFile(envPath)

// Env var precedence: process.env > .env file
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || envVars.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'sk-ant-REPLACE_ME') {
  console.error('Error: ANTHROPIC_API_KEY is required')
  console.error(`Set it in ${envPath} or as an environment variable`)
  process.exit(1)
}

const MAX_NEW_PAGES = 2
const RETIREMENT_MONTHS = 6

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE — no files will be written\n')
}

async function callClaude(prompt, maxTokens = 4096) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function fetchCopusStats() {
  try {
    const response = await fetch('https://api-prod.copus.network/client/home/statistics', {
      headers: { 'Content-Type': 'application/json' }
    })
    if (response.ok) {
      const json = await response.json()
      if (json.status === 1 && json.data) {
        return {
          articles: json.data.publicArticleCount || json.data.articleCount || 0,
          users: json.data.userCount || 0,
          treasuries: json.data.spaceCount || json.data.treasuryCount || 0
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch Copus stats:', e.message)
  }
  return null
}

function getPageAge(lastModified) {
  const modified = new Date(lastModified)
  const now = new Date()
  const months = (now.getFullYear() - modified.getFullYear()) * 12 + (now.getMonth() - modified.getMonth())
  return months
}

// --- Diff summary helper ---
function showDiff(label, oldContent, newContent) {
  if (oldContent === newContent) {
    console.log(`  ${label}: no changes`)
    return false
  }
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const added = newLines.length - oldLines.length

  console.log(`  ${label}:`)
  console.log(`    Lines: ${oldLines.length} -> ${newLines.length} (${added >= 0 ? '+' : ''}${added})`)

  // Show first few changed lines
  let changesShown = 0
  for (let i = 0; i < Math.max(oldLines.length, newLines.length) && changesShown < 5; i++) {
    if (oldLines[i] !== newLines[i]) {
      if (oldLines[i] && newLines[i]) {
        console.log(`    L${i + 1}: "${oldLines[i].trim().slice(0, 60)}" -> "${newLines[i].trim().slice(0, 60)}"`)
      } else if (!oldLines[i]) {
        console.log(`    L${i + 1}: + "${(newLines[i] || '').trim().slice(0, 80)}"`)
      } else {
        console.log(`    L${i + 1}: - "${oldLines[i].trim().slice(0, 80)}"`)
      }
      changesShown++
    }
  }
  return true
}

async function refreshExistingPages(contentSource, stats) {
  const today = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()

  const prompt = `You are updating marketing content pages for Copus, a content curation platform.

Current date: ${today}
Current Copus stats: ${stats ? `${stats.articles} articles, ${stats.users} users, ${stats.treasuries} treasuries` : 'unavailable'}

Here is the current _content.js file:

\`\`\`javascript
${contentSource}
\`\`\`

Please update the content:
1. Update any year references to ${currentYear} where appropriate
2. Update lastModified dates to ${today}
3. Update any stats mentions to use current Copus stats if available
4. Check if any product claims seem outdated and flag them
5. Keep the exact same JavaScript structure and export format
6. Do NOT add or remove pages — only update existing content

Return ONLY the updated JavaScript file content, starting with the comment and export. No markdown code fences.`

  console.log('Refreshing existing pages...')
  const updated = await callClaude(prompt, 16000)
  return updated
}

async function detectTrends(existingSlugs) {
  const today = new Date().toISOString().split('T')[0]
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const prompt = `You are a content strategist for Copus, a content curation platform (copus.network).

Current date: ${today}
Existing page slugs: ${existingSlugs.join(', ')}

What are trending search queries in the content curation, bookmarking, knowledge management, and PKM (personal knowledge management) space in ${currentMonth}?

Suggest up to ${MAX_NEW_PAGES} new page topics that:
1. Target high-intent search queries not covered by existing pages
2. Are relevant to content curation and Copus's value proposition
3. Would work as one of these types: comparison, listicle, concept, alternatives

For each suggestion, provide:
- slug (URL-friendly, lowercase, hyphens)
- type (comparison | listicle | concept | alternatives)
- title (SEO-optimized, under 60 chars)
- targetQuery (the search query this page targets)
- brief (2-3 sentence description of what the page should cover)

Return a JSON array of suggestions. If no good opportunities exist, return an empty array.
Return ONLY valid JSON, no markdown fences or other text.`

  console.log('Detecting content trends...')
  const response = await callClaude(prompt, 2000)

  try {
    return JSON.parse(response.trim())
  } catch (e) {
    console.error('Failed to parse trend suggestions:', e.message)
    return []
  }
}

async function generateNewPage(suggestion, stats) {
  const today = new Date().toISOString().split('T')[0]

  const prompt = `Generate a complete page entry for a Copus marketing page.

Page details:
- Slug: ${suggestion.slug}
- Type: ${suggestion.type}
- Title: ${suggestion.title}
- Target query: ${suggestion.targetQuery}
- Brief: ${suggestion.brief}

Copus stats: ${stats ? `${stats.articles} articles, ${stats.users} users, ${stats.treasuries} treasuries` : 'use approximate numbers'}

The page entry should follow this exact structure (example for type "${suggestion.type}"):
- type, title, metaDescription, lastModified: '${today}'
- hero: { headline, subheadline, badge }
${suggestion.type === 'comparison' ? '- products: array of 2 products with name, tagline, features object, pros array, cons array\n- verdict: string' : ''}
${suggestion.type === 'listicle' || suggestion.type === 'alternatives' ? '- items: array of ranked items with rank, name, description, pricing, bestFor, url, highlight (boolean)' : ''}
- sections: array of { heading, paragraphs: string[], bullets?: string[] }
${suggestion.type === 'concept' ? '- copusCallout: { heading, paragraphs: string[] }' : ''}
- faqs: array of { question, answer }
- cta: { heading, text, buttonText, buttonUrl: "https://copus.network/signup" }

Return ONLY a valid JavaScript object (the page entry value, not including the key). No markdown fences.
The object should be valid JS that can be inserted as: PAGES['${suggestion.slug}'] = <your output>`

  console.log(`Generating new page: ${suggestion.slug}...`)
  const response = await callClaude(prompt, 8000)
  return response
}

function updateSitemapSlugs(sitemapSource, allSlugs) {
  const slugList = allSlugs.map(s => `    '${s}'`).join(',\n')
  const newArray = `const contentPages = [\n${slugList}\n  ]`

  const replaced = sitemapSource.replace(
    /const contentPages = \[[\s\S]*?\]/m,
    newArray
  )
  return replaced
}

async function main() {
  console.log('=== Content Page Refresh ===')
  console.log(`Date: ${new Date().toISOString()}`)
  if (DRY_RUN) console.log('Mode: DRY RUN')
  console.log(`Config: ${envPath}`)

  // Read current files
  const contentSource = readFileSync(CONTENT_PATH, 'utf-8')
  const sitemapSource = readFileSync(SITEMAP_PATH, 'utf-8')
  const llmsSource = readFileSync(LLMS_PATH, 'utf-8')

  // Fetch live stats
  const stats = await fetchCopusStats()
  if (stats) {
    console.log(`Copus stats: ${stats.articles} articles, ${stats.users} users, ${stats.treasuries} treasuries`)
  }

  const changes = []

  // Step 1: Refresh existing pages
  const updatedContent = await refreshExistingPages(contentSource, stats)
  if (updatedContent && updatedContent.includes('export const PAGES')) {
    if (DRY_RUN) {
      showDiff('_content.js', contentSource, updatedContent)
      changes.push('Would update existing page content and stats')
    } else {
      writeFileSync(CONTENT_PATH, updatedContent)
      changes.push('Updated existing page content and stats')
      console.log('Existing pages updated.')
    }
  } else {
    console.log('Skipping page update (response did not contain valid content)')
  }

  // Step 2: Detect trends and suggest new pages
  const currentContent = DRY_RUN ? (updatedContent || contentSource) : readFileSync(CONTENT_PATH, 'utf-8')
  const existingSlugs = []
  const pagesMatch = currentContent.match(/'([a-z0-9-]+)':\s*\{/g)
  if (pagesMatch) {
    for (const m of pagesMatch) {
      const slug = m.match(/'([a-z0-9-]+)'/)[1]
      existingSlugs.push(slug)
    }
  }

  const suggestions = await detectTrends(existingSlugs)

  if (suggestions.length > 0) {
    console.log(`Trend engine suggested ${suggestions.length} new pages`)

    for (const suggestion of suggestions.slice(0, MAX_NEW_PAGES)) {
      if (existingSlugs.includes(suggestion.slug)) {
        console.log(`Skipping ${suggestion.slug} (already exists)`)
        continue
      }

      try {
        const pageContent = await generateNewPage(suggestion, stats)

        if (DRY_RUN) {
          console.log(`  Would add: ${suggestion.slug} (${suggestion.title})`)
          console.log(`    Type: ${suggestion.type}`)
          console.log(`    Target: ${suggestion.targetQuery}`)
          console.log(`    Content length: ${pageContent.length} chars`)
          changes.push(`Would add new page: ${suggestion.slug}`)
        } else {
          let content = readFileSync(CONTENT_PATH, 'utf-8')
          const insertPoint = content.lastIndexOf("}\n\n// List of all content page slugs")
          if (insertPoint !== -1) {
            const newEntry = `,\n\n  '${suggestion.slug}': ${pageContent}\n`
            content = content.slice(0, insertPoint) + newEntry + content.slice(insertPoint)
            writeFileSync(CONTENT_PATH, content)
            changes.push(`Added new page: ${suggestion.slug} (${suggestion.title})`)
            console.log(`Added: ${suggestion.slug}`)
          }
        }
      } catch (e) {
        console.error(`Failed to generate ${suggestion.slug}:`, e.message)
      }
    }
  }

  // Step 3: Check for retirement candidates
  const finalContent = DRY_RUN ? currentContent : readFileSync(CONTENT_PATH, 'utf-8')
  const dateMatches = [...finalContent.matchAll(/'([a-z0-9-]+)':\s*\{[\s\S]*?lastModified:\s*'(\d{4}-\d{2}-\d{2})'/g)]
  for (const [, slug, lastModified] of dateMatches) {
    const age = getPageAge(lastModified)
    if (age >= RETIREMENT_MONTHS) {
      console.log(`Note: ${slug} is ${age} months old — consider reviewing for retirement`)
    }
  }

  // Step 4: Update sitemap and llms.txt with current slugs
  const allSlugs = []
  const allPagesMatch = finalContent.match(/'([a-z0-9-]+)':\s*\{/g)
  if (allPagesMatch) {
    for (const m of allPagesMatch) {
      allSlugs.push(m.match(/'([a-z0-9-]+)'/)[1])
    }
  }

  if (allSlugs.length > 0) {
    const updatedSitemap = updateSitemapSlugs(sitemapSource, allSlugs)
    if (updatedSitemap !== sitemapSource) {
      if (DRY_RUN) {
        showDiff('sitemap.xml.js', sitemapSource, updatedSitemap)
        changes.push('Would update sitemap with current page slugs')
      } else {
        writeFileSync(SITEMAP_PATH, updatedSitemap)
        changes.push('Updated sitemap with current page slugs')
      }
    }

    const llmsGuides = allSlugs.map(slug => {
      const titleMatch = finalContent.match(new RegExp(`'${slug}':[\\s\\S]*?title:\\s*'([^']*)'`))
      const title = titleMatch ? titleMatch[1].replace(/\s*\(\d{4}\)\s*$/, '').replace(/:\s.*$/, '') : slug
      return `- /pages/${slug} - ${title}`
    }).join('\n')

    const updatedLlms = llmsSource.replace(
      /## CONTENT GUIDES\n[\s\S]*?\n\n## ABOUT/m,
      `## CONTENT GUIDES\n${llmsGuides}\n\n## ABOUT`
    )
    if (updatedLlms !== llmsSource) {
      if (DRY_RUN) {
        showDiff('llms.txt.js', llmsSource, updatedLlms)
        changes.push('Would update llms.txt with current page list')
      } else {
        writeFileSync(LLMS_PATH, updatedLlms)
        changes.push('Updated llms.txt with current page list')
      }
    }
  }

  // Summary
  console.log('\n=== Summary ===')
  if (DRY_RUN) console.log('(DRY RUN — no files were modified)')
  if (changes.length === 0) {
    console.log('No changes made.')
  } else {
    for (const change of changes) {
      console.log(`- ${change}`)
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
