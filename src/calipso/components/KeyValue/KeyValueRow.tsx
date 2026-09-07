import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './KeyValueRow.css';

export type KeyValueRowBackground = 'surface' | 'canvas';

export type KeyValueRowProps = {
  /** Default `surface`. */
  background?: KeyValueRowBackground;
  /** Slot al final de la fila — icono o `Badge`. No confundir con el `trailing` de `KeyValueValue`. */
  trailing?: ReactNode;
  /** Un `KeyValueKey` y un `KeyValueValue`. */
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

/**
 * KeyValueRow — fila de un `KeyValue`: una `KeyValueKey` y una `KeyValueValue`
 * alineadas horizontalmente. Figma: `_building_blocks_key_value_row`.
 */
export const KeyValueRow = forwardRef<HTMLDivElement, KeyValueRowProps>(function KeyValueRow(
  { background = 'surface', trailing, children, className, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={['key-value-row', className].filter(Boolean).join(' ')}
      data-background={background}
    >
      <div className="key-value-row__content">{children}</div>
      {trailing != null && <div className="key-value-row__trailing">{trailing}</div>}
    </div>
  );
});
