/** `motion/spring` de Figma: stiffness 100, damping 15, mass 1 (ζ≈0.75, ligero
 *  overshoot). Se usa para el indicador deslizante de `NavigationBar` y
 *  `PrimaryTabs`. */
export const MOTION_SPRING = { stiffness: 100, damping: 15, mass: 1 } as const;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Integrador de muelle — resuelve `x'' = (-k·(x−to) − c·x') / m` por sub-pasos
 * de Euler sobre `requestAnimationFrame`. Sin dependencias.
 *
 * Llama `onFrame(x)` cada frame y `onFrame(to)` exacto al asentarse. Devuelve
 * una función para cancelar.
 */
export function springTo(
  from: number,
  to: number,
  onFrame: (x: number) => void,
  spring: { stiffness: number; damping: number; mass: number } = MOTION_SPRING,
): () => void {
  const { stiffness: k, damping: c, mass: m } = spring;
  let x = from;
  let v = 0;
  let last = performance.now();
  let raf = requestAnimationFrame(function tick(now) {
    const frame = Math.min((now - last) / 1000, 0.064);
    last = now;
    const sub = 8;
    const h = frame / sub;
    for (let i = 0; i < sub; i += 1) {
      const a = (-k * (x - to) - c * v) / m;
      v += a * h;
      x += v * h;
    }
    if (Math.abs(to - x) < 0.15 && Math.abs(v) < 0.15) {
      onFrame(to);
      return;
    }
    onFrame(x);
    raf = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(raf);
}
