import { forwardRef } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar';
import type { AvatarProps } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { ItemContent } from '../ItemBlocks/ItemContent';
import './RailNavItem.css';

export type RailNavItemOrientation = 'horizontal' | 'vertical';
export type RailNavItemState = 'hovered' | 'pressed';

type BaseProps = {
  /** Texto principal. */
  label: string;
  /** Texto secundario (solo `orientation="horizontal"` no compacto, o vertical con `showContent`). */
  supporting?: string;
  /** Icono leading (24/20px). Para items de icono. */
  icon?: ReactNode;
  /** Props del `<Avatar>` — para items de avatar (el `size` lo fija el item). */
  avatarProps?: Omit<AvatarProps, 'size'>;
  /** Texto del badge de notificación (`bg/danger`). */
  badge?: string;
  /** Item activo — fondo `bg/brandSoft`, icono `icon/brand`. */
  selected?: boolean;
  disabled?: boolean;
  /** Fuerza el overlay de estado (resaltado programático). */
  state?: RailNavItemState;
  /** `horizontal` (rail expandido) · `vertical` (rail colapsado). Default `horizontal`. */
  orientation?: RailNavItemOrientation;
  /** Versión reducida (32px, sin supporting) — solo `horizontal`. */
  compact?: boolean;
  /** `vertical` — muestra el label bajo el icono. Colapsado suele ser `false`. */
  showContent?: boolean;
  /** El item despliega un subnivel — trailing con chevron (provisional). */
  expandable?: boolean;
  expanded?: boolean;
};

export type RailNavItemProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | 'type'>;

/**
 * RailNavItem — item de navegación lateral. Figma:
 * `_building_blocks_rail_navitem`. `<button>` que en `orientation="horizontal"`
 * es una fila (leading + label/supporting + badge) y en `orientation="vertical"`
 * es un icono/avatar centrado (con label opcional) — el layout que usa el rail
 * colapsado. Building block interno: se instancia dentro de `NavigationRail`.
 */
export const RailNavItem = forwardRef<HTMLButtonElement, RailNavItemProps>(function RailNavItem(
  {
    label,
    supporting,
    icon,
    avatarProps,
    badge,
    selected = false,
    disabled = false,
    state,
    orientation = 'horizontal',
    compact = false,
    showContent = true,
    expandable = false,
    expanded = false,
    className,
    ...props
  },
  ref,
) {
  const isAvatar = avatarProps != null;
  const isVertical = orientation === 'vertical';
  const badgeEl = badge != null && (
    <span className="rail-navitem__badge">
      <Badge
        semantic="error"
        variant="filled"
        size={isVertical ? 'xxs' : 'xs'}
        label={badge}
      />
    </span>
  );

  const leading = isAvatar ? (
    <Avatar size="sm" {...avatarProps} />
  ) : (
    <span className="rail-navitem__icon">{icon}</span>
  );

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-current={selected ? 'page' : undefined}
      aria-expanded={expandable ? expanded : undefined}
      className={['rail-navitem', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      data-selected={selected ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-compact={compact ? '' : undefined}
      data-expanded={expandable && expanded ? '' : undefined}
      title={orientation === 'vertical' && !showContent ? label : undefined}
      {...props}
    >
      <span className="rail-navitem__state" data-state={state || undefined}>
        {orientation === 'horizontal' ? (
          <span className="rail-navitem__row">
            <span className="rail-navitem__leading" data-avatar={isAvatar ? '' : undefined}>
              {leading}
            </span>
            {!compact ? (
              <ItemContent
                className="rail-navitem__content"
                size="md"
                layout="stacked"
                label={label}
                supporting={supporting}
              />
            ) : (
              <span className="rail-navitem__compact-label">{label}</span>
            )}
            {badge != null ? (
              <span className="rail-navitem__trailing">{badgeEl}</span>
            ) : expandable ? (
              <span className="rail-navitem__chevron">
                <ChevronDown />
              </span>
            ) : null}
          </span>
        ) : (
          <span className="rail-navitem__col">
            <span className="rail-navitem__leading-box" data-avatar={isAvatar ? '' : undefined}>
              {leading}
              {badgeEl}
            </span>
            {showContent && (
              <span className="rail-navitem__vtext">
                <span className="rail-navitem__vlabel">{label}</span>
                {supporting != null && <span className="rail-navitem__vsupporting">{supporting}</span>}
              </span>
            )}
          </span>
        )}
      </span>
    </button>
  );
});
