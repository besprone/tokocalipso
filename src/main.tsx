import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./calipso/styles/tokens.css";
import "./app.css";
import { BrandToggle, aplicarMarca, marcaGuardada } from "./BrandToggle";
import { HomeSolicitudes } from "./screens/HomeSolicitudes/HomeSolicitudes";

// antes del primer render, para que no haya parpadeo de marca
aplicarMarca(marcaGuardada());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HomeSolicitudes />
    <BrandToggle />
  </StrictMode>,
);
