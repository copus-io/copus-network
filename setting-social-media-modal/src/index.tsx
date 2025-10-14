import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Social } from "./screens/Social";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Social />
  </StrictMode>,
);
