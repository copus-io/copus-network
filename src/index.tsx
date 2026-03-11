import { Buffer } from 'buffer';

// CRITICAL: Set up polyfills BEFORE any other imports
(window as any).global = globalThis;
(window as any).Buffer = Buffer;

import { createRoot } from "react-dom/client";
import { App } from "./App";
import { logEnvironmentInfo } from "./utils/envUtils";
import { getVisitorId, getSessionId, incrementPageViewCount } from "./services/analyticsService";
import { initCapacitorListeners } from "./utils/capacitorInit";

// Log environment info at application startup
logEnvironmentInfo();

// Initialize anonymous visitor ID (persists across sessions in localStorage)
// and session ID (per-tab, created fresh each time)
getVisitorId();
getSessionId();

// Capture landing page + UTM params on first visit for signup attribution
if (!sessionStorage.getItem('copus_landing_page')) {
  sessionStorage.setItem('copus_landing_page', window.location.pathname + window.location.search);
}

// Count initial page view (subsequent SPA navigations tracked in RouteTracker)
incrementPageViewCount();

// Persist attribution data in localStorage so it survives OAuth redirects
// Always store referrer + landingPage; include UTM params if present
if (!localStorage.getItem('copus_utm')) {
  const _utmParams = new URLSearchParams(window.location.search);
  localStorage.setItem('copus_utm', JSON.stringify({
    utm_source: _utmParams.get('utm_source') || '',
    utm_medium: _utmParams.get('utm_medium') || '',
    utm_campaign: _utmParams.get('utm_campaign') || '',
    referrer: document.referrer || '',
    landing_page: window.location.pathname + window.location.search,
    captured_at: new Date().toISOString(),
  }));
} else {
  // If UTM params exist in URL, overwrite with fresh data (user clicked a campaign link)
  const _utmParams = new URLSearchParams(window.location.search);
  if (_utmParams.get('utm_source') || _utmParams.get('utm_medium') || _utmParams.get('utm_campaign')) {
    localStorage.setItem('copus_utm', JSON.stringify({
      utm_source: _utmParams.get('utm_source') || '',
      utm_medium: _utmParams.get('utm_medium') || '',
      utm_campaign: _utmParams.get('utm_campaign') || '',
      referrer: document.referrer || '',
      landing_page: window.location.pathname + window.location.search,
      captured_at: new Date().toISOString(),
    }));
  }
}

// Initialize Capacitor deep link listeners (no-op on web)
initCapacitorListeners();

createRoot(document.getElementById("app") as HTMLElement).render(
  <App />
);
