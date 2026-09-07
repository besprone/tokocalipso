/**
 * Escala de spacing desde Figma
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=2085-949
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaSpacingTokens: Record<string, number> = {
  "internalLayout/space-0": 0,
  "internalLayout/space-25": 2,
  "internalLayout/space-50": 4,
  "internalLayout/space-75": 6,
  "internalLayout/space-100": 8,
  "internalLayout/space-125": 10,
  "internalLayout/space-150": 12,
  "componentSpacing/space-200": 16,
  "componentSpacing/space-300": 24,
  "sectionSpacing/space-400": 32,
  "sectionSpacing/space-500": 40,
  "sectionSpacing/space-600": 48,
};

export const spacingIntentNotes: Record<string, string> = {
  internalLayout: "Padding interno y ajustes finos dentro de componentes.",
  componentSpacing: "Separación entre componentes cercanos del mismo bloque.",
  sectionSpacing: "Separación entre secciones o bloques de alto nivel.",
};

function toCssSpace(value: number): string {
  return value === 0 ? "0" : `${value}px`;
}

export function spacingCssBlock(): string {
  const lines = Object.entries(figmaSpacingTokens).map(
    ([k, v]) => `  ${figmaPathToCssVar(k)}: ${toCssSpace(v)};`,
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}
