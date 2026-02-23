/**
 * Structured Data (JSON-LD) utilities for AI Engine Optimization (AEO)
 *
 * This module provides utilities to inject schema.org structured data
 * into pages, making content more discoverable and understandable by
 * AI systems like Claude, ChatGPT, and search engines.
 */

// Base URL for Copus
const BASE_URL = 'https://copus.network';

/**
 * Person structured data for user profiles
 * Schema: https://schema.org/Person
 */
export interface PersonStructuredData {
  name: string;
  namespace: string;
  bio?: string;
  avatarUrl?: string;
  articleCount?: number;
  treasuredCount?: number;
  treasuries?: Array<{
    name: string;
    namespace: string;
    articleCount: number;
  }>;
}

/**
 * Collection structured data for treasuries
 * Schema: https://schema.org/Collection
 */
export interface CollectionStructuredData {
  name: string;
  namespace: string;
  description?: string;
  authorName: string;
  authorNamespace: string;
  authorAvatar?: string;
  articleCount: number;
  articles?: Array<{
    uuid: string;
    title: string;
    curationNote?: string;
    targetUrl?: string;
    category?: string;
  }>;
}

/**
 * Creates Person JSON-LD for user profile pages
 */
export function createPersonJsonLd(data: PersonStructuredData): object {
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/user/${data.namespace}#person`,
    'name': data.name,
    'url': `${BASE_URL}/user/${data.namespace}`,
    'identifier': data.namespace,
    'description': data.bio || `${data.name} is a curator on Copus, an open-web curation network.`,
  };

  if (data.avatarUrl) {
    jsonLd.image = data.avatarUrl;
  }

  // Add interaction statistics
  if (data.articleCount !== undefined || data.treasuredCount !== undefined) {
    jsonLd.interactionStatistic = [];

    if (data.articleCount !== undefined) {
      jsonLd.interactionStatistic.push({
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/WriteAction',
        'userInteractionCount': data.articleCount,
        'description': 'Number of curations created'
      });
    }

    if (data.treasuredCount !== undefined) {
      jsonLd.interactionStatistic.push({
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/LikeAction',
        'userInteractionCount': data.treasuredCount,
        'description': 'Number of items treasured/collected'
      });
    }
  }

  // Add treasuries as owned collections - this helps AI navigate to treasuries
  if (data.treasuries && data.treasuries.length > 0) {
    jsonLd.owns = {
      '@type': 'ItemList',
      'name': `${data.name}'s Treasuries`,
      'description': `Collections curated by ${data.name} on Copus`,
      'numberOfItems': data.treasuries.length,
      'itemListElement': data.treasuries.map((treasury, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Collection',
          '@id': `${BASE_URL}/treasury/${treasury.namespace}`,
          'name': treasury.name,
          'url': `${BASE_URL}/treasury/${treasury.namespace}`,
          'numberOfItems': treasury.articleCount,
          'description': `A curated collection by ${data.name} with ${treasury.articleCount} treasures`
        }
      }))
    };
  }

  // Add sameAs for profile link
  jsonLd.sameAs = [`${BASE_URL}/u/${data.namespace}`];

  return jsonLd;
}

/**
 * Creates Collection JSON-LD for treasury pages
 */
export function createCollectionJsonLd(data: CollectionStructuredData): object {
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    '@id': `${BASE_URL}/treasury/${data.namespace}`,
    'name': data.name,
    'url': `${BASE_URL}/treasury/${data.namespace}`,
    'description': data.description || `A curated collection of ${data.articleCount} treasures by ${data.authorName} on Copus.`,
    'numberOfItems': data.articleCount,
    'author': {
      '@type': 'Person',
      '@id': `${BASE_URL}/user/${data.authorNamespace}#person`,
      'name': data.authorName,
      'url': `${BASE_URL}/user/${data.authorNamespace}`,
      'image': data.authorAvatar
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Copus',
      'url': 'https://copus.network/'
    }
  };

  // Add articles as collection items - helps AI understand the curated content
  if (data.articles && data.articles.length > 0) {
    jsonLd.hasPart = data.articles.map((article, index) => ({
      '@type': 'CreativeWork',
      '@id': `${BASE_URL}/work/${article.uuid}`,
      'position': index + 1,
      'name': article.title,
      'url': `${BASE_URL}/work/${article.uuid}`,
      'description': article.curationNote || undefined,
      'mainEntityOfPage': article.targetUrl || undefined,
      'genre': article.category || undefined
    }));
  }

  return jsonLd;
}

/**
 * Creates Article JSON-LD for curation pages
 */
export function createArticleJsonLd(data: {
  uuid: string;
  title: string;
  curationNote?: string;
  targetUrl?: string;
  coverUrl?: string;
  category?: string;
  authorName: string;
  authorNamespace: string;
  authorAvatar?: string;
  publishedAt?: number;
  viewCount?: number;
  likeCount?: number;
}): object {
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${BASE_URL}/work/${data.uuid}`,
    'headline': data.title,
    'name': data.title,
    'url': `${BASE_URL}/work/${data.uuid}`,
    'author': {
      '@type': 'Person',
      '@id': `${BASE_URL}/user/${data.authorNamespace}#person`,
      'name': data.authorName,
      'url': `${BASE_URL}/user/${data.authorNamespace}`,
      'image': data.authorAvatar
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Copus',
      'url': 'https://copus.network/',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://copus.network/logo.png'
      }
    }
  };

  if (data.curationNote) {
    jsonLd.description = data.curationNote;
    jsonLd.abstract = data.curationNote;
  }

  if (data.coverUrl) {
    jsonLd.image = data.coverUrl;
  }

  if (data.targetUrl) {
    jsonLd.mainEntityOfPage = data.targetUrl;
    jsonLd.isBasedOn = data.targetUrl;
  }

  if (data.category) {
    jsonLd.genre = data.category;
    jsonLd.articleSection = data.category;
  }

  if (data.publishedAt) {
    const date = new Date(data.publishedAt * 1000).toISOString();
    jsonLd.datePublished = date;
    jsonLd.dateModified = date;
  }

  if (data.viewCount !== undefined || data.likeCount !== undefined) {
    jsonLd.interactionStatistic = [];

    if (data.viewCount !== undefined) {
      jsonLd.interactionStatistic.push({
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/ViewAction',
        'userInteractionCount': data.viewCount
      });
    }

    if (data.likeCount !== undefined) {
      jsonLd.interactionStatistic.push({
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/LikeAction',
        'userInteractionCount': data.likeCount,
        'description': 'Number of times this curation was treasured'
      });
    }
  }

  return jsonLd;
}

/**
 * Injects JSON-LD structured data into the page head
 * Creates or updates a script tag with the given ID
 */
export function injectJsonLd(id: string, data: object): void {
  // Remove existing script if present
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // Create new script element
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data, null, 2);

  document.head.appendChild(script);
}

/**
 * Removes JSON-LD structured data from the page
 */
export function removeJsonLd(id: string): void {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
}

/**
 * Creates a BreadcrumbList for navigation context
 */
export function createBreadcrumbJsonLd(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}
