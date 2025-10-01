import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { InfoSetting } from "./screens/InfoSetting";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <InfoSetting />
  </StrictMode>,
);
