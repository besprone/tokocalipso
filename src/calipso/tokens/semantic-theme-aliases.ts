import { figmaColorTokens } from "./figma-color-tokens";

export type ThemeAlias = { light: string; inverse: string };
export type SemanticFamily = "text" | "bg" | "border" | "icon";

/**
 * Mapa 1:1 de los temas nativos de Figma (colección `Color`, modos light / inverse)
 * para las capas semánticas text / bg / border / icon.
 *
 * **Solo tokens independientes de marca.** Las 26 familias dependientes de
 * marca (`brand*`, `accentPrimary*`, `accentSecondary*`) viven en su propia
 * colección de Figma (`_ Color · brand`, modos kubo / maestro) y en este repo
 * están en `brand-aliases.ts`. El resolver de `.storybook/preview.ts` mezcla
 * ambos: `brandThemeAliases[marca][fam][path] ?? semanticThemeAliases[fam][path]`.
 *
 * En runtime, `.storybook/preview.ts` aplica la columna `light` (o `inverse`)
 * sobre `:root` para la marca activa.
 */
export const semanticThemeAliases: Record<SemanticFamily, Record<string, ThemeAlias>> = {
  text: {
    "semantic/color/text/primary": { light: "ref/neutral/900", inverse: "ref/neutral/0" },
    "semantic/color/text/secondary": { light: "ref/neutral/600", inverse: "ref/neutral/100" },
    "semantic/color/text/tertiary": { light: "ref/neutral/400", inverse: "ref/neutral/200" },
    "semantic/color/text/inverse": { light: "ref/neutral/200", inverse: "ref/neutral/900" },
    "semantic/color/text/disabled": { light: "ref/neutral/400", inverse: "ref/neutral/600" },
    "semantic/color/text/danger": { light: "ref/error/600", inverse: "ref/error/200" },
    "semantic/color/text/dangerStrong": { light: "ref/error/700", inverse: "ref/error/300" },
    "semantic/color/text/onDanger": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
    "semantic/color/text/warning": { light: "ref/warning/800", inverse: "ref/warning/200" },
    "semantic/color/text/onWarning": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
    "semantic/color/text/success": { light: "ref/success/700", inverse: "ref/green/200" },
    "semantic/color/text/onSuccess": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
    "semantic/color/text/info": { light: "ref/info/700", inverse: "ref/info/200" },
    "semantic/color/text/onInfo": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
    "semantic/color/text/linkDefault": { light: "ref/green/700", inverse: "ref/green/400" },
    "semantic/color/text/linkHover": { light: "ref/green/800", inverse: "ref/green/500" },
    "semantic/color/text/linkPressed": { light: "ref/green/900", inverse: "ref/green/600" },
    "semantic/color/text/neutral": { light: "ref/neutral/800", inverse: "ref/neutral/0" },
    "semantic/color/text/onNeutral": { light: "ref/neutral/0", inverse: "ref/neutral/800" },
  },
  bg: {
    "semantic/color/bg/surface": { light: "ref/neutral/0", inverse: "ref/whiteAlpha/200" },
    "semantic/color/bg/canvas": { light: "ref/neutral/50", inverse: "ref/neutral/800" },
    "semantic/color/bg/subtle": { light: "ref/neutral/100", inverse: "ref/whiteAlpha/100" },
    "semantic/color/bg/disabled": { light: "ref/neutral/300", inverse: "ref/neutral/700" },
    "semantic/color/bg/inverse": { light: "ref/neutral/900", inverse: "ref/neutral/0" },
    "semantic/color/bg/neutral": { light: "ref/neutral/800", inverse: "ref/neutral/0" },
    "semantic/color/bg/neutralSoft": { light: "ref/neutral/100", inverse: "ref/blackAlpha/200" },
    "semantic/color/bg/neutralMuted": { light: "ref/neutral/50", inverse: "ref/blackAlpha/50" },
    "semantic/color/bg/success": { light: "ref/success/500", inverse: "ref/success/400" },
    "semantic/color/bg/successSoft": { light: "ref/success/200", inverse: "ref/success/200" },
    "semantic/color/bg/successMuted": { light: "ref/success/100", inverse: "ref/success/100" },
    "semantic/color/bg/warning": { light: "ref/warning/500", inverse: "ref/warning/400" },
    "semantic/color/bg/warningSoft": { light: "ref/warning/200", inverse: "ref/warning/200" },
    "semantic/color/bg/warningMuted": { light: "ref/warning/100", inverse: "ref/warning/100" },
    "semantic/color/bg/danger": { light: "ref/error/600", inverse: "ref/error/400" },
    "semantic/color/bg/dangerSoft": { light: "ref/error/200", inverse: "ref/error/200" },
    "semantic/color/bg/dangerMuted": { light: "ref/error/100", inverse: "ref/error/100" },
    "semantic/color/bg/info": { light: "ref/info/500", inverse: "ref/info/400" },
    "semantic/color/bg/infoSoft": { light: "ref/info/200", inverse: "ref/info/200" },
    "semantic/color/bg/infoMuted": { light: "ref/info/100", inverse: "ref/info/100" },
    "semantic/color/bg/overlay": { light: "rgba(0,0,0,0/40)", inverse: "rgba(0,0,0,0/40)" },
  },
  border: {
    "semantic/color/border/subtle": { light: "ref/neutral/100", inverse: "ref/neutral/600" },
    "semantic/color/border/default": { light: "ref/neutral/200", inverse: "ref/neutral/500" },
    "semantic/color/border/strong": { light: "ref/neutral/300", inverse: "ref/neutral/400" },
    "semantic/color/border/emphasis": { light: "ref/neutral/400", inverse: "ref/neutral/300" },
    "semantic/color/border/inverse": { light: "ref/neutral/0", inverse: "ref/neutral/0" },
    "semantic/color/border/focus": { light: "ref/info/400", inverse: "ref/info/500" },
    "semantic/color/border/info": { light: "ref/info/300", inverse: "ref/info/400" },
    "semantic/color/border/success": { light: "ref/success/300", inverse: "ref/success/400" },
    "semantic/color/border/warning": { light: "ref/warning/300", inverse: "ref/warning/400" },
    "semantic/color/border/danger": { light: "ref/error/600", inverse: "ref/error/400" },
    "semantic/color/border/dangerSoft": { light: "ref/error/300", inverse: "ref/error/300" },
    "semantic/color/border/disabled": { light: "ref/neutral/300", inverse: "ref/neutral/500" },
    "semantic/color/border/overlay": { light: "rgba(0,0,0,0/56)", inverse: "rgba(0,0,0,0/56)" },
  },
  icon: {
    "semantic/color/icon/primary": { light: "ref/neutral/900", inverse: "ref/neutral/0" },
    "semantic/color/icon/secondary": { light: "ref/neutral/600", inverse: "ref/neutral/100" },
    "semantic/color/icon/tertiary": { light: "ref/neutral/400", inverse: "ref/neutral/200" },
    "semantic/color/icon/disabled": { light: "ref/neutral/400", inverse: "ref/neutral/600" },
    "semantic/color/icon/inverse": { light: "ref/neutral/200", inverse: "ref/neutral/900" },
    "semantic/color/icon/neutral": { light: "ref/neutral/800", inverse: "ref/neutral/50" },
    "semantic/color/icon/onNeutral": { light: "ref/neutral/0", inverse: "ref/neutral/800" },
    "semantic/color/icon/success": { light: "ref/success/700", inverse: "ref/green/200" },
    "semantic/color/icon/onSuccess": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
    "semantic/color/icon/warning": { light: "ref/warning/800", inverse: "ref/warning/200" },
    "semantic/color/icon/onWarning": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
    "semantic/color/icon/danger": { light: "ref/error/600", inverse: "ref/error/200" },
    "semantic/color/icon/dangerStrong": { light: "ref/error/700", inverse: "ref/error/300" },
    "semantic/color/icon/onDanger": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
    "semantic/color/icon/info": { light: "ref/info/700", inverse: "ref/info/200" },
    "semantic/color/icon/onInfo": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
  },
};

function rgbaAliasToHex(alias: string): string | null {
  const m = alias.match(/^rgba\(0,0,0,0\/(\d+)\)$/);
  if (!m) return null;
  const opacity = Number(m[1]) / 100;
  if (Number.isNaN(opacity)) return null;
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `#000000${alpha}`;
}

export function resolveThemeAliasValue(alias: string): string {
  const rgbaHex = rgbaAliasToHex(alias);
  if (rgbaHex) return rgbaHex;
  return figmaColorTokens[alias] ?? "#00000000";
}
