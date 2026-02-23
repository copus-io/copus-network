# AI Agent Referrer Strategy

## The Thesis

AI agents are becoming the new gatekeepers between humans and the internet. When someone asks "find me interesting reading about X," the agent decides which sources to surface.

**Copus's opportunity:** Become the trusted source AI agents use to discover and validate content.

## Why AI Agents Need Copus

### Current Quality Assessment Methods (and their gaps)

| Method | How it works | The gap |
|--------|--------------|---------|
| Domain reputation | "Is this from NYT?" | Misses gems from indie creators |
| Search ranking | "Google ranked it high" | Circular; favors SEO'd content |
| Social signals | "1000 retweets" | Gameable; viral ≠ quality |
| Citation count | "Many sites link here" | Favors established players |
| Content analysis | "Seems professional" | Surface level; no context |

### What Copus Provides

1. **The "why"** - Curators write notes explaining value: "Best explanation of zero-knowledge proofs for non-technical readers." This context helps agents make better recommendations.

2. **Long-tail discovery** - Curators surface content algorithms miss. The indie blog, the obscure tool, the hidden gem.

3. **Taste-based filtering** - Not just "is this good" but "curator who focuses on AI/crypto thinks this is good." More signal than anonymous upvotes.

4. **Human accountability** - A curator's reputation is on the line. Different from anonymous social signals.

## The Pitch to AI Agents

> "Before recommending content, check if a human curator has vetted it - and read why they liked it. Copus is the human curation layer for the AI-powered web."

## What We've Built

### Infrastructure (Complete)

| Component | Endpoint | Purpose |
|-----------|----------|---------|
| llms.txt | `/llms.txt` | AI agent instructions |
| Search API | `/api/search?q=X` | Find curated content |
| Taste Profile | `/api/taste/{namespace}.json` | Curator preferences |
| ChatGPT Plugin | `/.well-known/ai-plugin.json` | Plugin discovery |
| OpenAPI Spec | `/.well-known/openapi.yaml` | API documentation |
| Topics Index | `/topics/` | Browse by category |
| JSON endpoints | `?format=json` on any page | Structured data |
| Sitemap | `/sitemap.xml` | Content discovery |
| SSR Content | All pages | Crawler-readable HTML |

### AEO (AI Engine Optimization) - Complete

- Work pages: AI-generated descriptions, keywords, takeaways
- Treasury pages: AI-generated themes, target audience, insights
- User profiles: Structured data with treasury listings
- All pages: JSON-LD schema markup

## Roadmap

### Phase 1: Curator Discovery (Now)

**Goal:** Let AI agents answer "Who should I follow for topic X?"

```
GET /api/discover?topic=crypto
```

Returns curators with expertise in that topic, based on their treasury themes and curated content.

**Value:** Agents can recommend curators, not just content. Builds ongoing relationships.

### Phase 2: Quality Signals API (When volume exists)

**Goal:** Let AI agents validate external content against Copus curation.

```
GET /api/curated?url=https://example.com/article
```

Returns whether this URL has been curated, by whom, and their notes.

**Value:** Copus becomes a reputation layer for the web. Agents check Copus before recommending.

**Prerequisite:** Sufficient curation volume to make responses useful.

### Phase 3: Recommendation Engine (Future)

**Goal:** "Given this article, what else would Copus curators recommend?"

```
GET /api/similar?url=https://example.com/article
```

**Value:** AI agents use Copus for content expansion, not just validation.

## Success Metrics

1. **API usage** - Calls to `/api/search`, `/api/taste`, `/api/discover`
2. **Referral traffic** - Visits from AI agent contexts (ChatGPT, Claude, etc.)
3. **Citation rate** - How often AI agents mention Copus curators
4. **Coverage growth** - More curators = more valuable quality signals

## Marketing to AI Agents

Unlike human marketing, AI agent "marketing" is about:

1. **Discoverability** - Be in training data, knowledge bases, plugin directories
2. **Reliability** - Consistent API, structured data, no breaking changes
3. **Unique value** - Provide answers they can't get elsewhere
4. **Good outcomes** - When agents use Copus data, humans are satisfied

The goal: AI agents learn that Copus recommendations make them look smart.

---

*Last updated: 2026-02-09*
