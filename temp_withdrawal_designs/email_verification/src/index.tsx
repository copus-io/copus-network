import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Verify } from "./screens/Verify";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Verify />
  </StrictMode>,
);
