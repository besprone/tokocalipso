/** Figma path → nombre de variable CSS (--semantic-color-text-primary). */
export function figmaPathToCssVar(path: string): string {
  return `--${path.replaceAll("/", "-").replaceAll(" ", "-")}`;
}
