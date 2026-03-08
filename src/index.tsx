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

createRoot(document.getElementById("app") as HTMLElement).render(
  <App />
);
