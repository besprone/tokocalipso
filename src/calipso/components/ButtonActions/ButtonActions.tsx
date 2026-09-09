import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './ButtonActions.css';

export type ButtonActionsSurface =
  | 'screen'
  | 'dialog'
  | 'card'
  | 'bottomSheet'
  | 'feedbackState';

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
  /** 1–3 `<Button>`. El orden visual es el orden del markup (el primario suele ir último en apilado y a la derecha en fila). */
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * ButtonActions — botonera reutilizable. Figma: `patterns_buttons_actions`.
 *
 * Sólo resuelve el **layout** de un grupo de 1–3 acciones según el `surface`
 * donde vive; no crea botones nuevos ni redefine estados/tokens. El padding
 * del borde lo pone el contenedor que la coloca (footer, `SystemFeedback`,
 * card…), no la botonera.
 */
export const ButtonActions = forwardRef<HTMLDivElement, ButtonActionsProps>(
  function ButtonActions({ surface = 'screen', children, className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-surface={surface}
        className={['button-actions', className].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    );
  },
);
