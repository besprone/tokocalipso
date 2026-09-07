import { ChevronDown } from '@carbon/icons-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ItemContent } from '../ItemBlocks/ItemContent';
import { ItemTrailing } from '../ItemBlocks/ItemTrailing';
import './MenuItem.css';

/** Estado visual forzado — para resaltado programático (item activo por teclado
 *  en un menú flotante). Sin él, `:hover` / `:active` aplican de forma natural. */
export type MenuItemState = 'hovered' | 'pressed';

type BaseProps = {
  /** Texto principal (Body/md-semiemphasized · text/primary). */
  label: ReactNode;
  /** Texto secundario opcional (Body/sm · text/secondary). */
  supporting?: ReactNode;
  /** Slot izquierdo — icono ~20px, o un `<ItemLeading>`. */
  leading?: ReactNode;
  /** Slot derecho — icono/acción ~24px, o un `<ItemTrailing>`. Si se omite y
   *  `expandable`, se dibuja un chevron que rota con `expanded`. */
  trailing?: ReactNode;
  /** Item activo — fondo `bg/brandSoft`, iconos a `icon/brand`. */
  selected?: boolean;
  /** No interactuable. */
  disabled?: boolean;
  /** Fuerza el overlay de estado (resaltado programático). */
  state?: MenuItemState;
  /** El item despliega un subnivel — el trailing muestra un chevron. */
  expandable?: boolean;
  /** Subnivel desplegado — rota el chevron 180°. */
  expanded?: boolean;
};

export type MenuItemProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | 'type'>;

/**
 * MenuItem — item individual de `Menu`. Figma: `_building_blocks_menu_item`.
 * `<button role="menuitem">` de 48px, más compacto que `ListItem` (padding
 * 12/4). Compone `ItemContent` (`size="md"`); `leading` / `trailing` son slots.
 *
 * Building block interno: se instancia dentro de `Menu` (o de un componente que
 * lo envuelva). No se usa suelto en producto.
 */
export function MenuItem({
  label,
  supporting,
  leading,
  trailing,
  selected = false,
  disabled = false,
  state,
  expandable = false,
  expanded = false,
  className,
  ...props
}: MenuItemProps) {
  const trailingNode =
    trailing ?? (expandable ? <ItemTrailing type="icon" icon={<ChevronDown />} /> : null);

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-expanded={expandable ? expanded : undefined}
      aria-current={selected || undefined}
      className={['menu-item', className].filter(Boolean).join(' ')}
      data-selected={selected ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-expanded={expandable && expanded ? '' : undefined}
      {...props}
    >
      <span className="menu-item__state" data-state={state || undefined}>
        <span className="menu-item__container">
          {leading != null && <span className="menu-item__leading">{leading}</span>}
          <ItemContent
            className="menu-item__content"
            size="md"
            layout="stacked"
            label={label}
            supporting={supporting}
          />
          {trailingNode != null && <span className="menu-item__trailing">{trailingNode}</span>}
        </span>
      </span>
    </button>
  );
}
