import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PopUp } from "./screens/PopUp";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <PopUp />
  </StrictMode>,
);
