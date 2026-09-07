/**
 * Gradientes semánticos (Color Styles en Figma, no variables nativas)
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=3987-16467
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaGradientTokens: Record<string, string> = {
  // 20% -> 100%, dirección vertical (top to bottom)
  "semantic/gradient/bg/inverse":
    "linear-gradient(180deg, var(--ref-neutral-900) 20%, var(--ref-neutral-700) 100%)",
  "semantic/gradient/bg/primary":
    "linear-gradient(180deg, var(--ref-green-700) 20%, var(--ref-green-500) 100%)",
  // accent = acento primario de marca (kubo: mint). Antes ref/color/accent (teal), eliminado en Figma.
  "semantic/gradient/bg/accent":
    "linear-gradient(180deg, var(--ref-accent-mint-700) 20%, var(--ref-accent-mint-500) 100%)",
};

export const gradientTokenNotes: Record<string, string> = {
  "semantic/gradient/bg/inverse":
    "Gradiente oscuro para contextos inverse (fondos oscuros/sólidos, overlays y modales en mode inverse).",
  "semantic/gradient/bg/primary":
    "Gradiente brand principal para CTAs o superficies de alta prominencia visual.",
  "semantic/gradient/bg/accent":
    "Gradiente de acento primario de marca (kubo: mint) para cards/sections complementarias con foco visual secundario.",
};

export function gradientCssBlock(): string {
  const lines = Object.entries(figmaGradientTokens).map(
    ([k, v]) => `  ${figmaPathToCssVar(k)}: ${v};`,
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}
