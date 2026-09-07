import type { HTMLAttributes, ReactNode } from 'react';
import './ItemContent.css';

export type ItemContentSize = 'sm' | 'md' | 'lg';
export type ItemContentLayout = 'stacked' | 'horizontal';

type BaseProps = {
  /** Escala tipográfica. `lg` (16/14) · `md` (14/12) · `sm` (12/10). Default `lg`. */
  size?: ItemContentSize;
  /** `stacked` (label sobre supporting) · `horizontal` (todo en fila). Default
   *  `stacked`. `horizontal` solo está definido en Figma para `size="lg"`. */
  layout?: ItemContentLayout;
  /** Texto principal. */
  label: ReactNode;
  /** Texto de apoyo (`supporting 1`). `text/secondary`. */
  supporting?: ReactNode;
  /** Segundo apoyo (`supporting 2`) — `text/tertiary`, alineado a la derecha. */
  supporting2?: ReactNode;
  /** Eyebrow / overline — `text/tertiary`, sobre/junto al label. */
  overline?: ReactNode;
  /** Slot para una fila de acciones (`patterns_buttons_actions` en Figma). */
  action?: ReactNode;
};

export type ItemContentProps = BaseProps & Omit<HTMLAttributes<HTMLDivElement>, keyof BaseProps>;

/**
 * ItemContent — bloque de texto de un row (list item, menu item, cell…).
 * Figma: `_building_blocks_content`. Label + apoyo(s) + overline + slot de
 * acción, con escala (`size`) y disposición (`layout`).
 */
export function ItemContent({
  size = 'lg',
  layout = 'stacked',
  label,
  supporting,
  supporting2,
  overline,
  action,
  className,
  ...props
}: ItemContentProps) {
  const root = ['item-content', className].filter(Boolean).join(' ');

  if (layout === 'horizontal') {
    return (
      <div className={root} data-layout="horizontal" data-size={size} {...props}>
        <span className="item-content__label">{label}</span>
        {supporting != null && <span className="item-content__supporting">{supporting}</span>}
        {overline != null && <span className="item-content__overline">{overline}</span>}
        {supporting2 != null && <span className="item-content__supporting2">{supporting2}</span>}
        {action != null && <div className="item-content__action">{action}</div>}
      </div>
    );
  }

  return (
    <div className={root} data-layout="stacked" data-size={size} {...props}>
      <div className="item-content__text">
        <div className="item-content__row">
          <span className="item-content__label">{label}</span>
          {overline != null && <span className="item-content__overline">{overline}</span>}
        </div>
        {(supporting != null || supporting2 != null) && (
          <div className="item-content__row">
            {supporting != null && <span className="item-content__supporting">{supporting}</span>}
            {supporting2 != null && <span className="item-content__supporting2">{supporting2}</span>}
          </div>
        )}
      </div>
      {action != null && <div className="item-content__action">{action}</div>}
    </div>
  );
}
