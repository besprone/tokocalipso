import { forwardRef, useEffect, useState } from 'react';
import type { AnimationEvent, HTMLAttributes, ReactNode } from 'react';
import { SnackbarLayout } from './SnackbarLayout';
import { SnackbarActions, type SnackbarAction } from './SnackbarActions';
import './Snackbar.css';

export type SnackbarVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export type SnackbarProps = {
  /** Intención visual. `neutral` (default) · `success` · `warning` · `error` · `info`. */
  variant?: SnackbarVariant;
  /** Texto de soporte. Breve; describe el resultado, no depende solo del color. */
  message: ReactNode;
  /** Acción secundaria opcional (nunca primaria). */
  action?: SnackbarAction;
  /** Si se pasa, muestra el botón de cerrar. */
  onClose?: () => void;
  /** aria-label del botón de cerrar. Default `"Cerrar"`. */
  closeLabel?: string;
  /**
   * Rol ARIA. Por defecto `alert` para `warning`/`error`, `status` para el
   * resto. `alert` se anuncia de inmediato (`aria-live="assertive"`).
   */
  role?: 'status' | 'alert';
  /**
   * Modo animado. Al pasar `open`, el Snackbar anima su entrada al montar
   * (desliza desde arriba + fade in) y su salida cuando `open` pasa a `false`
   * (desliza hacia abajo + fade out); al terminar la salida llama a `onExited`
   * — ahí el padre lo desmonta. Si se omite, se renderiza estático.
   */
  open?: boolean;
  /** Se llama al terminar la animación de salida (`open` → `false`). */
  onExited?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'children'>;

type Phase = 'entering' | 'open' | 'exiting';

/**
 * Snackbar — feedback temporal **no bloqueante**. Confirmaciones, errores no
 * críticos, advertencias o info contextual. No interrumpe el flujo principal;
 * no reemplaza modales ni banners persistentes. Figma: `components_snackbar`.
 *
 * Es el **card**. El posicionamiento (portal, `fixed`, safe-area) y la cola de
 * uno-a-la-vez los gestiona quien lo monta. La entrada/salida sí las anima el
 * componente vía la prop `open` (ver notas de comportamiento). Auto-cierre
 * recomendado: 3–5 s para `neutral`/`success`; `error` puede permanecer hasta
 * que haya acción.
 */
export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(function Snackbar(
  { variant = 'neutral', message, action, onClose, closeLabel, role, open, onExited, className, onAnimationEnd, ...props },
  ref,
) {
  const resolvedRole = role ?? (variant === 'warning' || variant === 'error' ? 'alert' : 'status');
  const hasActions = action != null || onClose != null;
  const animated = open !== undefined;

  const [phase, setPhase] = useState<Phase>('entering');

  useEffect(() => {
    if (!animated) return;
    setPhase((p) => (open ? (p === 'exiting' ? 'entering' : p) : 'exiting'));
  }, [animated, open]);

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    onAnimationEnd?.(e);
    if (!animated || e.target !== e.currentTarget) return;
    if (phase === 'entering') setPhase('open');
    else if (phase === 'exiting') onExited?.();
  };

  return (
    <div
      {...props}
      ref={ref}
      role={resolvedRole}
      aria-live={resolvedRole === 'alert' ? 'assertive' : 'polite'}
      data-variant={variant}
      data-state={animated ? phase : undefined}
      onAnimationEnd={handleAnimationEnd}
      className={['snackbar', className].filter(Boolean).join(' ')}
    >
      <SnackbarLayout
        message={message}
        actions={
          hasActions ? (
            <SnackbarActions action={action} onClose={onClose} closeLabel={closeLabel} />
          ) : undefined
        }
      />
    </div>
  );
});
