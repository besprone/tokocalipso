import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./calipso/styles/tokens.css";
import "./app.css";
import { HomeSolicitudes } from "./screens/HomeSolicitudes/HomeSolicitudes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HomeSolicitudes />
  </StrictMode>,
);
