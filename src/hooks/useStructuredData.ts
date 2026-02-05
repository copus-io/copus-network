/**
 * React hook for managing structured data (JSON-LD)
 * Automatically injects and cleans up structured data on mount/unmount
 */

import { useEffect } from 'react';
import {
  injectJsonLd,
  removeJsonLd,
  createPersonJsonLd,
  createCollectionJsonLd,
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  PersonStructuredData,
  CollectionStructuredData
} from '../utils/structuredData';

// Script IDs for different types of structured data
const SCRIPT_IDS = {
  PERSON: 'copus-person-jsonld',
  COLLECTION: 'copus-collection-jsonld',
  ARTICLE: 'copus-article-jsonld',
  BREADCRUMB: 'copus-breadcrumb-jsonld'
} as const;

/**
 * Hook to inject Person structured data for user profile pages
 */
export function usePersonStructuredData(data: PersonStructuredData | null) {
  useEffect(() => {
    if (!data) return;

    const jsonLd = createPersonJsonLd(data);
    injectJsonLd(SCRIPT_IDS.PERSON, jsonLd);

    // Also update document title for better SEO
    document.title = `${data.name} (@${data.namespace}) | Copus - Open-Web Curation`;

    return () => {
      removeJsonLd(SCRIPT_IDS.PERSON);
    };
  }, [data]);
}

/**
 * Hook to inject Collection structured data for treasury pages
 */
export function useCollectionStructuredData(data: CollectionStructuredData | null) {
  useEffect(() => {
    if (!data) return;

    const jsonLd = createCollectionJsonLd(data);
    injectJsonLd(SCRIPT_IDS.COLLECTION, jsonLd);

    // Also update document title
    document.title = `${data.name} by ${data.authorName} | Copus Treasury`;

    return () => {
      removeJsonLd(SCRIPT_IDS.COLLECTION);
    };
  }, [data]);
}

/**
 * Hook to inject Article structured data for curation pages
 */
export function useArticleStructuredData(data: {
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
} | null) {
  useEffect(() => {
    if (!data) return;

    const jsonLd = createArticleJsonLd(data);
    injectJsonLd(SCRIPT_IDS.ARTICLE, jsonLd);

    // Also update document title
    document.title = `${data.title} | Curated by ${data.authorName} on Copus`;

    return () => {
      removeJsonLd(SCRIPT_IDS.ARTICLE);
    };
  }, [data]);
}

/**
 * Hook to inject breadcrumb navigation for better AI context
 */
export function useBreadcrumbStructuredData(items: Array<{ name: string; url: string }> | null) {
  useEffect(() => {
    if (!items || items.length === 0) return;

    const jsonLd = createBreadcrumbJsonLd(items);
    injectJsonLd(SCRIPT_IDS.BREADCRUMB, jsonLd);

    return () => {
      removeJsonLd(SCRIPT_IDS.BREADCRUMB);
    };
  }, [items]);
}
