import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './LinearProgress.css';

export type LinearProgressProps = {
  /** Progreso 0–100. Se ignora si `indeterminate`. Default `0`. */
  value?: number;
  /**
   * Progreso desconocido: barra animada en bucle. El valor de progreso se
   * controla desde producto; usar sólo cuando no se puede estimar el avance.
   */
  indeterminate?: boolean;
  /** Contexto para lectores de pantalla (p. ej. "Progreso de inversión"). */
  'aria-label'?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'children'>;

const clamp = (n: number) => (n < 0 ? 0 : n > 100 ? 100 : n);

/**
 * Indicador de progreso lineal. Figma: `components_linear_progress_indicator`.
 * **No es interactivo.** Comunica el avance de una acción o proceso en curso;
 * no sustituye a un loader cuando la acción es instantánea ni se usa como
 * decoración.
 *
 * El grosor y el color los fija el componente (track `bg/subtle`, barra
 * `bg/brand`) — no se sobrescriben por instancia.
 */
export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress(
    { value = 0, indeterminate = false, className, style, ...props },
    ref,
  ) {
    const pct = clamp(value);
    return (
      <div
        {...props}
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : pct}
        data-indeterminate={indeterminate || undefined}
        className={['linear-progress', className].filter(Boolean).join(' ')}
        style={style}
      >
        <div
          className="linear-progress__bar"
          style={indeterminate ? undefined : { inlineSize: `${pct}%` }}
        />
      </div>
    );
  },
);
