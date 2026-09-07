import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Close } from '@carbon/icons-react';
import { AppBar } from '../AppBar/AppBar';
import { IconButton } from '../IconButton/IconButton';
import { prefersReducedMotion, springTo } from '../../lib/spring';
import './BottomSheet.css';

export type BottomSheetType = 'default' | 'centered';

type Phase = 'entering' | 'open' | 'exiting';

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export type BottomSheetProps = {
  /** Controla la visibilidad. Al pasar a `false` reproduce la animación de salida y luego llama `onExited`. */
  open: boolean;
  /** Se llama al cerrar (backdrop, Escape, botón de cerrar). */
  onClose?: () => void;
  /** Se dispara al terminar la animación de salida — el consumidor desmonta ahí. */
  onExited?: () => void;
  /**
   * `default` — Label / Supporting en el header, alineados a la izquierda.
   * `centered` — el bloque de texto (con `slotHeading` opcional) va centrado bajo
   * un header sin título. Para estados informativos / confirmaciones. Default `default`.
   */
  type?: BottomSheetType;
  /** `true` → ocupa la altura máxima disponible y el contenido hace scroll. Default `false` (altura según contenido). */
  fullHeight?: boolean;
  /** Indicador de arrastre. `true` comunica swipe · `false` = comportamiento tipo diálogo. Default `true`. */
  showHandle?: boolean;
  /** Botón de cerrar en el header (esquina superior izquierda). Default `true`. */
  showClose?: boolean;
  /**
   * Cerrar arrastrando el sheet hacia abajo desde el handle / header. Solo
   * aplica si hay `showHandle` y `onClose`. Default `true`.
   */
  swipeToClose?: boolean;
  /** Título del sheet. */
  label?: ReactNode;
  /** Texto descriptivo breve bajo el label. */
  supporting?: ReactNode;
  /** `centered` — bloque visual (icono / ilustración) sobre el label. */
  slotHeading?: ReactNode;
  /** Acción extra en el header, a la derecha (rara vez usada). */
  headerAction?: ReactNode;
  /** Sección inferior de acciones — normalmente 1–2 `Button` (`flex: 1`). */
  footer?: ReactNode;
  /** Texto legal / aclaratorio sobre los botones del footer (`text/tertiary`, centrado). */
  microcopy?: ReactNode;
  /** Nombre accesible del diálogo (si no hay `label` visible o quieres otro). */
  'aria-label'?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'title'>;

/**
 * BottomSheet — contenedor modal anclado a la parte inferior de la pantalla.
 * Figma: `components_bottom_sheet`.
 *
 * Presenta contenido contextual, acciones y estados sin abandonar la vista.
 * Overlay que bloquea la interacción de fondo; entra/sale con `motion/spring`.
 * **No** usar para flujos largos complejos, navegación principal ni sheets
 * apilados. El header se compone con `AppBar`; el `children` es el content slot.
 */
export const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(function BottomSheet(
  {
    open,
    onClose,
    onExited,
    type = 'default',
    fullHeight = false,
    showHandle = true,
    showClose = true,
    swipeToClose = true,
    label,
    supporting,
    slotHeading,
    headerAction,
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
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const cancelSpring = useRef<(() => void) | null>(null);
  // callbacks en refs — así el efecto de transición solo depende de `open` y no
  // se re-dispara (ni su cleanup cancela el muelle) en cada render
  const onCloseRef = useRef(onClose);
  const onExitedRef = useRef(onExited);
  onCloseRef.current = onClose;
  onExitedRef.current = onExited;
  /** Posición actual del sheet en % (0 = abierto, 100 = fuera). La mantienen el
   *  muelle y el drag, y la usa el muelle de salida como punto de partida. */
  const currentPct = useRef(100);
  // `!open` → el efecto de transición también corre en el montaje inicial
  const prevOpen = useRef(!open);
  const labelId = useId();

  const setTransform = (pct: number) => {
    currentPct.current = pct;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${pct}%)`;
    // el backdrop se atenúa a la par del arrastre
    overlayRef.current?.style.setProperty('--bs-drag', String(pct / 100));
  };

  // enter / exit con muelle sobre translateY (%). También corre en el montaje.
  useEffect(() => {
    if (prevOpen.current === open) return;
    prevOpen.current = open;
    cancelSpring.current?.();

    if (open) {
      setPhase('entering');
      if (prefersReducedMotion()) {
        setTransform(0);
        setPhase('open');
      } else {
        setTransform(100);
        cancelSpring.current = springTo(100, 0, (y) => {
          setTransform(y);
          if (y === 0) setPhase('open');
        });
      }
    } else {
      setPhase('exiting');
      if (prefersReducedMotion()) {
        onExitedRef.current?.();
      } else {
        cancelSpring.current = springTo(currentPct.current, 100, (y) => {
          setTransform(y);
          if (y === 100) onExitedRef.current?.();
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
    const node = sheetRef.current;
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

  const close = useCallback(() => onCloseRef.current?.(), []);

  // ── swipe-to-dismiss (desde el handle / header) ──────────────────────────
  const swipeEnabled = swipeToClose && showHandle && onClose != null;
  const drag = useRef<{ startY: number; sheetH: number; lastY: number; lastT: number; v: number } | null>(null);

  const onDragMove = useCallback((e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    d.v = (e.clientY - d.lastY) / Math.max(now - d.lastT, 1);
    d.lastY = e.clientY;
    d.lastT = now;
    const dy = e.clientY - d.startY;
    // solo hacia abajo; un poco de resistencia hacia arriba
    const pct = dy >= 0 ? (dy / d.sheetH) * 100 : (dy / d.sheetH) * 100 * 0.15;
    setTransform(Math.max(-4, pct));
  }, []);

  const onDragEnd = useCallback(
    (e: PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragEnd);
      window.removeEventListener('pointercancel', onDragEnd);
      if (!d) return;
      (e.target as Element)?.releasePointerCapture?.(e.pointerId);
      const dy = e.clientY - d.startY;
      const dismiss = dy > d.sheetH * 0.35 || d.v > 0.55; // umbral o flick hacia abajo
      if (dismiss) {
        close();
      } else if (prefersReducedMotion()) {
        setTransform(0);
      } else {
        cancelSpring.current?.();
        cancelSpring.current = springTo(currentPct.current, 0, setTransform);
      }
    },
    [close, onDragMove],
  );

  const onDragStart = (e: React.PointerEvent) => {
    if (!swipeEnabled || e.button !== 0) return;
    // no arrancar el drag si el gesto empezó dentro de un control interactivo
    if ((e.target as Element).closest('button,a,input,select,textarea')) return;
    cancelSpring.current?.();
    const h = sheetRef.current?.getBoundingClientRect().height ?? window.innerHeight;
    drag.current = { startY: e.clientY, sheetH: h, lastY: e.clientY, lastT: performance.now(), v: 0 };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
    window.addEventListener('pointercancel', onDragEnd);
  };

  // limpia listeners de drag si el sheet se desmonta a mitad del gesto
  useEffect(
    () => () => {
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragEnd);
      window.removeEventListener('pointercancel', onDragEnd);
    },
    [onDragMove, onDragEnd],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const node = sheetRef.current;
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
  const showAppBar = closeBtn != null || headerAction != null || hasHeaderText;

  const hasCentered =
    type === 'centered' && (slotHeading != null || label != null || supporting != null);

  return (
    <div className="bottom-sheet-overlay" data-state={phase} ref={overlayRef}>
      <div
        className="bottom-sheet-overlay__backdrop"
        aria-hidden="true"
        onClick={close}
      />
      <div
        {...props}
        ref={(node) => {
          sheetRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={['bottom-sheet', className].filter(Boolean).join(' ')}
        data-type={type}
        data-full-height={fullHeight ? '' : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel && label != null ? labelId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div
          className="bottom-sheet__drag-zone"
          data-swipe={swipeEnabled ? '' : undefined}
          onPointerDown={onDragStart}
        >
          {showHandle && (
            <div className="bottom-sheet__handle" aria-hidden="true">
              <span className="bottom-sheet__handle-bar" />
            </div>
          )}

          {showAppBar && (
            <AppBar
              className="bottom-sheet__appbar"
              size="sm"
              layout={hasHeaderText ? 'stacked' : 'inline'}
              leading={closeBtn}
              trailing={headerAction}
              headline={hasHeaderText ? <span id={labelId}>{label}</span> : undefined}
              supporting={hasHeaderText ? supporting : undefined}
              aria-label="Encabezado"
            />
          )}
        </div>

        {hasCentered && (
          <div className="bottom-sheet__centered">
            {slotHeading != null && (
              <div className="bottom-sheet__slot-heading">{slotHeading}</div>
            )}
            {(label != null || supporting != null) && (
              <div className="bottom-sheet__centered-text">
                {label != null && (
                  <p className="bottom-sheet__label" id={labelId}>
                    {label}
                  </p>
                )}
                {supporting != null && (
                  <p className="bottom-sheet__supporting">{supporting}</p>
                )}
              </div>
            )}
          </div>
        )}

        {children != null && <div className="bottom-sheet__content">{children}</div>}

        {footer != null && (
          <div className="bottom-sheet__footer">
            {microcopy != null && <p className="bottom-sheet__microcopy">{microcopy}</p>}
            <div className="bottom-sheet__actions">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
});
