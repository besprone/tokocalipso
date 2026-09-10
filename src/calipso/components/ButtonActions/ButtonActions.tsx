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
    { surface = 'screen', sticky = false, divider = 'auto', children, className, ...props },
    ref,
  ) {
    const isSticky = sticky && surface === 'screen';
    const useSentinel = isSticky && divider === 'auto';
    const sentinelRef = useRef<HTMLSpanElement | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
      if (!useSentinel) return;
      const node = sentinelRef.current;
      if (!node || typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver(
        ([entry]) => setScrolled(!entry.isIntersecting),
        { threshold: 0 },
      );
      io.observe(node);
      return () => io.disconnect();
    }, [useSentinel]);

    const bar = (
      <div
        {...props}
        ref={ref}
        data-surface={surface}
        data-sticky={isSticky || undefined}
        data-divider={isSticky ? divider : undefined}
        data-scrolled={useSentinel && scrolled ? '' : undefined}
        className={['button-actions', className].filter(Boolean).join(' ')}
      >
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
