import { forwardRef } from 'react';
import type { SVGAttributes } from 'react';
import './CircularProgress.css';

export type CircularProgressSize = 'xs' | 'sm' | 'md';

export type CircularProgressProps = {
  /** Progreso 0–100. Se ignora si `indeterminate`. Default `0`. */
  value?: number;
  /** Progreso desconocido: anillo animado en bucle. Default `false`. */
  indeterminate?: boolean;
  size?: CircularProgressSize;
  'aria-label'?: string;
} & Omit<SVGAttributes<SVGSVGElement>, 'role' | 'children'>;

const clamp = (n: number) => (n < 0 ? 0 : n > 100 ? 100 : n);

/**
 * Indicador de progreso circular. Figma: `components_circular_progress`
 * (spec original solo indeterminate; `value` es extensión del DS, espeja a
 * `LinearProgress`).
 *
 * `indeterminate` → anillo que gira. Determinate → arco proporcional a `value`
 * que arranca a las 12 en punto. Con `prefers-reduced-motion` la animación
 * indeterminate se pausa.
 *
 * Track `bg/subtle` · arco `bg/brand` · grosor fijo por el componente.
 */
export const CircularProgress = forwardRef<SVGSVGElement, CircularProgressProps>(
  function CircularProgress(
    { value = 0, indeterminate = false, size = 'sm', 'aria-label': ariaLabel = 'Cargando', className, ...props },
    ref,
  ) {
    const pct = clamp(value);
    return (
      <svg
        {...props}
        ref={ref}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : pct}
        data-size={size}
        data-indeterminate={indeterminate || undefined}
        viewBox="0 0 24 24"
        fill="none"
        className={['circular-progress', className].filter(Boolean).join(' ')}
      >
        <circle className="circular-progress__track" cx="12" cy="12" r="10.5" />
        <circle
          className="circular-progress__arc"
          cx="12"
          cy="12"
          r="10.5"
          pathLength={100}
          style={indeterminate ? undefined : { strokeDasharray: 100, strokeDashoffset: 100 - pct }}
        />
      </svg>
    );
  },
);
