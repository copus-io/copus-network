import { createRoot } from "react-dom/client";
import { App } from "./App";
import { logEnvironmentInfo } from "./utils/envUtils";

// 在应用启动时输出环境信息
logEnvironmentInfo();

createRoot(document.getElementById("app") as HTMLElement).render(
  <App />
);
