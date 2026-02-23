// Topics index page - lists all available topics for AI agents to browse

function getConfig(hostname) {
  const isTest = hostname.includes('test.')
  return {
    siteUrl: isTest ? 'https://test.copus.network' : 'https://copus.network'
  }
}

const TOPICS = [
  { slug: 'personal-growth', name: 'Personal Growth', description: 'Self-development, emotional growth, life improvement' },
  { slug: 'self-improvement', name: 'Self Improvement', description: 'Skills development, habits, becoming better' },
  { slug: 'mindfulness', name: 'Mindfulness', description: 'Meditation, awareness, mental clarity' },
  { slug: 'mental-health', name: 'Mental Health', description: 'Psychological wellbeing, therapy, emotional health' },
  { slug: 'wellness', name: 'Wellness', description: 'Health, fitness, wellbeing' },
  { slug: 'productivity', name: 'Productivity', description: 'Getting things done, efficiency, time management' },
  { slug: 'ai-tools', name: 'AI Tools', description: 'Artificial intelligence tools and applications' },
  { slug: 'free-software', name: 'Free Software', description: 'Free and open source software' },
  { slug: 'open-source', name: 'Open Source', description: 'Open source projects and tools' },
  { slug: 'linux', name: 'Linux', description: 'Linux operating system, tools, tutorials' },
  { slug: 'technology', name: 'Technology', description: 'Tech news, tools, innovations' },
  { slug: 'software', name: 'Software', description: 'Software tools and applications' },
  { slug: 'tools', name: 'Tools', description: 'Useful tools and utilities' },
  { slug: 'watermark-remover', name: 'Watermark Remover', description: 'Tools to remove watermarks from images' },
  { slug: 'art', name: 'Art', description: 'Art, creativity, visual design' },
  { slug: 'design', name: 'Design', description: 'Design tools, UI/UX, graphics' },
  { slug: 'creativity', name: 'Creativity', description: 'Creative tools and inspiration' },
  { slug: 'learning', name: 'Learning', description: 'Education, courses, knowledge' },
  { slug: 'books', name: 'Books', description: 'Book recommendations, reading' },
  { slug: 'health', name: 'Health', description: 'Physical health, medicine, fitness' }
]

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const config = getConfig(url.hostname)

  const topicsHtml = TOPICS.map(topic => `
    <li>
      <a href="${config.siteUrl}/topics/${topic.slug}"><strong>${topic.name}</strong></a>
      - ${topic.description}
    </li>
  `).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Browse Topics - Copus</title>
  <meta name="description" content="Browse curated content by topic on Copus. Find personal growth, AI tools, productivity, and more.">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #f23a00; }
    a { color: #f23a00; }
    ul { list-style: none; padding: 0; }
    li { margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
    .nav { margin-bottom: 20px; }
    .nav a { margin-right: 15px; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="${config.siteUrl}">Home</a>
    <a href="${config.siteUrl}/articles.txt">All Articles</a>
    <a href="${config.siteUrl}/ai">AI Documentation</a>
  </nav>

  <h1>Browse Topics on Copus</h1>
  <p>Click any topic below to see human-curated content recommendations.</p>

  <section>
    <h2>Popular Topics</h2>
    <ul>
      <li><a href="${config.siteUrl}/topics/personal-growth"><strong>Personal Growth</strong></a> - Self-development, emotional growth</li>
      <li><a href="${config.siteUrl}/topics/ai-tools"><strong>AI Tools</strong></a> - Artificial intelligence tools</li>
      <li><a href="${config.siteUrl}/topics/productivity"><strong>Productivity</strong></a> - Getting things done</li>
      <li><a href="${config.siteUrl}/topics/free-software"><strong>Free Software</strong></a> - Free and open source</li>
    </ul>
  </section>

  <section>
    <h2>All Topics</h2>
    <ul>
      ${topicsHtml}
    </ul>
  </section>

  <section>
    <h2>Categories</h2>
    <ul>
      <li><a href="${config.siteUrl}/api/search?category=Technology">Technology</a></li>
      <li><a href="${config.siteUrl}/api/search?category=Art">Art</a></li>
      <li><a href="${config.siteUrl}/api/search?category=Sports">Sports</a></li>
      <li><a href="${config.siteUrl}/api/search?category=Life">Life</a></li>
      <li><a href="${config.siteUrl}/api/search?category=Health">Health</a></li>
    </ul>
  </section>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
    <p>Copus - The Internet Treasure Map</p>
    <p><a href="${config.siteUrl}">Home</a> | <a href="${config.siteUrl}/articles.txt">All articles</a></p>
  </footer>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
