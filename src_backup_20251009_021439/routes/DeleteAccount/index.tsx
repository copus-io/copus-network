import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DeleteAccount } from "./screens/DeleteAccount";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <DeleteAccount />
  </StrictMode>,
);
