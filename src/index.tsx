import { Buffer } from 'buffer';

// CRITICAL: Set up polyfills BEFORE any other imports
(window as any).global = globalThis;
(window as any).Buffer = Buffer;

import { createRoot } from "react-dom/client";
import { App } from "./App";
import { logEnvironmentInfo } from "./utils/envUtils";

// Log environment info at application startup
logEnvironmentInfo();

createRoot(document.getElementById("app") as HTMLElement).render(
  <App />
);
