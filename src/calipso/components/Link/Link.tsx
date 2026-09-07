import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import './Link.css';

export type LinkState = 'default' | 'hover' | 'pressed';

export type LinkProps = {
  /**
   * Fuerza el estado visual — para demos, documentación o resaltado controlado.
   * Los estados reales de `hover` / `pressed` salen del CSS (`:hover` con
   * `@media (hover: hover)`, `:active`). Default `default`.
   */
  state?: LinkState;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Link — texto interactivo que **navega** a otra vista o URL. Figma:
 * `components_link`.
 *
 * **No es un botón**: no dispara acciones, solo navega. Siempre lleva el
 * subrayado visible (es el indicador de enlace). No usarlo como sustituto de
 * `Button` / ghost button, y el texto debe describir el destino (no "click
 * aquí" / "ver más" sin contexto).
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { state = 'default', className, children, ...props },
  ref,
) {
  return (
    <a
      {...props}
      ref={ref}
      data-state={state === 'default' ? undefined : state}
      className={['link', className].filter(Boolean).join(' ')}
    >
      {children}
    </a>
  );
});
