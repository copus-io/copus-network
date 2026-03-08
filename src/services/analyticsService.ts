// Analytics service for article view source attribution tracking
// Sends GA4 custom events + backend tracking POST

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Track an article view with referrer/UTM source attribution.
 * - Fires GA4 custom event (works immediately)
 * - Fires backend tracking POST (gracefully fails if endpoint doesn't exist yet)
 *
 * Called from Content.tsx on article mount to capture SPA navigation sources.
 * Edge-level tracking is handled separately by the Cloudflare Worker.
 */
export function trackArticleView(articleUuid: string) {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || '';
  const utmSource = params.get('utm_source') || '';
  const utmMedium = params.get('utm_medium') || '';
  const utmCampaign = params.get('utm_campaign') || '';

  // Derive referrer domain safely
  let referrerDomain = 'direct';
  if (referrer) {
    try {
      referrerDomain = new URL(referrer).hostname;
    } catch {
      referrerDomain = 'unknown';
    }
  }

  // 1) GA4 custom event
  if (window.gtag) {
    window.gtag('event', 'article_view_attributed', {
      article_id: articleUuid,
      referrer_domain: referrerDomain,
      utm_source: utmSource || '(none)',
      utm_medium: utmMedium || '(none)',
      utm_campaign: utmCampaign || '(none)',
    });
  }

  // 2) Backend tracking (gracefully fails if endpoint doesn't exist)
  if (referrer || utmSource) {
    fetch(`${API_BASE_URL}/client/common/article/trackView`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: articleUuid,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        source: 'client'
      })
    }).catch(() => {});
  }
}
