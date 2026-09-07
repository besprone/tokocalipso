/**
 * Grid tokens por dispositivo desde Figma
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=2104-5
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaGridTokens: Record<string, number> = {
  "mobile/columns": 4,
  "mobile/margin": 16,
  "mobile/gutter": 16,
  "tablet/columns": 8,
  "tablet/margin": 24,
  "tablet/gutter": 24,
  "desktop/columns": 12,
  "desktop/margin": 40,
  "desktop/gutter": 24,
};

export const gridBreakpointNotes: Record<string, string> = {
  mobile: "0–599px",
  tablet: "600–1023px",
  desktop: "1024px+",
};

function toCssValue(path: string, value: number): string {
  return path.endsWith("/columns") ? String(value) : `${value}px`;
}

export function gridCssBlock(): string {
  const lines = Object.entries(figmaGridTokens).map(
    ([k, v]) => `  ${figmaPathToCssVar(k)}: ${toCssValue(k, v)};`,
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}
