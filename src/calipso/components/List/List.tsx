import { useMemo } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ListContext } from './listContext';
import './List.css';

export type ListType = 'segmented' | 'standard';
export type ListSize = 'sm' | 'md';

export type ListProps = {
  /** `segmented` = agrupados en una tarjeta con divisores; `standard` = filas
   *  planas sin agrupación de contenedor. Default `segmented`. */
  type?: ListType;
  /** Redondea las esquinas del grupo (solo `segmented`). Default `true`. */
  radius?: boolean;
  /** `sm` → filas compactas (layout stacked); `md` → filas con respiro
   *  horizontal (layout horizontal). Default `sm`. */
  size?: ListSize;
  /** `ListItem`s. */
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * List — contenedor vertical que agrupa `ListItem`s. Figma: `components_lists`.
 *
 * El `ListItem` no lleva radio propio: cuando `type="segmented"` y
 * `radius` es `true`, este contenedor recorta (`overflow: clip`) las esquinas
 * de los items al radio del grupo — por eso un item suelto se ve redondeado.
 *
 * `size` determina el `layout` de los items vía contexto (sm → stacked,
 * md → horizontal); cada `ListItem` puede sobreescribirlo con su prop `layout`.
 */
export function List({
  type = 'segmented',
  radius = true,
  size = 'sm',
  className,
  children,
  role,
  ...props
}: ListProps) {
  const ctx = useMemo(
    () => ({ layout: size === 'md' ? ('horizontal' as const) : ('stacked' as const) }),
    [size],
  );

  return (
    <ListContext.Provider value={ctx}>
      <div
        role={role ?? 'list'}
        data-type={type}
        data-size={size}
        data-radius={type === 'segmented' && radius ? '' : undefined}
        className={['list', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    </ListContext.Provider>
  );
}
