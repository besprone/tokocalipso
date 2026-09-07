/**
 * Motion tokens from Figma
 * https://www.figma.com/design/XhvIIW42BM1u2ViM0MaBR0/Calipso-2.0?node-id=2107-2239
 */
import { figmaPathToCssVar } from "./figma-path-to-css";

export const figmaMotionSpringTokens = {
  "spring/mass": 1,
  "spring/stiffness": 100,
  "spring/damping": 15,
} as const;

export const figmaMotionLinear200Tokens = {
  "linear-200/duration-ms": 200,
  "linear-200/easing": "linear",
} as const;

export const motionPrototypeNotes = {
  figmaCurve: "Smooth",
  figmaDurationMs: 800,
  figmaDirection: "bottom",
};

export function motionCssBlock(): string {
  const springLines = Object.entries(figmaMotionSpringTokens).map(
    ([path, value]) => `  ${figmaPathToCssVar(path)}: ${value};`,
  );
  const linearLines = Object.entries(figmaMotionLinear200Tokens).map(([path, value]) => {
    if (path.endsWith("duration-ms")) return `  ${figmaPathToCssVar(path)}: ${value}ms;`;
    return `  ${figmaPathToCssVar(path)}: ${value};`;
  });

  return `:root {\n${[...springLines, ...linearLines].join("\n")}\n}\n`;
}
