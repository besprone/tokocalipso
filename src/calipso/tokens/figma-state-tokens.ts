/**
 * Capa de estado (overlays) — frame State en Figma
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=2644-16157
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaStateTokens: Record<string, string> = {
  "semantic/color/state/disabled": "#00000014",
  "semantic/color/state/hover": "#0000000a",
  "semantic/color/state/focus": "#0000000a",
  "semantic/color/state/focusRing": "#5ea6d4",
  "semantic/color/state/pressed": "#00000014",
  "semantic/color/state/dragged": "#0000001f",
};

export function stateCssBlock(): string {
  const lines = Object.entries(figmaStateTokens).map(
    ([k, v]) => `  ${figmaPathToCssVar(k)}: ${v};`,
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}

/** Orden y nota corta alineada al copy del frame (State / kubo). */
export const stateTokenNotes: Record<string, string> = {
  "semantic/color/state/disabled":
    "Inactividad (inputs, chips, botones, toggles). Misma opacidad base que pressed; rol distinto.",
  "semantic/color/state/hover": "Overlay universal en interactivos; no afecta legibilidad del contenido bajo el overlay.",
  "semantic/color/state/focus":
    "Complementa el foco accesible; no sustituye outline. Misma opacidad que hover (4% negro).",
  "semantic/color/state/focusRing":
    "Borde de foco; alineado con semantic/color/border/focus (ref/color/feedback/info/400) para contraste accesible.",
  "semantic/color/state/pressed": "Pressed / active mientras se mantiene; overlay 8% (igual magnitud que disabled).",
  "semantic/color/state/dragged": "Reordenar / arrastre; evitar en fondos muy oscuros.",
};
