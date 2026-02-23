// OpenAPI Specification for Copus API
// Machine-readable API documentation for AI agents

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  const openapi = `openapi: 3.0.0
info:
  title: Copus API
  description: |
    Copus is a human-curated content discovery platform.
    Find curators and curated content on any topic.

    QUICK START - Find curators:
    GET ${config.siteUrl}/api/discover?topic=YOUR_TOPIC

    QUICK START - Search content:
    GET ${config.siteUrl}/api/search?q=YOUR_QUERY

    Examples:
    - ${config.siteUrl}/api/discover?topic=AI (find curators)
    - ${config.siteUrl}/api/search?q=AI+tools (find content)
    - ${config.siteUrl}/api/taste/handuo.json (curator profile)
  version: 1.1.0
servers:
  - url: ${config.siteUrl}
    description: Copus API
paths:
  /api/discover:
    get:
      operationId: discoverCurators
      summary: Find curators with expertise in a topic
      description: |
        Discover human curators on Copus who curate content on a specific topic.
        Returns curators ranked by relevance, with their profiles, matching treasuries, and sample curations.
        Use this to find people to follow for a topic.
      parameters:
        - name: topic
          in: query
          description: Topic to find curators for (e.g., "AI", "crypto", "productivity")
          required: true
          schema:
            type: string
            example: AI tools
        - name: limit
          in: query
          description: Max curators to return (default 10, max 20)
          required: false
          schema:
            type: integer
            default: 10
            maximum: 20
      responses:
        '200':
          description: Curators with expertise in this topic
          content:
            application/json:
              schema:
                type: object
                properties:
                  '@type':
                    type: string
                    example: ItemList
                  query:
                    type: string
                  numberOfItems:
                    type: integer
                  itemListElement:
                    type: array
                    items:
                      type: object
                      properties:
                        item:
                          type: object
                          properties:
                            name:
                              type: string
                            namespace:
                              type: string
                            tasteProfileUrl:
                              type: string
                            matchingTreasuries:
                              type: array
  /api/search:
    get:
      operationId: searchCurations
      summary: Search curated content recommendations
      description: |
        Search for human-curated content on any topic.
        Returns articles with title, URL, description, and curator info.
        If no query provided, returns recent curations.
      parameters:
        - name: q
          in: query
          description: Search query (e.g., "AI tools", "personal growth", "productivity")
          required: false
          schema:
            type: string
            example: personal growth
        - name: category
          in: query
          description: Filter by category
          required: false
          schema:
            type: string
            enum: [Technology, Art, Sports, Life]
        - name: limit
          in: query
          description: Max results (default 10, max 50)
          required: false
          schema:
            type: integer
            default: 10
            maximum: 50
      responses:
        '200':
          description: Search results in JSON-LD format
          content:
            application/json:
              schema:
                type: object
                properties:
                  '@context':
                    type: string
                    example: https://schema.org
                  '@type':
                    type: string
                    example: SearchResultsPage
                  query:
                    type: string
                  totalResults:
                    type: integer
                  itemListElement:
                    type: array
                    items:
                      type: object
                      properties:
                        '@type':
                          type: string
                          example: ListItem
                        position:
                          type: integer
                        item:
                          type: object
                          properties:
                            '@type':
                              type: string
                              example: Article
                            name:
                              type: string
                            url:
                              type: string
                            description:
                              type: string
  /api/taste/{namespace}.json:
    get:
      operationId: getTasteProfile
      summary: Get curator's taste profile
      description: |
        Get a curator's full taste profile including all treasuries, curated articles, and AI-generated insights.
        Best way to understand a curator's interests and expertise.
      parameters:
        - name: namespace
          in: path
          required: true
          description: Curator's namespace (username identifier)
          schema:
            type: string
            example: handuo
      responses:
        '200':
          description: Full taste profile with treasuries and articles
  /work/{id}:
    get:
      operationId: getArticle
      summary: Get article details
      description: Get full details of a curated article including key takeaways
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
        - name: format
          in: query
          description: Set to 'json' for JSON-LD response
          schema:
            type: string
            enum: [json]
      responses:
        '200':
          description: Article details in JSON-LD format
`

  return new Response(openapi, {
    status: 200,
    headers: {
      'Content-Type': 'text/yaml',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
