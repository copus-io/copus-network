import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Withdraw } from "./screens/Withdraw";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Withdraw />
  </StrictMode>,
);
