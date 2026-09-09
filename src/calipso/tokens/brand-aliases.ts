import type { SemanticFamily, ThemeAlias } from "./semantic-theme-aliases";

export type Brand = "kubo" | "maestro";

/**
 * Colección de Figma `_ Color · brand` (modos `kubo` / `maestro`, submodos
 * `light` / `inverse`). Son las 26 familias semánticas **dependientes de marca**
 * — `brand*`, `accentPrimary*`, `accentSecondary*` — separadas del resto
 * (`semantic-theme-aliases.ts`, independiente de marca).
 *
 * Maestro:
 *   - `brand*`        colapsa sobre `ref/neutral/{800,100,50}` (brand pasa a ser gris).
 *   - `accentPrimary*`   → `ref/accent/yellow/*`  (era `mint`).
 *   - `accentSecondary*` → `ref/accent/red/*`     (era `orchid`).
 *
 * `link` NO está en la colección de marca → `text/linkDefault|Hover|Pressed`
 * quedan en `ref/green/*` (verde de kubo) también en maestro. Hueco conocido de
 * Figma; si diseño lo agrega, entra acá.
 *
 * El resolver de `.storybook/preview.ts` mezcla:
 *   brandThemeAliases[marca][fam][path] ?? semanticThemeAliases[fam][path]
 */
export const brandThemeAliases: Record<
  Brand,
  Record<SemanticFamily, Record<string, ThemeAlias>>
> = {
  kubo: {
    text: {
      "semantic/color/text/brand": { light: "ref/green/700", inverse: "ref/green/50" },
      "semantic/color/text/onBrand": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
      "semantic/color/text/accentPrimary": { light: "ref/accent/mint/700", inverse: "ref/accent/mint/400" },
      "semantic/color/text/accentSecondary": { light: "ref/accent/orchid/700", inverse: "ref/accent/orchid/200" },
      "semantic/color/text/onAccentPrimary": { light: "ref/accent/mint/900", inverse: "ref/accent/mint/900" },
      "semantic/color/text/onAccentSecondary": { light: "ref/accent/orchid/900", inverse: "ref/neutral/900" },
    },
    bg: {
      "semantic/color/bg/brand": { light: "ref/green/700", inverse: "ref/green/400" },
      "semantic/color/bg/brandSoft": { light: "ref/green/100", inverse: "ref/whiteAlpha/100" },
      "semantic/color/bg/brandMuted": { light: "ref/green/50", inverse: "ref/whiteAlpha/50" },
      "semantic/color/bg/accentPrimary": { light: "ref/accent/mint/300", inverse: "ref/accent/mint/400" },
      "semantic/color/bg/accentPrimarySoft": { light: "ref/accent/mint/200", inverse: "ref/accent/mint/300" },
      "semantic/color/bg/accentPrimaryMuted": { light: "ref/accent/mint/100", inverse: "ref/accent/mint/200" },
      "semantic/color/bg/accentSecondary": { light: "ref/accent/orchid/300", inverse: "ref/accent/orchid/400" },
      "semantic/color/bg/accentSecondarySoft": { light: "ref/accent/orchid/200", inverse: "ref/accent/orchid/300" },
      "semantic/color/bg/accentSecondaryMuted": { light: "ref/accent/orchid/100", inverse: "ref/accent/orchid/200" },
    },
    border: {
      "semantic/color/border/brand": { light: "ref/green/700", inverse: "ref/green/200" },
      "semantic/color/border/accentPrimary": { light: "ref/accent/mint/400", inverse: "ref/accent/mint/500" },
      "semantic/color/border/accentPrimaryStrong": { light: "ref/accent/mint/600", inverse: "ref/accent/mint/300" },
      "semantic/color/border/accentSecondary": { light: "ref/accent/orchid/400", inverse: "ref/accent/orchid/400" },
      "semantic/color/border/accentSecondaryStrong": { light: "ref/accent/orchid/600", inverse: "ref/accent/orchid/300" },
    },
    icon: {
      "semantic/color/icon/brand": { light: "ref/green/700", inverse: "ref/green/50" },
      "semantic/color/icon/onBrand": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
      "semantic/color/icon/accentPrimary": { light: "ref/accent/mint/700", inverse: "ref/accent/mint/400" },
      "semantic/color/icon/onAccentPrimary": { light: "ref/accent/mint/900", inverse: "ref/accent/mint/900" },
      "semantic/color/icon/accentSecondary": { light: "ref/accent/orchid/700", inverse: "ref/accent/orchid/200" },
      "semantic/color/icon/onAccentSecondary": { light: "ref/accent/orchid/900", inverse: "ref/neutral/800" },
    },
  },
  maestro: {
    text: {
      "semantic/color/text/brand": { light: "ref/neutral/800", inverse: "ref/neutral/0" },
      "semantic/color/text/onBrand": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
      "semantic/color/text/accentPrimary": { light: "ref/accent/yellow/900", inverse: "ref/accent/yellow/400" },
      "semantic/color/text/accentSecondary": { light: "ref/accent/red/700", inverse: "ref/accent/red/200" },
      "semantic/color/text/onAccentPrimary": { light: "ref/neutral/900", inverse: "ref/neutral/800" },
      "semantic/color/text/onAccentSecondary": { light: "ref/neutral/900", inverse: "ref/neutral/800" },
    },
    bg: {
      "semantic/color/bg/brand": { light: "ref/neutral/800", inverse: "ref/neutral/0" },
      "semantic/color/bg/brandSoft": { light: "ref/neutral/100", inverse: "ref/whiteAlpha/100" },
      "semantic/color/bg/brandMuted": { light: "ref/neutral/50", inverse: "ref/whiteAlpha/50" },
      "semantic/color/bg/accentPrimary": { light: "ref/accent/yellow/300", inverse: "ref/accent/yellow/300" },
      "semantic/color/bg/accentPrimarySoft": { light: "ref/accent/yellow/200", inverse: "ref/accent/yellow/200" },
      "semantic/color/bg/accentPrimaryMuted": { light: "ref/accent/yellow/100", inverse: "ref/accent/yellow/100" },
      "semantic/color/bg/accentSecondary": { light: "ref/accent/red/300", inverse: "ref/accent/red/400" },
      "semantic/color/bg/accentSecondarySoft": { light: "ref/accent/red/200", inverse: "ref/accent/red/300" },
      "semantic/color/bg/accentSecondaryMuted": { light: "ref/accent/red/100", inverse: "ref/accent/red/200" },
    },
    border: {
      "semantic/color/border/brand": { light: "ref/neutral/800", inverse: "ref/neutral/200" },
      "semantic/color/border/accentPrimary": { light: "ref/accent/yellow/400", inverse: "ref/accent/yellow/500" },
      "semantic/color/border/accentPrimaryStrong": { light: "ref/accent/yellow/600", inverse: "ref/accent/yellow/300" },
      "semantic/color/border/accentSecondary": { light: "ref/accent/red/200", inverse: "ref/accent/red/400" },
      "semantic/color/border/accentSecondaryStrong": { light: "ref/accent/red/400", inverse: "ref/accent/red/300" },
    },
    icon: {
      "semantic/color/icon/brand": { light: "ref/neutral/800", inverse: "ref/neutral/0" },
      "semantic/color/icon/onBrand": { light: "ref/neutral/0", inverse: "ref/neutral/900" },
      "semantic/color/icon/accentPrimary": { light: "ref/accent/yellow/900", inverse: "ref/accent/yellow/400" },
      "semantic/color/icon/onAccentPrimary": { light: "ref/neutral/900", inverse: "ref/neutral/800" },
      "semantic/color/icon/accentSecondary": { light: "ref/accent/red/700", inverse: "ref/accent/red/200" },
      "semantic/color/icon/onAccentSecondary": { light: "ref/neutral/900", inverse: "ref/neutral/800" },
    },
  },
};

/** Todos los paths semánticos dependientes de marca (26). */
export const brandSemanticPaths: string[] = Object.values(brandThemeAliases.kubo)
  .flatMap((fam) => Object.keys(fam))
  .sort();
