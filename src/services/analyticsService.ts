// Analytics service for funnel event tracking + article view attribution
// Sends GA4 custom events + backend tracking POST + sessionStorage replay

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// --- Visitor & session identity ---

/** Persistent anonymous visitor ID (survives browser restarts) */
export function getVisitorId(): string {
  let id = localStorage.getItem('copus_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('copus_visitor_id', id);
  }
  return id;
}

/** Per-tab session ID (new on each tab/window) */
export function getSessionId(): string {
  let sid = sessionStorage.getItem('copus_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('copus_session_id', sid);
    sessionStorage.setItem('copus_session_start', new Date().toISOString());
  }
  return sid;
}

/** Get logged-in user ID from localStorage, or null */
function getUserId(): number | null {
  try {
    const raw = localStorage.getItem('copus_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.id ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

// --- Session context helpers ---

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
  };
}

function getReferrerDomain(): string {
  const referrer = document.referrer || '';
  if (!referrer) return 'direct';
  try {
    return new URL(referrer).hostname;
  } catch {
    return 'unknown';
  }
}

function getLandingPage(): string {
  return sessionStorage.getItem('copus_landing_page') || '';
}

// --- Generic event tracker ---

/**
 * Track a funnel event across GA4, backend, and sessionStorage.
 * Fire-and-forget — never blocks or throws.
 */
export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  const timestamp = new Date().toISOString();
  const eventData = {
    ...properties,
    referrer_domain: properties.referrer_domain || getReferrerDomain(),
  };

  // 1) GA4 custom event
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }

  // 2) Backend tracking with visitor/session/user identity
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  fetch(`${API_BASE_URL}/client/common/trackEvent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      event: eventName,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      user_id: getUserId(),
      properties: eventData,
      timestamp,
      landingPage: getLandingPage(),
      path: window.location.pathname,
    })
  }).catch(() => {});

  // 3) SessionStorage replay log (keep last 50 events)
  try {
    const key = 'copus_event_log';
    const log = JSON.parse(sessionStorage.getItem(key) || '[]');
    log.push({ event: eventName, ...eventData, timestamp });
    if (log.length > 50) log.shift();
    sessionStorage.setItem(key, JSON.stringify(log));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

// --- Specific event helpers ---

/**
 * Track SPA page view. Called on every route change.
 */
export function trackPageView(path: string) {
  const utm = getUtmParams();
  trackEvent('page_view', {
    path,
    referrer: document.referrer || '',
    landing_page: getLandingPage(),
    ...utm,
  });
}

/**
 * Track article view with source attribution.
 * Called from Content.tsx on article mount.
 */
export function trackArticleView(articleUuid: string) {
  const utm = getUtmParams();
  const referrer = document.referrer || '';

  trackEvent('article_view', {
    article_id: articleUuid,
    referrer,
    ...utm,
  });

  // Legacy: also fire the old attributed event for backwards compat with GA4 reports
  if (window.gtag) {
    window.gtag('event', 'article_view_attributed', {
      article_id: articleUuid,
      referrer_domain: getReferrerDomain(),
      utm_source: utm.utm_source || '(none)',
      utm_medium: utm.utm_medium || '(none)',
      utm_campaign: utm.utm_campaign || '(none)',
    });
  }

  // Legacy: backend trackView endpoint
  if (referrer || utm.utm_source) {
    fetch(`${API_BASE_URL}/client/common/article/trackView`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: articleUuid,
        referrer,
        utmSource: utm.utm_source,
        utmMedium: utm.utm_medium,
        utmCampaign: utm.utm_campaign,
        source: 'client'
      })
    }).catch(() => {});
  }
}

export function trackSignupStart() {
  trackEvent('signup_start', {
    referrer: document.referrer || '',
    landing_page: getLandingPage(),
    ...getUtmParams(),
  });
}

export function trackSignupComplete() {
  trackEvent('signup_complete', {
    referrer: document.referrer || '',
    landing_page: getLandingPage(),
    ...getUtmParams(),
  });
}

export function trackArticleCreateStart() {
  trackEvent('article_create_start', {});
}

export function trackArticlePublish(articleUuid: string) {
  trackEvent('article_publish', { article_id: articleUuid });
}

export function trackUserFollow(targetUserId: string | number) {
  trackEvent('user_follow', { target_user_id: String(targetUserId) });
}

export function trackShareClick(medium: 'copy' | 'twitter') {
  trackEvent('share_click', { medium });
}

// --- New engagement events ---

export function trackLike(articleUuid: string) {
  trackEvent('like', { article_id: articleUuid });
}

export function trackUnlike(articleUuid: string) {
  trackEvent('unlike', { article_id: articleUuid });
}

export function trackTreasurySave(articleUuid: string, spaceIds: number[]) {
  trackEvent('treasury_save', { article_id: articleUuid, space_ids: spaceIds });
}

export function trackSearch(query: string, resultCount: number) {
  trackEvent('search', { query, result_count: resultCount });
}

export function trackComment(articleUuid: string) {
  trackEvent('comment', { article_id: articleUuid });
}

export function trackSubscribe(targetUserId: string) {
  trackEvent('subscribe', { target_user_id: targetUserId });
}

export function trackVisitClick(articleUuid: string, targetUrl: string) {
  trackEvent('visit_click', { article_id: articleUuid, target_url: targetUrl });
}

export function trackUnlock(articleUuid: string, amount: string) {
  trackEvent('unlock', { article_id: articleUuid, amount });
}

// --- Engagement depth ---

export function trackReadDepth(articleUuid: string, percent: number, timeSpentMs: number) {
  trackEvent('read_depth', { article_id: articleUuid, percent, time_spent_ms: timeSpentMs });
}

// --- AARRR: Activation milestones ---

export function trackProfileUpdate(fields: string[]) {
  trackEvent('profile_update', { fields_updated: fields });
}

export function trackReturnVisit() {
  const lastVisit = localStorage.getItem('copus_last_visit');
  const now = new Date().toISOString();
  localStorage.setItem('copus_last_visit', now);

  if (lastVisit) {
    const gapMs = Date.now() - new Date(lastVisit).getTime();
    const gapDays = Math.floor(gapMs / (1000 * 60 * 60 * 24));
    if (gapDays >= 1) {
      trackEvent('return_visit', { days_since_last: gapDays, last_visit: lastVisit });
    }
  }
}

// --- AARRR: Revenue ---

export function trackPaymentSuccess(articleUuid: string, amount: string, currency: string) {
  trackEvent('payment_success', { article_id: articleUuid, amount, currency });
}

export function trackPaymentFailed(articleUuid: string, error: string) {
  trackEvent('payment_failed', { article_id: articleUuid, error });
}

// --- Session lifecycle ---

/** Increment page view counter in sessionStorage */
export function incrementPageViewCount() {
  const count = parseInt(sessionStorage.getItem('copus_page_count') || '0', 10);
  sessionStorage.setItem('copus_page_count', String(count + 1));
}

/** Send session_end event via sendBeacon (reliable on page unload) */
export function trackSessionEnd() {
  const sessionStart = sessionStorage.getItem('copus_session_start');
  const pagesViewed = parseInt(sessionStorage.getItem('copus_page_count') || '0', 10);
  const durationMs = sessionStart ? Date.now() - new Date(sessionStart).getTime() : 0;

  const payload = JSON.stringify({
    event: 'session_end',
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    user_id: getUserId(),
    properties: { pages_viewed: pagesViewed, duration_ms: durationMs },
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    landingPage: getLandingPage(),
  });

  navigator.sendBeacon(
    `${API_BASE_URL}/client/common/trackEvent`,
    new Blob([payload], { type: 'application/json' })
  );
}
