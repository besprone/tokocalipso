import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { FocusEvent, PointerEvent, ReactElement, ReactNode, Ref } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TooltipAlign = 'start' | 'center' | 'end';

export type TooltipProps = {
  /** Texto descriptivo principal. Obligatorio para que el tooltip tenga sentido. */
  content?: ReactNode;
  /** Título opcional, jerárquicamente más fuerte que `content` (lo requiere). */
  heading?: ReactNode;
  /** Espacio opcional para ícono o imagen dentro del tooltip. */
  slot?: ReactNode;
  /** Lado preferido respecto al ancla. Hace flip si no hay espacio. Default `top`. */
  side?: TooltipSide;
  /** Alineación en el eje cruzado. Default `center`. */
  align?: TooltipAlign;
  /** Delay de entrada en ms (0 en salida). Default `200`. Se omite entre anclas consecutivas. */
  openDelay?: number;
  /** Control externo del estado abierto. Si se pasa, ignora hover/focus. */
  open?: boolean;
  /** Se llama cuando el tooltip pide abrir/cerrar (hover/focus/Escape). */
  onOpenChange?: (open: boolean) => void;
  /** Desactiva el tooltip (no se muestra). */
  disabled?: boolean;
  /** El ancla: un único elemento que acepte `ref` (elemento DOM o `forwardRef`). */
  children: ReactElement;
};

const OFFSET = 8;
const VIEWPORT_MARGIN = 8;
const EXIT_MS = 160;
const SKIP_DELAY_MS = 300;

/** timestamp del último cierre — para omitir el delay entre anclas consecutivas */
let lastClosedAt = 0;

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref && typeof ref === 'object') (ref as { current: T | null }).current = value;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Tooltip — panel flotante con información contextual sobre un ancla, al hacer
 * hover o focus. Figma: `components_tooltip`. **No es interactivo** (no recibe
 * clicks ni contiene acciones) y no bloquea el contenido de abajo.
 *
 * Se posiciona relativo al ancla respetando el viewport (offset 8px, flip si no
 * cabe). Máximo 200px de ancho; el contenido se recorta / envuelve. Para textos
 * largos o contenido interactivo usar popover / modal.
 */
export function Tooltip({
  content,
  heading,
  slot,
  side = 'top',
  align = 'center',
  openDelay = 200,
  open: openProp,
  onOpenChange,
  disabled = false,
  children,
}: TooltipProps) {
  const controlled = openProp !== undefined;
  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const exitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false); // dispara la transición de entrada
  const [pos, setPos] = useState<{ left: number; top: number; side: TooltipSide }>({
    left: 0,
    top: 0,
    side,
  });

  const hasBody = content != null || heading != null || slot != null;

  const open = useCallback(() => {
    clearTimeout(exitTimer.current);
    setMounted(true);
    requestAnimationFrame(() => setShown(true));
  }, []);

  const doClose = useCallback(() => {
    clearTimeout(openTimer.current);
    if (!mounted) return;
    lastClosedAt = Date.now();
    setShown(false);
    exitTimer.current = setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : EXIT_MS);
  }, [mounted]);

  const scheduleOpen = useCallback(() => {
    if (controlled) {
      onOpenChange?.(true);
      return;
    }
    if (disabled || !hasBody) return;
    clearTimeout(openTimer.current);
    const skip = Date.now() - lastClosedAt < SKIP_DELAY_MS;
    if (skip || openDelay <= 0) open();
    else openTimer.current = setTimeout(open, openDelay);
  }, [controlled, onOpenChange, disabled, hasBody, openDelay, open]);

  const close = useCallback(() => {
    if (controlled) {
      onOpenChange?.(false);
      return;
    }
    doClose();
  }, [controlled, onOpenChange, doClose]);

  // estado controlado → maneja mount/transición vía el mismo mecanismo
  useEffect(() => {
    if (!controlled) return;
    if (openProp && hasBody && !disabled) open();
    else doClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, openProp, hasBody, disabled]);

  useEffect(() => () => {
    clearTimeout(openTimer.current);
    clearTimeout(exitTimer.current);
  }, []);

  // Escape cierra
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mounted, close]);

  // posicionamiento
  const place = useCallback(() => {
    const anchorEl = anchorRef.current;
    const floatEl = floatingRef.current;
    if (!anchorEl || !floatEl) return;
    const a = anchorEl.getBoundingClientRect();
    // tamaño sin transform (la entrada anima scale) → offsetWidth/Height
    const f = { width: floatEl.offsetWidth, height: floatEl.offsetHeight };
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    let resolvedSide = side;
    // flip al lado opuesto si no hay espacio en el preferido
    const room = {
      top: a.top,
      bottom: vh - a.bottom,
      left: a.left,
      right: vw - a.right,
    };
    const opposite: Record<TooltipSide, TooltipSide> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };
    const need = side === 'top' || side === 'bottom' ? f.height + OFFSET : f.width + OFFSET;
    if (room[side] < need && room[opposite[side]] >= need) resolvedSide = opposite[side];

    let left = 0;
    let top = 0;
    if (resolvedSide === 'top' || resolvedSide === 'bottom') {
      top = resolvedSide === 'top' ? a.top - f.height - OFFSET : a.bottom + OFFSET;
      const cross =
        align === 'start' ? a.left : align === 'end' ? a.right - f.width : a.left + a.width / 2 - f.width / 2;
      left = clamp(cross, VIEWPORT_MARGIN, vw - f.width - VIEWPORT_MARGIN);
    } else {
      left = resolvedSide === 'left' ? a.left - f.width - OFFSET : a.right + OFFSET;
      const cross =
        align === 'start' ? a.top : align === 'end' ? a.bottom - f.height : a.top + a.height / 2 - f.height / 2;
      top = clamp(cross, VIEWPORT_MARGIN, vh - f.height - VIEWPORT_MARGIN);
    }
    setPos({ left: Math.round(left), top: Math.round(top), side: resolvedSide });
  }, [side, align]);

  useLayoutEffect(() => {
    if (!mounted) return;
    place();
    const onChange = () => place();
    window.addEventListener('scroll', onChange, true);
    window.addEventListener('resize', onChange);
    return () => {
      window.removeEventListener('scroll', onChange, true);
      window.removeEventListener('resize', onChange);
    };
  }, [mounted, place]);

  // ── ancla ────────────────────────────────────────────────────────────
  const childProps = children.props as Record<string, unknown>;
  const childRef =
    (children as unknown as { ref?: Ref<HTMLElement> }).ref ?? (childProps.ref as Ref<HTMLElement> | undefined);

  const compose =
    <E,>(theirs: ((e: E) => void) | undefined, ours: (e: E) => void) =>
    (e: E) => {
      theirs?.(e);
      ours(e);
    };

  const anchor = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      anchorRef.current = node;
      setRef(childRef, node);
    },
    'aria-describedby': mounted
      ? [childProps['aria-describedby'], id].filter(Boolean).join(' ')
      : childProps['aria-describedby'],
    onPointerEnter: compose(childProps.onPointerEnter as (e: PointerEvent) => void, scheduleOpen),
    onPointerLeave: compose(childProps.onPointerLeave as (e: PointerEvent) => void, close),
    onFocus: compose(childProps.onFocus as (e: FocusEvent) => void, scheduleOpen),
    onBlur: compose(childProps.onBlur as (e: FocusEvent) => void, close),
  } as Record<string, unknown>);

  return (
    <>
      {anchor}
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={floatingRef}
            id={id}
            role="tooltip"
            className="tooltip"
            data-side={pos.side}
            data-state={shown ? 'open' : 'closed'}
            style={{ position: 'fixed', left: pos.left, top: pos.top }}
          >
            {heading != null && <p className="tooltip__heading">{heading}</p>}
            {content != null && <p className="tooltip__content">{content}</p>}
            {slot != null && <div className="tooltip__slot">{slot}</div>}
          </div>,
          document.body,
        )}
    </>
  );
}
