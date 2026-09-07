/**
 * Escala de radius desde Figma
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=2099-3
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaRadiusTokens: Record<string, number> = {
  "radius-0": 0,
  "small items/radius-50": 4,
  "controls/radius-100": 8,
  "controls/radius-125": 10,
  "controls/radius-150": 12,
  "containers/radius-200": 16,
  "containers/radius-300": 24,
  "circular items/radius-round": 9999,
};

export const radiusIntentNotes: Record<string, string> = {
  "radius-0": "Elementos sin redondeo.",
  "small items/radius-50": "Items pequeños (badges/chips/labels).",
  "controls/radius-100": "Controles interactivos base.",
  "controls/radius-125": "Controles compactos (ej. botones XS/SM).",
  "controls/radius-150": "Controles medianos/grandes y selección.",
  "containers/radius-200": "Contenedores estándar y campos.",
  "containers/radius-300": "Contenedores amplios con redondeo marcado.",
  "circular items/radius-round": "Elementos circulares (pill/handle/progreso).",
};

function toCssRadius(value: number): string {
  return value === 0 ? "0" : `${value}px`;
}

export function radiusCssBlock(): string {
  const lines = Object.entries(figmaRadiusTokens).map(
    ([k, v]) => `  ${figmaPathToCssVar(k)}: ${toCssRadius(v)};`,
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}
