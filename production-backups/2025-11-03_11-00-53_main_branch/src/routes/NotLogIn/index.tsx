import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NotLogIn } from "./screens/NotLogIn";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <NotLogIn />
  </StrictMode>,
);
