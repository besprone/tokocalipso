import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Close } from '@carbon/icons-react';
import { IconButton } from '../IconButton/IconButton';
import { prefersReducedMotion, springTo } from '../../lib/spring';
import './SideDrawer.css';

export type SideDrawerAnchor = 'left' | 'right';
/** Solo `lg` (360px) está construido — `sm`/`md` quedan reservados (Figma: "previstos para más adelante"). */
export type SideDrawerSize = 'lg';

type Phase = 'entering' | 'open' | 'exiting';

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export type SideDrawerProps = {
  /** Controla la visibilidad. Al pasar a `false` reproduce la animación de salida y luego llama `onExited`. */
  open: boolean;
  /** Se llama al cerrar (overlay, Escape, botón de cerrar). */
  onClose?: () => void;
  /** Se dispara al terminar la animación de salida — el consumidor desmonta ahí. */
  onExited?: () => void;
  /** Orilla a la que se ancla. Default `right`. */
  anchor?: SideDrawerAnchor;
  /** Solo `lg` (360px) por ahora. Default `lg`. */
  size?: SideDrawerSize;
  /** Botón de cerrar en el header. Default `true`. */
  showClose?: boolean;
  /** Acción extra en el header, junto al cerrar. */
  headerAction?: ReactNode;
  /** Título del drawer. */
  label?: ReactNode;
  /** Texto descriptivo breve bajo el label. */
  supporting?: ReactNode;
  /** Sección inferior de acciones — 1–2 `Button`, alineados a la derecha (sin stretch). */
  footer?: ReactNode;
  /** Texto legal / aclaratorio sobre los botones del footer (`text/tertiary`, centrado). */
  microcopy?: ReactNode;
  /** Nombre accesible del drawer (si no hay `label` visible o quieres otro). */
  'aria-label'?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'title'>;

/**
 * SideDrawer — superficie modal anclada a la orilla lateral de la pantalla.
 * Figma: `components_side_drawer`.
 *
 * Se usa para filtros, navegación secundaria o contenido complementario que
 * no debe interrumpir el flujo principal. A diferencia de `Dialog`
 * (centrado), mantiene visible el contenido detrás mediante un overlay.
 * Ocupa siempre el alto completo del viewport. El `children` es el content
 * slot.
 */
export const SideDrawer = forwardRef<HTMLDivElement, SideDrawerProps>(function SideDrawer(
  {
    open,
    onClose,
    onExited,
    anchor = 'right',
    size = 'lg',
    showClose = true,
    headerAction,
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
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const cancelSpring = useRef<(() => void) | null>(null);
  // callback en ref — así el efecto de transición solo depende de `open` y no
  // se re-dispara (ni su cleanup cancela el muelle) en cada render
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;
  const labelId = useId();
  /** Progreso animado actual (0 cerrado → 1 abierto). Punto de partida de la
   *  siguiente transición — el efecto reconcilia contra el estado real, no
   *  contra un flag "ya lo hice" (que StrictMode rompe con su doble montaje). */
  const progress = useRef(0);

  const setProgress = (p: number) => {
    progress.current = p;
    overlayRef.current?.style.setProperty('--drawer-progress', String(p));
  };

  // enter / exit con muelle sobre un progreso 0 (cerrado) → 1 (abierto).
  // Corre en el montaje y en cada cambio de `open`. Reconcilia desde
  // `progress.current` (el estado real), no desde un flag "ya lo hice" — que
  // StrictMode rompe montando dos veces en dev. `alive` desactiva las
  // escrituras de la corrida sustituida (la 2ª es la que gana).
  useEffect(() => {
    let alive = true;
    cancelSpring.current?.();
    const target = open ? 1 : 0;

    setPhase(open ? 'entering' : 'exiting');

    if (prefersReducedMotion()) {
      setProgress(target);
      if (open) setPhase('open');
      else onExitedRef.current?.();
      return () => {
        alive = false;
      };
    }

    setProgress(progress.current); // sincroniza el DOM al punto de partida
    let exited = false;
    const cancel = springTo(progress.current, target, (p) => {
      if (!alive || exited) return;
      setProgress(p);
      if (open) {
        if (p === target) setPhase('open');
      } else if (p <= target) {
        // ya fuera de pantalla — el rebote posterior del muelle solo retrasa
        // el desmontaje dejando el overlay capturando clics.
        exited = true;
        cancelSpring.current?.();
        onExitedRef.current?.();
      }
    });
    cancelSpring.current = cancel;

    return () => {
      alive = false;
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // foco: mover al primer interactivo al abrir, restaurar al cerrar
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    const node = drawerRef.current;
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
    const node = drawerRef.current;
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

  const hasHeaderText = label != null || supporting != null;
  const showHeader = closeBtn != null || headerAction != null || hasHeaderText;
  const labelledBy = !ariaLabel && label != null ? labelId : undefined;

  return (
    <div className="side-drawer-overlay" data-anchor={anchor} data-state={phase} ref={overlayRef}>
      <div className="side-drawer-overlay__backdrop" aria-hidden="true" onClick={close} />
      <div
        {...props}
        ref={(node) => {
          drawerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={['side-drawer', className].filter(Boolean).join(' ')}
        data-anchor={anchor}
        data-size={size}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {showHeader && (
          <div className="side-drawer__header">
            <div className="side-drawer__header-row">
              <div className="side-drawer__header-actions">
                {headerAction}
                {closeBtn}
              </div>
            </div>
            {hasHeaderText && (
              <div className="side-drawer__header-text">
                {label != null && (
                  <p className="side-drawer__label" id={labelId}>
                    {label}
                  </p>
                )}
                {supporting != null && <p className="side-drawer__supporting">{supporting}</p>}
              </div>
            )}
          </div>
        )}

        {children != null && <div className="side-drawer__content">{children}</div>}

        {footer != null && (
          <div className="side-drawer__footer">
            {microcopy != null && <p className="side-drawer__microcopy">{microcopy}</p>}
            <div className="side-drawer__actions">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
});
