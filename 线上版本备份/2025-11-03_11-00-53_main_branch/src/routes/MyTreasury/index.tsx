import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MyTreasury } from "./screens/MyTreasury";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <MyTreasury />
  </StrictMode>,
);
