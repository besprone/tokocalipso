/**
 * Layout tokens from Figma
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=3225-2346
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaLayoutTokens: Record<string, number> = {
  "layout/container/inline": 16,
  "layout/stack/inlineSm": 8,
  "layout/stack/block": 16,
  "layout/stack/section": 32,
  "layout/content/bottomClearance": 24,
};

export const layoutTokenNotes: Record<string, string> = {
  "layout/container/inline": "Padding horizontal estructural de pantalla.",
  "layout/stack/inlineSm": "Separacion minima entre elementos relacionados.",
  "layout/stack/block": "Separacion estandar entre bloques internos.",
  "layout/stack/section": "Separacion entre secciones de alto nivel.",
  "layout/content/bottomClearance": "Compensacion inferior para elementos persistentes (CTA/nav).",
};

export function layoutCssBlock(): string {
  const lines = Object.entries(figmaLayoutTokens).map(
    ([path, value]) => `  ${figmaPathToCssVar(path)}: ${value}px;`,
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}
