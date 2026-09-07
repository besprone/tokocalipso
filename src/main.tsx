import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./calipso/styles/tokens.css";
import { HomeSolicitudes } from "./screens/HomeSolicitudes/HomeSolicitudes";

/** Preview de pantalla: el frame móvil es andamiaje, la pantalla es el DS. */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "var(--sectionSpacing-space-400)",
        backgroundColor: "var(--semantic-color-bg-subtle)",
      }}
    >
      <div
        style={{
          inlineSize: 390,
          blockSize: 844,
          overflow: "hidden",
          borderRadius: "var(--containers-radius-300)",
          border: "1px solid var(--semantic-color-border-subtle)",
          boxShadow: "var(--Elevation-elevation-3)",
          backgroundColor: "var(--semantic-color-bg-canvas)",
        }}
      >
        <HomeSolicitudes />
      </div>
    </div>
  </StrictMode>,
);
