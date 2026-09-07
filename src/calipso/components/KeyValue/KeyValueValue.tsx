import { forwardRef, useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import './KeyValueValue.css';

export type KeyValueValueColor = 'default' | 'accent';

export type KeyValueValueProps = {
  /** `Body/md` (14/20) → `Headline/xs` (22/30) en negrita, mismo color. Default `false`. */
  emphasis?: boolean;
  /** Default `default`. */
  color?: KeyValueValueColor;
  /** Texto breve junto al value (`Body/md` en negrita, `text/accent`). */
  promo?: ReactNode;
  /** Icono al final del value (20px). Distinto del `trailing` del row. */
  trailing?: ReactNode;
  /**
   * Activa el toggle "ver completo / ver menos" para revelar contenido largo
   * que por default se trunca (sellos digitales, hashes, folios extensos).
   * Default `false`.
   */
  expandable?: boolean;
  /** Controlado. Si se omite, el estado es interno (ver `defaultExpanded`). */
  expanded?: boolean;
  /** Estado inicial sin controlar. Default `false`. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Label del toggle colapsado. Default `"Ver completo"`. */
  expandLabel?: ReactNode;
  /** Label del toggle expandido. Default `"Ver menos"`. */
  collapseLabel?: ReactNode;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'color'>;

/**
 * KeyValueValue — dato principal asociado a una key, dentro de un
 * `KeyValueRow`. Figma: `_building_blocks_value` (+ `_building_blocks_menu_button`
 * cuando `expandable`).
 *
 * Por default trunca a una línea con ellipsis. `expandable` agrega un toggle
 * que revela el contenido completo (multilínea) bajo demanda — usar para
 * cadenas largas que no caben en una fila (sello digital, hash, folio).
 */
export const KeyValueValue = forwardRef<HTMLDivElement, KeyValueValueProps>(function KeyValueValue(
  {
    emphasis = false,
    color = 'default',
    promo,
    trailing,
    expandable = false,
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    expandLabel = 'Ver completo',
    collapseLabel = 'Ver menos',
    children,
    className,
    ...props
  },
  ref,
) {
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const expanded = expandable && (expandedProp ?? expandedState);
  const textId = useId();

  const toggle = () => {
    const next = !expanded;
    if (expandedProp === undefined) setExpandedState(next);
    onExpandedChange?.(next);
  };

  return (
    <div
      {...props}
      ref={ref}
      className={['key-value-value', className].filter(Boolean).join(' ')}
      data-emphasis={emphasis || undefined}
      data-color={color}
      data-expandable={expandable || undefined}
      data-expanded={expanded || undefined}
    >
      <div className="key-value-value__content">
        <p className="key-value-value__text" id={textId}>
          {children}
        </p>
        {promo != null && <span className="key-value-value__promo">{promo}</span>}
        {trailing != null && <span className="key-value-value__trailing">{trailing}</span>}
      </div>
      {expandable && (
        <button
          type="button"
          className="key-value-value__toggle"
          aria-expanded={expanded}
          aria-controls={textId}
          onClick={toggle}
        >
          <span>{expanded ? collapseLabel : expandLabel}</span>
          <ChevronDown className="key-value-value__chevron" />
        </button>
      )}
    </div>
  );
});
