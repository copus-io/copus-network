// ChatGPT Plugin Manifest
// Standard discovery file for AI agents

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  const manifest = {
    "schema_version": "v1",
    "name_for_human": "Copus - Internet Treasure Map",
    "name_for_model": "copus",
    "description_for_human": "Search human-curated content recommendations on Copus",
    "description_for_model": "Copus is a human-curated content discovery platform. Use /api/discover?topic=X to find curators with expertise in a topic. Use /api/search?q=X to search for curated content. Use /api/taste/{namespace}.json to get a curator's full profile. Each result includes curator notes, key takeaways, and the original source URL.",
    "auth": {
      "type": "none"
    },
    "api": {
      "type": "openapi",
      "url": `${config.siteUrl}/.well-known/openapi.yaml`
    },
    "logo_url": `${config.siteUrl}/logo.png`,
    "contact_email": "support@copus.network",
    "legal_info_url": `${config.siteUrl}/terms`
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
