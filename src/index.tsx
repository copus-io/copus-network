import { Buffer } from 'buffer';

// CRITICAL: Set up polyfills BEFORE any other imports
(window as any).global = globalThis;
(window as any).Buffer = Buffer;

import { createRoot } from "react-dom/client";
import { App } from "./App";
import { logEnvironmentInfo } from "./utils/envUtils";

// Log environment info at application startup
logEnvironmentInfo();

// Capture landing page + UTM params on first visit for signup attribution
if (!sessionStorage.getItem('copus_landing_page')) {
  sessionStorage.setItem('copus_landing_page', window.location.pathname + window.location.search);
}

// Persist UTM params in localStorage so they survive OAuth redirects
// Only store if UTM params exist in URL (don't overwrite with empty values)
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

createRoot(document.getElementById("app") as HTMLElement).render(
  <App />
);
