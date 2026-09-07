import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './KeyValueKey.css';

export type KeyValueKeyColor = 'default' | 'accent';

export type KeyValueKeyProps = {
  /** `Body/md` (14/20) → `Headline/xs` (22/30) en negrita, mismo color. Default `false`. */
  emphasis?: boolean;
  /** `false` (def.) → una línea con ellipsis · `true` → hace wrap (varias líneas). */
  multiline?: boolean;
  /** Default `default`. */
  color?: KeyValueKeyColor;
  /** Icono contextual al inicio (20px). */
  icon?: ReactNode;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'color'>;

/**
 * KeyValueKey — etiqueta descriptiva dentro de un `KeyValueRow`. Figma:
 * `_building_blocks_key`. Usar como descriptor, no como encabezado principal.
 */
export const KeyValueKey = forwardRef<HTMLDivElement, KeyValueKeyProps>(function KeyValueKey(
  { emphasis = false, multiline = false, color = 'default', icon, children, className, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={['key-value-key', className].filter(Boolean).join(' ')}
      data-emphasis={emphasis || undefined}
      data-multiline={multiline || undefined}
      data-color={color}
    >
      <p className="key-value-key__text">{children}</p>
      {icon != null && <span className="key-value-key__icon">{icon}</span>}
    </div>
  );
});
