import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import { ItemContent } from '../ItemBlocks/ItemContent';
import { prefersReducedMotion, springTo } from '../../lib/spring';
import './AccordionItem.css';

export type AccordionItemProps = {
  /** Título de la fila — siempre visible. */
  label: ReactNode;
  /**
   * Texto secundario del header, bajo `label` — siempre visible (ej. un
   * monto bajo una fecha). Renderizado por `ItemContent`, igual que
   * `label`. Distinto de `description` (que solo se ve expandido).
   */
  supporting?: ReactNode;
  /** Controlado. Si se omite, el estado es interno (ver `defaultExpanded`). */
  expanded?: boolean;
  /** Estado inicial sin controlar. Default `false`. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Slot al inicio del header (icono, o un `PaymentStatusIndicator`). Self-stretch. */
  leading?: ReactNode;
  /**
   * Continúa `leading` a través del área de contenido expandida — pensado
   * para un `PaymentStatusIndicator` con `showIcon={false}` que mantiene el
   * timeline visualmente continuo mientras el item está abierto.
   */
  contentLeading?: ReactNode;
  /**
   * Texto secundario del content slot, arriba de `children` — solo visible
   * expandido (`Body/md`, `text/secondary`). Distinto del `supporting` del
   * header, que siempre está visible.
   */
  description?: ReactNode;
  /** Sección inferior de acciones — normalmente 1–2 `Button` a lo ancho. */
  actions?: ReactNode;
  /** Content slot flexible: texto, listas, key-value, componentes, layouts complejos. */
  children?: ReactNode;
  /** Nombre accesible del header si `label` no es suficiente. */
  'aria-label'?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * AccordionItem — unidad expandible de un `Accordion`. Figma:
 * `_building_blocks_accordion_item`.
 *
 * El header (label + `supporting`/`leading`/`trailing` opcionales, siempre
 * visible) es el área interactiva; el contenido (`description` + content
 * slot + actions) se expande/colapsa con `motion/spring` (alto + opacidad).
 * Cada item controla su propio estado — pueden estar varios expandidos a
 * la vez.
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  {
    label,
    supporting,
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    leading,
    contentLeading,
    description,
    actions,
    children,
    className,
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const expanded = expandedProp ?? expandedState;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cancelSpring = useRef<(() => void) | null>(null);
  const mounted = useRef(false);
  const labelId = useId();

  const toggle = () => {
    const next = !expanded;
    if (expandedProp === undefined) setExpandedState(next);
    onExpandedChange?.(next);
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    cancelSpring.current?.();

    if (!mounted.current) {
      mounted.current = true;
      el.style.height = expanded ? 'auto' : '0px';
      el.style.opacity = expanded ? '1' : '0';
      el.style.overflow = expanded ? 'visible' : 'hidden';
      return;
    }

    if (prefersReducedMotion()) {
      el.style.height = expanded ? 'auto' : '0px';
      el.style.opacity = expanded ? '1' : '0';
      el.style.overflow = expanded ? 'visible' : 'hidden';
      return;
    }

    if (expanded) {
      const target = el.scrollHeight;
      el.style.overflow = 'hidden';
      cancelSpring.current = springTo(0, target, (v) => {
        el.style.height = `${v}px`;
        el.style.opacity = String(target > 0 ? Math.min(v / target, 1) : 1);
        if (v >= target) {
          el.style.height = 'auto';
          el.style.overflow = 'visible';
        }
      });
    } else {
      const start = el.scrollHeight;
      el.style.height = `${start}px`;
      el.style.overflow = 'hidden';
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight; // fuerza reflow antes de animar
      cancelSpring.current = springTo(start, 0, (v) => {
        el.style.height = `${v}px`;
        el.style.opacity = String(start > 0 ? Math.max(v / start, 0) : 0);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  useEffect(() => () => cancelSpring.current?.(), []);

  return (
    <div
      {...props}
      ref={ref}
      className={['accordion-item', className].filter(Boolean).join(' ')}
      data-expanded={expanded || undefined}
    >
      <button
        type="button"
        className="accordion-item__header"
        aria-expanded={expanded}
        aria-controls={labelId}
        aria-label={ariaLabel}
        onClick={toggle}
      >
        {leading != null && <span className="accordion-item__leading">{leading}</span>}
        <ItemContent
          className="accordion-item__content-text"
          size="lg"
          label={label}
          supporting={supporting}
        />
        <span className="accordion-item__chevron" aria-hidden="true">
          <ChevronDown className="accordion-item__chevron-icon" />
        </span>
      </button>
      <div className="accordion-item__content" id={labelId} ref={contentRef}>
        <div className="accordion-item__content-row">
          {contentLeading != null && (
            <div className="accordion-item__content-leading">{contentLeading}</div>
          )}
          <div className="accordion-item__content-block">
            {description != null && <p className="accordion-item__description">{description}</p>}
            {children != null && <div className="accordion-item__slot">{children}</div>}
            {actions != null && <div className="accordion-item__actions">{actions}</div>}
          </div>
        </div>
      </div>
    </div>
  );
});
