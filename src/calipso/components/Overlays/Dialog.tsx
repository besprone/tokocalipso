import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Close } from '@carbon/icons-react';
import { IconButton } from '../IconButton/IconButton';
import { prefersReducedMotion, springTo } from '../../lib/spring';
import './Dialog.css';

export type DialogType = 'default' | 'centered' | 'iframe' | 'slotOnly';
export type DialogSize = 'md' | 'lg';

type Phase = 'entering' | 'open' | 'exiting';

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export type DialogProps = {
  /** Controla la visibilidad. Al pasar a `false` reproduce la animación de salida y luego llama `onExited`. */
  open: boolean;
  /** Se llama al cerrar (backdrop, Escape, botón de cerrar). */
  onClose?: () => void;
  /** Se dispara al terminar la animación de salida — el consumidor desmonta ahí. */
  onExited?: () => void;
  /**
   * `default` — header con Label / Supporting (izquierda) + cerrar (derecha).
   * `centered` — sin título en el header; el bloque (`slotHeading` + label +
   * supporting) va centrado sobre el content slot. Estados informativos / confirmaciones.
   * `iframe` — header minimal (cerrar a la izquierda, acciones a la derecha) para
   * contenido embebido (web views).
   * `slotOnly` — sin header ni footer, solo el content slot.
   * Default `default`.
   */
  type?: DialogType;
  /** Solo aplica con `fullHeight`: altura máxima 600 (`md`) · 800 (`lg`). Default `md`. */
  size?: DialogSize;
  /** `true` → ocupa la altura máxima disponible y el content slot hace scroll. Default `false` (altura según contenido). */
  fullHeight?: boolean;
  /** Botón de cerrar en el header. Default `true`. */
  showClose?: boolean;
  /** Acción extra en el header (p. ej. compartir / buscar en `iframe`). */
  headerAction?: ReactNode;
  /** `centered` — bloque visual (icono / ilustración) sobre el label. */
  slotHeading?: ReactNode;
  /** Título del diálogo. */
  label?: ReactNode;
  /** Texto descriptivo breve bajo el label. */
  supporting?: ReactNode;
  /** Sección inferior de acciones — 1–2 `Button`, alineados a la derecha (sin stretch). */
  footer?: ReactNode;
  /** Texto legal / aclaratorio sobre los botones del footer (`text/tertiary`, centrado). */
  microcopy?: ReactNode;
  /** Nombre accesible del diálogo (si no hay `label` visible o quieres otro). */
  'aria-label'?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'title'>;

/**
 * Dialog — contenedor modal centrado. Figma: `components_dialog`.
 *
 * Interrumpe el flujo para presentar contenido crítico, confirmaciones,
 * formularios o información contextual. Bloquea la interacción con el
 * contenido subyacente hasta que se resuelva o se cierre. **No** usar para
 * mensajes informativos simples (toast / banner) ni más de un diálogo
 * simultáneo. El `children` es el content slot.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    onExited,
    type = 'default',
    size = 'md',
    fullHeight = false,
    showClose = true,
    headerAction,
    slotHeading,
    label,
    supporting,
    footer,
    microcopy,
    'aria-label': ariaLabel,
    className,
    children,
    ...props
  },
  ref,
) {
  const [phase, setPhase] = useState<Phase>('entering');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const cancelSpring = useRef<(() => void) | null>(null);
  // callbacks en refs — así el efecto de transición solo depende de `open` y no
  // se re-dispara (ni su cleanup cancela el muelle) en cada render
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;
  const prevOpen = useRef(!open);
  const labelId = useId();

  const setProgress = (p: number) => {
    overlayRef.current?.style.setProperty('--dialog-progress', String(p));
  };

  // enter / exit con muelle sobre un progreso 0 (cerrado) → 1 (abierto). También corre en el montaje.
  useEffect(() => {
    if (prevOpen.current === open) return;
    prevOpen.current = open;
    cancelSpring.current?.();

    if (open) {
      setPhase('entering');
      if (prefersReducedMotion()) {
        setProgress(1);
        setPhase('open');
      } else {
        setProgress(0);
        cancelSpring.current = springTo(0, 1, (p) => {
          setProgress(p);
          if (p === 1) setPhase('open');
        });
      }
    } else {
      setPhase('exiting');
      if (prefersReducedMotion()) {
        onExitedRef.current?.();
      } else {
        cancelSpring.current = springTo(1, 0, (p) => {
          setProgress(p);
          if (p === 0) onExitedRef.current?.();
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // cancela el muelle al desmontar
  useEffect(() => () => cancelSpring.current?.(), []);

  // foco: mover al primer interactivo al abrir, restaurar al cerrar
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    const node = dialogRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus();
    return () => prevFocus.current?.focus?.();
  }, [open]);

  // scroll lock del body mientras está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = useCallback(() => onClose?.(), [onClose]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const node = dialogRef.current;
    if (!node) return;
    const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null,
    );
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const firstEl = items[0];
    const lastEl = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === firstEl || active === node)) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && active === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  };

  const closeBtn = showClose ? (
    <IconButton
      emphasis="ghost"
      size="lg"
      aria-label="Cerrar"
      icon={<Close />}
      onClick={close}
    />
  ) : undefined;

  const hasHeaderText = type === 'default' && (label != null || supporting != null);
  const showHeader = type !== 'slotOnly' && (closeBtn != null || headerAction != null || hasHeaderText);
  const showFooter = type !== 'slotOnly' && footer != null;
  const hasCentered = type === 'centered' && (slotHeading != null || label != null || supporting != null);
  const labelledBy = !ariaLabel && (hasHeaderText || hasCentered) && label != null ? labelId : undefined;

  const content = children != null ? <div className="dialog__content">{children}</div> : null;

  return (
    <div className="dialog-overlay" data-state={phase} ref={overlayRef}>
      <div className="dialog-overlay__backdrop" aria-hidden="true" onClick={close} />
      <div
        {...props}
        ref={(node) => {
          dialogRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={['dialog', className].filter(Boolean).join(' ')}
        data-type={type}
        data-size={size}
        data-full-height={fullHeight ? '' : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {showHeader && (
          <div className="dialog__header">
            <div className="dialog__header-row">
              {type === 'iframe' && closeBtn}
              <div className="dialog__header-actions">
                {headerAction}
                {type !== 'iframe' && closeBtn}
              </div>
            </div>
            {hasHeaderText && (
              <div className="dialog__header-text">
                {label != null && (
                  <p className="dialog__label" id={labelId}>
                    {label}
                  </p>
                )}
                {supporting != null && <p className="dialog__supporting">{supporting}</p>}
              </div>
            )}
          </div>
        )}

        {type === 'centered' ? (
          (hasCentered || content) && (
            <div className="dialog__container">
              {hasCentered && (
                <div className="dialog__centered">
                  {slotHeading != null && <div className="dialog__slot-heading">{slotHeading}</div>}
                  {(label != null || supporting != null) && (
                    <div className="dialog__centered-text">
                      {label != null && (
                        <p className="dialog__label" id={labelId}>
                          {label}
                        </p>
                      )}
                      {supporting != null && <p className="dialog__supporting">{supporting}</p>}
                    </div>
                  )}
                </div>
              )}
              {content}
            </div>
          )
        ) : (
          content
        )}

        {showFooter && (
          <div className="dialog__footer">
            {microcopy != null && <p className="dialog__microcopy">{microcopy}</p>}
            <div className="dialog__actions">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
});
