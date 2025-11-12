import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Create } from "./screens/Create";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Create />
  </StrictMode>,
);
