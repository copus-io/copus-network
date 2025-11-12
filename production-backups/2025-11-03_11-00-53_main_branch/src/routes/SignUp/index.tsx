import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SignUp } from "./screens/SignUp";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <SignUp />
  </StrictMode>,
);
