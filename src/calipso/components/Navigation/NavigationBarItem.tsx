import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar';
import type { AvatarProps } from '../Avatar/Avatar';
import './NavigationBarItem.css';

export type NavigationBarItemType = 'icon' | 'avatar' | 'emphasis';

export type NavigationBarItemProps = {
  /** Texto bajo el icono. */
  label?: string;
  /** Glifo del icono (24px). Para `icon` y `emphasis`. */
  icon?: ReactNode;
  /** `type="avatar"` — props del `<Avatar>` (el `size` es fijo `xs`). */
  avatarProps?: Omit<AvatarProps, 'size'>;
  /** `type="avatar"` — escape hatch: un nodo propio en vez del `<Avatar>`. */
  avatar?: ReactNode;
  /** Tipo de navitem. Default `icon`. */
  type?: NavigationBarItemType;
  /** Estado activo — lo controla la `NavigationBar`. No aplica a `emphasis`. */
  selected?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * NavigationBarItem — building block interno de `NavigationBar`. Representa una
 * sección navegable (icono + label) o una acción destacada (`emphasis`).
 * Figma: `_building_blocks_navigation_bar_navitem`. No se usa directamente en
 * producto: siempre a través de `NavigationBar`.
 *
 *   type="icon"      icono 24px + label; recolorea a `brand` cuando `selected`
 *   type="avatar"    `<Avatar>` (xs, 24px) + label
 *   type="emphasis"  círculo `bg/brand` con icono `onBrand` + label; sin estado activo
 */
export function NavigationBarItem({
  label,
  icon,
  avatarProps,
  avatar,
  type = 'icon',
  selected = false,
  className,
  ...props
}: NavigationBarItemProps) {
  const isEmphasis = type === 'emphasis';
  return (
    <button
      type="button"
      className={['nav-bar-item', className].filter(Boolean).join(' ')}
      data-type={type}
      data-selected={!isEmphasis && selected ? '' : undefined}
      aria-current={!isEmphasis && selected ? 'page' : undefined}
      {...props}
    >
      <span className="nav-bar-item__icon">
        {type === 'avatar' ? (
          <span className="nav-bar-item__avatar">{avatar ?? <Avatar size="xs" {...avatarProps} />}</span>
        ) : (
          <span className="nav-bar-item__glyph">{icon}</span>
        )}
      </span>
      {label != null && <span className="nav-bar-item__label">{label}</span>}
    </button>
  );
}
