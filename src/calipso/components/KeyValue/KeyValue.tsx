import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './KeyValue.css';

export type KeyValueElevation = 0 | 2;

export type KeyValueProps = {
  /** Separa las filas con `space-25` (2px). `false` → sin separación. Default `true`. */
  divider?: boolean;
  /** Nivel de elevación del contenedor. Default `0`. */
  elevation?: KeyValueElevation;
  /** `KeyValueRow` (múltiples). */
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

/**
 * KeyValue — agrupa múltiples `KeyValueRow` en formato key–value. Figma:
 * `components_key_value_group`.
 *
 * Para presentar datos financieros o atributos relevantes de forma clara,
 * alineada y jerárquica. Usar cuando hay información estructurada y
 * comparable con múltiples atributos relacionados. **No** usar para
 * interacción compleja por fila ni contenido narrativo — todas las filas
 * deben respetar el mismo tamaño tipográfico.
 */
export const KeyValue = forwardRef<HTMLDivElement, KeyValueProps>(function KeyValue(
  { divider = true, elevation = 0, children, className, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={['key-value', className].filter(Boolean).join(' ')}
      data-divider={divider || undefined}
      data-elevation={elevation}
    >
      {children}
    </div>
  );
});
