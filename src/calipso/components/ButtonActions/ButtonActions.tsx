import { forwardRef, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './ButtonActions.css';

export type ButtonActionsSurface =
  | 'screen'
  | 'dialog'
  | 'card'
  | 'bottomSheet'
  | 'feedbackState';

export type ButtonActionsDivider = 'auto' | 'always' | 'never';

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    if (/(auto|scroll)/.test(getComputedStyle(el).overflowY)) return el;
    el = el.parentElement;
  }
  return null;
}

export type ButtonActionsProps = {
  /**
   * Contexto donde se coloca la botonera — define dirección, separación y
   * alineación (no el tamaño de los botones, eso lo controla cada `Button`).
   *
   * - `screen` (def.) — apiladas a lo ancho, separación 16. CTAs de pantalla
   *   completa (dentro de `SystemFeedback` / sticky footer).
   * - `dialog` — fila alineada a la derecha, separación 8. Footer de diálogo.
   * - `card` — fila alineada a la izquierda, separación 8.
   * - `bottomSheet` — fila 50/50 (dos botones del mismo ancho), separación 8.
   * - `feedbackState` — fila centrada con wrap, separación 8. Estado compacto.
   */
  surface?: ButtonActionsSurface;
  /**
   * `true` — la botonera es el "stickyCTAContainer" de Figma: `bg/canvas`,
   * padding `16 / 16 / 24` y `position: sticky; bottom: 0`. **Solo aplica a
   * `surface="screen"`.** El ancestro con scroll (viewport, `100dvh`, un
   * contenedor `overflow`) lo pone el consumidor. Default `false`.
   */
  sticky?: boolean;
  /**
   * Borde superior de la botonera sticky. `auto` (def.) — solo cuando queda
   * contenido scrolleado por debajo (sentinel + `IntersectionObserver`).
   * `always` — siempre (default de Figma). `never` — nunca. Ignorado si
   * `sticky` es `false`.
   */
  divider?: ButtonActionsDivider;
  /**
   * Texto de apoyo sobre la botonera (`stickyCTAContainer` de Figma —
   * `Body/md` sobre `text/secondary`, centrado). Misma prop que ya tiene
   * `BottomSheet`, para componer ambas superficies igual. Se renderiza como
   * primer hijo, antes de `children` — en `surface="screen"` el `gap` de la
   * columna (16px) ya separa el texto de los botones sin CSS adicional.
   */
  microcopy?: ReactNode;
  /** 1–3 `<Button>`. El orden visual es el orden del markup (el primario suele ir último en apilado y a la derecha en fila). */
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * ButtonActions — botonera reutilizable. Figma: `patterns_buttons_actions`.
 *
 * Resuelve el **layout** de un grupo de 1–3 acciones según el `surface`; no
 * crea botones ni redefine estados/tokens. El padding del borde lo pone el
 * contenedor que la coloca — **salvo** con `sticky`, que envuelve la botonera
 * en el `stickyCTAContainer` de Figma (`bg/canvas` + padding + `position:
 * sticky`), para no reescribirlo en cada pantalla con CTA fijo.
 */
export const ButtonActions = forwardRef<HTMLDivElement, ButtonActionsProps>(
  function ButtonActions(
    { surface = 'screen', sticky = false, divider = 'auto', microcopy, children, className, ...props },
    ref,
  ) {
    const isSticky = sticky && surface === 'screen';
    const useSentinel = isSticky && divider === 'auto';
    const sentinelRef = useRef<HTMLSpanElement | null>(null);
    const barRef = useRef<HTMLDivElement | null>(null);
    const [scrolled, setScrolled] = useState(false);
    // Alto real de la botonera (varía con microcopy / wrap de botones) — el
    // observer lo necesita para descontarlo del root, ver más abajo.
    const [barHeight, setBarHeight] = useState(0);

    const setBarRef = (node: HTMLDivElement | null) => {
      barRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    // La barra es sticky y se pinta ENCIMA del final del contenido — mide su
    // propio alto para poder recortarlo del viewport que observa el sentinel.
    useEffect(() => {
      if (!useSentinel) return;
      const node = barRef.current;
      if (!node || typeof ResizeObserver === 'undefined') {
        if (node) setBarHeight(node.offsetHeight);
        return;
      }
      const ro = new ResizeObserver(() => setBarHeight(node.offsetHeight));
      ro.observe(node);
      return () => ro.disconnect();
    }, [useSentinel]);

    // El sentinel vive en el flujo normal, justo antes de la barra; con scroll
    // corto, su posición "natural" puede caer DENTRO de los últimos `barHeight`
    // px del contenedor — es decir, tapada por la barra sticky — y aun así
    // contar como "visible" para el IntersectionObserver si no se descuenta el
    // alto de la barra. `rootMargin` recorta el borde inferior del *root*
    // exactamente ese alto: si el sentinel cae en esa franja tapada, deja de
    // intersectar y el borde se muestra (queda contenido oculto detrás de la
    // barra). Ese recorte solo tiene efecto si el root es el ANCESTRO CON
    // SCROLL real — el default (`root: null`) mide contra el viewport del
    // documento, que normalmente no coincide con un contenedor scrolleable
    // anidado (p. ej. un modal, un `overflow: auto` propio), y ahí el recorte
    // no tiene ningún efecto visible.
    useEffect(() => {
      if (!useSentinel) return;
      const node = sentinelRef.current;
      if (!node || typeof IntersectionObserver === 'undefined') return;
      // -1px de margen de tolerancia: al scrollear hasta el final, el borde
      // inferior del sentinel cae EXACTAMENTE sobre el borde recortado del
      // root (ratio de intersección 0 justo en el límite) — un empate que
      // los navegadores resuelven de forma inconsistente. Recortar 1px menos
      // que el alto real desempata siempre hacia "visible" en ese punto,
      // sin afectar el caso reportado (contenido tapado por decenas de px).
      const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
        root: getScrollParent(node),
        threshold: 0,
        rootMargin: `0px 0px -${Math.max(barHeight - 1, 0)}px 0px`,
      });
      io.observe(node);
      return () => io.disconnect();
    }, [useSentinel, barHeight]);

    const bar = (
      <div
        {...props}
        ref={setBarRef}
        data-surface={surface}
        data-sticky={isSticky || undefined}
        data-divider={isSticky ? divider : undefined}
        data-scrolled={useSentinel && scrolled ? '' : undefined}
        className={['button-actions', className].filter(Boolean).join(' ')}
      >
        {microcopy != null && <p className="button-actions__microcopy">{microcopy}</p>}
        {children}
      </div>
    );

    if (!useSentinel) return bar;
    return (
      <>
        <span ref={sentinelRef} className="button-actions__sentinel" aria-hidden="true" />
        {bar}
      </>
    );
  },
);
