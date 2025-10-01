import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LinkPreview } from "./screens/LinkPreview";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <LinkPreview />
  </StrictMode>,
);
