import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from '@carbon/icons-react';
import { IconButton } from '../IconButton/IconButton';
import './Carousel.css';

export type CarouselItemsPerView = 1 | 2 | 3;

export type CarouselProps = {
  /** Slots visibles por página (Figma: `# slots * block` / `configuration`). Default `1`. */
  itemsPerView?: CarouselItemsPerView;
  /** Dots indicadores de paginación (no interactivos). Default `true`. */
  pagination?: boolean;
  /** Flechas prev/next (afordancia de desktop; en touch/mouse se usa swipe). Default `false`. */
  controls?: boolean;
  /**
   * Loop **sin costura**: se clona una página en cada extremo; al pasar del
   * último slot el movimiento continúa (misma dirección) hasta el clon y luego
   * se reposiciona en silencio sobre la página real. Aplica a swipe, arrastre,
   * flechas y teclado. Los slides deben ser **sin estado** (se clonan).
   * Default `false`.
   */
  loop?: boolean;
  /** Nombre de la región para lectores de pantalla. Requerido. */
  'aria-label': string;
  /** Se llama al cambiar de página (0-based, índice real). */
  onPageChange?: (page: number) => void;
  /** Los slides — cada hijo es un slot con cualquier composición del DS. */
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onScroll'>;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const DRAG_THRESHOLD = 5;
const IDLE_MS = 120;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const supportsScrollEnd = typeof window !== 'undefined' && 'onscrollend' in window;

/**
 * Carousel — contenido secuencial desplazable horizontalmente. Figma:
 * `components_carousel`. Encapsula el layout y controla la página activa.
 *
 * Navegación: **swipe** táctil (scroll-snap nativo), **arrastre con mouse**,
 * teclado **←/→** con el viewport enfocado, y las **flechas** opcionales
 * (`controls`). `loop` cicla sin costura (ver prop). Los dots solo indican.
 *
 * Los slots son `children` (páginas derivadas por `itemsPerView`); no replica
 * los building blocks de Figma, que son andamiaje de diseño.
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { itemsPerView = 1, pagination = true, controls = false, loop = false, onPageChange, children, className, ...props },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const pages = chunk(Children.toArray(children), itemsPerView);
  const pageCount = pages.length;
  const multi = pageCount > 1;
  const looping = loop && multi;

  // ── DOM: [clon-del-último] · páginas reales · [clon-del-primero] ────────
  const domPages: { items: ReactNode[]; clone: boolean }[] = looping
    ? [
        { items: pages[pageCount - 1], clone: true },
        ...pages.map((items) => ({ items, clone: false })),
        { items: pages[0], clone: true },
      ]
    : pages.map((items) => ({ items, clone: false }));
  const domLen = domPages.length;
  pageRefs.current.length = domLen;

  const domIndexOfReal = useCallback((r: number) => (looping ? r + 1 : r), [looping]);
  const realIndexOfDom = useCallback(
    (d: number) => {
      if (!looping) return d;
      if (d <= 0) return pageCount - 1; // clon del último
      if (d >= pageCount + 1) return 0; // clon del primero
      return d - 1;
    },
    [looping, pageCount],
  );

  const nearestDomPage = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return 0;
    let best = 0;
    let min = Infinity;
    pageRefs.current.forEach((el, d) => {
      if (!el) return;
      const dist = Math.abs(el.offsetLeft - vp.scrollLeft);
      if (dist < min) {
        min = dist;
        best = d;
      }
    });
    return best;
  }, []);

  const setPage = useCallback(
    (next: number) => setActive((prev) => (prev === next ? prev : (onPageChange?.(next), next))),
    [onPageChange],
  );

  const goToDom = useCallback((d: number, instant = false) => {
    const vp = viewportRef.current;
    const el = pageRefs.current[d];
    if (!vp || !el) return;
    vp.scrollTo({
      left: el.offsetLeft,
      behavior: instant || prefersReducedMotion() ? 'instant' : 'smooth',
    });
  }, []);

  // salto de página con flechas/teclado
  const step = useCallback(
    (delta: number) => {
      const target = active + delta;
      if (target > pageCount - 1) {
        if (!looping) return;
        goToDom(domLen - 1); // clon del primero → continúa a la derecha
      } else if (target < 0) {
        if (!looping) return;
        goToDom(0); // clon del último → continúa a la izquierda
      } else {
        goToDom(domIndexOfReal(target));
      }
    },
    [active, pageCount, looping, domLen, goToDom, domIndexOfReal],
  );

  // posición inicial: primera página real (después del clon izquierdo)
  useLayoutEffect(() => {
    if (!looping) return;
    const vp = viewportRef.current;
    const first = pageRefs.current[1];
    if (vp && first) vp.scrollLeft = first.offsetLeft;
  }, [looping, itemsPerView, pageCount]);

  // página activa a partir del scroll
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPage(realIndexOfDom(nearestDomPage())));
    };
    vp.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      vp.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [setPage, realIndexOfDom, nearestDomPage, domLen]);

  // reposición silenciosa: al asentar sobre un clon, saltar a la página real
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !looping) return;
    let idle = 0;
    const settle = () => {
      if (drag.current.active) return;
      const d = nearestDomPage();
      const targetDom = d <= 0 ? pageCount : d >= pageCount + 1 ? 1 : -1;
      if (targetDom < 0) return;
      const el = pageRefs.current[targetDom];
      if (el && Math.abs(vp.scrollLeft - el.offsetLeft) > 1) {
        vp.scrollTo({ left: el.offsetLeft, behavior: 'instant' });
      }
    };
    const onScrollIdle = () => {
      if (supportsScrollEnd) return;
      clearTimeout(idle);
      idle = window.setTimeout(settle, IDLE_MS);
    };
    vp.addEventListener('scrollend', settle);
    vp.addEventListener('scroll', onScrollIdle, { passive: true });
    return () => {
      vp.removeEventListener('scrollend', settle);
      vp.removeEventListener('scroll', onScrollIdle);
      clearTimeout(idle);
    };
  }, [looping, pageCount, nearestDomPage]);

  // ── arrastre con mouse (el táctil usa el scroll nativo) ────────────────
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const vp = viewportRef.current;
    if (!vp) return;
    drag.current = { active: true, startX: e.clientX, startScroll: vp.scrollLeft, moved: false };
    vp.setPointerCapture(e.pointerId);
    vp.style.scrollSnapType = 'none';
    vp.style.scrollBehavior = 'auto';
    vp.style.cursor = 'grabbing';
    vp.style.userSelect = 'none';
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) d.moved = true;
    viewportRef.current!.scrollLeft = d.startScroll - dx;
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const vp = viewportRef.current!;
    try {
      vp.releasePointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
    vp.style.scrollSnapType = '';
    vp.style.scrollBehavior = '';
    vp.style.cursor = '';
    vp.style.userSelect = '';
    if (d.moved) goToDom(nearestDomPage());
  };
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <div
      {...props}
      ref={ref}
      className={['carousel', className].filter(Boolean).join(' ')}
      data-controls={controls && multi ? '' : undefined}
    >
      <div
        ref={viewportRef}
        className="carousel__viewport"
        role="group"
        aria-roledescription="carrusel"
        aria-label={props['aria-label']}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStartCapture={(e) => {
          if (drag.current.active) e.preventDefault();
        }}
      >
        <div className="carousel__track">
          {domPages.map(({ items, clone }, d) => {
            const realIdx = looping ? d - 1 : d;
            return (
              <div
                key={d}
                ref={(el) => {
                  pageRefs.current[d] = el;
                }}
                className={['carousel__page', clone ? 'carousel__page--clone' : '']
                  .filter(Boolean)
                  .join(' ')}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={clone ? undefined : `${realIdx + 1} de ${pageCount}`}
                aria-hidden={clone || realIdx !== active || undefined}
                inert={clone || undefined}
              >
                {items.map((item, j) => (
                  <div key={j} className="carousel__slot">
                    {item}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {multi && (
        <span className="carousel__status" aria-live="polite">
          Página {active + 1} de {pageCount}
        </span>
      )}

      {controls && multi && (
        <>
          <IconButton
            className="carousel__arrow carousel__arrow--prev"
            emphasis="ghost"
            size="sm"
            icon={<ChevronLeft size={16} />}
            aria-label="Anterior"
            disabled={!looping && active === 0}
            onClick={() => step(-1)}
          />
          <IconButton
            className="carousel__arrow carousel__arrow--next"
            emphasis="ghost"
            size="sm"
            icon={<ChevronRight size={16} />}
            aria-label="Siguiente"
            disabled={!looping && active === pageCount - 1}
            onClick={() => step(1)}
          />
        </>
      )}

      {pagination && multi && (
        <div className="carousel__dots" aria-hidden="true">
          {pages.map((_, i) => (
            <span key={i} className="carousel__dot" data-active={i === active || undefined} />
          ))}
        </div>
      )}
    </div>
  );
});
