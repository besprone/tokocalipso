import type { HTMLAttributes, ReactNode } from 'react';
import './Menu.css';

export type MenuProps = {
  /** `MenuItem`s. La cantidad es dinámica; el alto se adapta. */
  children: ReactNode;
  /** Nombre accesible del `role="menu"`. */
  'aria-label'?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * Menu — contenedor vertical que agrupa `MenuItem`s navegables o accionables.
 * Figma: `components_menu`. Para opciones contextuales en sidebars, paneles de
 * cuenta o menús desplegables.
 *
 * Solo agrupa: gap de 2px, `bg/surface`, radio 16, `overflow: clip`. El estado
 * y la selección viven en cada `MenuItem` (solo uno `selected` a la vez). No es
 * sustituto de `List` cuando el contenido es selección de datos. Sin sombra
 * propia (`elevation: flat`) — montarlo sobre una superficie que aporte
 * elevación/separación.
 */
export function Menu({ children, className, role, ...props }: MenuProps) {
  return (
    <div role={role ?? 'menu'} className={['menu', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}
