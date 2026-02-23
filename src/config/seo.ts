// SEO Constants and Microcopy
// Use these constants throughout the site for consistent SEO-optimized language

export const SEO_CONSTANTS = {
  // Identity statements
  IDENTITY: {
    TAGLINE: 'Copus is an open-web curation network that rewards curators and original creators.',
    MISSION: 'Collect Internet gems, preserve them permanently, and help sustain the open web.',
    VALUE_PROP: 'We reward taste. Share valuable content and earn from each visit.',
    PRINCIPLES: 'Copus is open source, privacy-first, and community-driven.',
  },

  // Problem/solution statements
  MESSAGING: {
    PROBLEM_STATEMENT: 'AI summaries reduce visits to original websites. Copus introduces a model that pays creators and curators directly.',
    SOLUTION_STATEMENT: 'The open web needs a business model beyond ads. Copus provides one.',
  },

  // Value propositions
  VALUE_PROPOSITIONS: {
    DISCOVER: 'Discover and share high-quality content while rewarding the people who create it.',
    BOOKMARKS: 'Your bookmarks deserve to be seen—and to support creators.',
  },

  // Meta descriptions for different pages (can be used with react-helmet or similar)
  META: {
    DEFAULT_TITLE: 'Copus – Open-Web Curation & Creator Rewards',
    DEFAULT_DESCRIPTION: 'Copus is an open-web curation network that rewards curators and original creators for sharing valuable web content. A sustainable alternative to ads-based monetization.',
    OG_TITLE: 'Copus – Welcome to the Taste Economy',
    OG_DESCRIPTION: 'A new economic model where tastemakers earn by curating valuable content. Your curation creates value.',
    TWITTER_TITLE: 'Welcome to the Taste Economy',
    TWITTER_DESCRIPTION: 'A new economic model where tastemakers earn by curating valuable content. Your curation creates value.',
  },

  // URLs
  URLS: {
    BASE: 'https://copus.network/',
    OG_IMAGE: 'https://copus.network/og-image.png',
    LOGO: 'https://copus.network/logo.png',
  },
};

// Keywords for SEO - use naturally in content
export const SEO_KEYWORDS = {
  // PRIMARY keywords - use naturally and repeatedly in documentation, info pages, and posts
  PRIMARY: [
    'open-web curation network',
    'curator rewards',
    'creator rewards',
    'alternative to ads-based monetization',
  ],

  // SECONDARY keywords - use only when relevant, not stuffed
  SECONDARY: [
    'independent creators',
    'Internet gems',
    'preserving valuable content',
    'sharing underrated content',
    'sustainable model for the open web',
  ],
};

// Image ALT text guidelines - use these patterns for consistent image SEO
export const IMAGE_ALT_EXAMPLES = {
  INTERFACE: 'Copus interface showing curated links and creator rewards',
  REVENUE_MODEL: 'Copus revenue sharing model between curators and original creators',
  PRESERVATION: 'Preserving curated web links using Copus',
};

// Recommended image filenames for SEO
export const IMAGE_FILENAME_GUIDELINES = [
  'copus-open-web-curation.png',
  'copus-reward-model.png',
  'copus-link-preservation.png',
  'copus-internet-gems.png',
];

// Internal linking rules
// First mention of these terms on information pages should link to these paths
export const INTERNAL_LINKING = {
  'Copus': '/',
  'open web': '/about',
  'creator rewards': '/rewards', // or /how-it-works when created
  'curator rewards': '/rewards', // or /how-it-works when created
};
