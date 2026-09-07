/**
 * Iconography contract from Figma (Carbon Icons IBM)
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=2106-170
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaIconSizeTokens: Record<string, number> = {
  "size/4": 4,
  "size/6": 6,
  "size/12": 12,
  "size/16": 16,
  "size/20": 20,
  "size/24": 24,
  "size/32": 32,
};

export const iconographyNotes = {
  libraryName: "Carbon Icons (IBM)",
  libraryUrl: "https://carbondesignsystem.com/elements/icons/library/",
  usage: [
    "Usar iconos Carbon sin modificar su forma.",
    "Aplicar color con tokens semanticos (text/icon).",
    "Mantener proporciones y espaciado por tokens.",
  ],
};

export function iconographyCssBlock(): string {
  const lines = Object.entries(figmaIconSizeTokens).map(
    ([path, value]) => `  ${figmaPathToCssVar(path)}: ${value}px;`,
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}
