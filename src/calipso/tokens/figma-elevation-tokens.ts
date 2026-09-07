/**
 * Elevation tokens (web-css) desde Figma
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=2102-201
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaElevationTokens: Record<string, string> = {
  "elevation-0/web-css/x": "0px",
  "elevation-0/web-css/y": "0px",
  "elevation-0/web-css/blur": "0px",
  "elevation-0/web-css/propagation": "0px",
  "elevation-0/web-css/color": "transparent",

  "elevation-1/web-css/x": "0px",
  "elevation-1/web-css/y": "2px",
  "elevation-1/web-css/blur": "4px",
  "elevation-1/web-css/propagation": "0px",
  "elevation-1/web-css/color": "rgba(28, 27, 32, 0.1)",

  "elevation-2/web-css/x": "0px",
  "elevation-2/web-css/y": "3px",
  "elevation-2/web-css/blur": "8px",
  "elevation-2/web-css/propagation": "0px",
  "elevation-2/web-css/color": "rgba(28, 27, 32, 0.12)",

  "elevation-3/web-css/x": "0px",
  "elevation-3/web-css/y": "6px",
  "elevation-3/web-css/blur": "12px",
  "elevation-3/web-css/propagation": "0px",
  "elevation-3/web-css/color": "rgba(0, 0, 0, 0.16)",

  // Conveniencia de consumo en web
  "Elevation/elevation-0":
    "var(--elevation-0-web-css-x) var(--elevation-0-web-css-y) var(--elevation-0-web-css-blur) var(--elevation-0-web-css-propagation) var(--elevation-0-web-css-color)",
  "Elevation/elevation-1":
    "var(--elevation-1-web-css-x) var(--elevation-1-web-css-y) var(--elevation-1-web-css-blur) var(--elevation-1-web-css-propagation) var(--elevation-1-web-css-color)",
  "Elevation/elevation-2":
    "var(--elevation-2-web-css-x) var(--elevation-2-web-css-y) var(--elevation-2-web-css-blur) var(--elevation-2-web-css-propagation) var(--elevation-2-web-css-color)",
  "Elevation/elevation-3":
    "var(--elevation-3-web-css-x) var(--elevation-3-web-css-y) var(--elevation-3-web-css-blur) var(--elevation-3-web-css-propagation) var(--elevation-3-web-css-color)",
};

export const elevationUsageNotes: Record<string, string> = {
  "Elevation/elevation-0": "Sin elevación. Superficies planas y contenido base.",
  "Elevation/elevation-1": "Baja elevación. Tooltips/indicadores ligeros.",
  "Elevation/elevation-2": "Media elevación. Cards y superficies superpuestas.",
  "Elevation/elevation-3": "Alta elevación. Modals, drawers, sheets.",
  "semantic/color/bg/overlay": "Overlay de pantalla (separado de sombras).",
};

export function elevationCssBlock(): string {
  const lines = Object.entries(figmaElevationTokens).map(
    ([k, v]) => `  ${figmaPathToCssVar(k)}: ${v};`,
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}
