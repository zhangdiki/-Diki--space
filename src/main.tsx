import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // 确保引入了你之前创建的全局样式
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);