import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Published } from "./screens/Published";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Published />
  </StrictMode>,
);
