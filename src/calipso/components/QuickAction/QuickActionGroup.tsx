import type { HTMLAttributes, ReactNode } from 'react';
import type { QuickActionScheme, QuickActionSize } from './QuickAction';
import { QuickActionContext } from './quickActionContext';
import './QuickActionGroup.css';

export type QuickActionGroupProps = {
  /** `QuickAction` (idealmente 3–4 — más de 4 satura la interfaz). */
  children: ReactNode;
  /** Se publica a las `QuickAction` hijas — un hijo con su propio `size` lo sobreescribe. */
  size?: QuickActionSize;
  /** Se publica a las `QuickAction` hijas — un hijo con su propio `scheme` lo sobreescribe. */
  scheme?: QuickActionScheme;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * QuickActionGroup — agrupa varias `QuickAction` en una fila balanceada.
 * Figma: `patterns_quick_actions_group`.
 *
 * Solo organiza layout y jerarquía — no redefine el diseño individual de
 * cada `QuickAction`. Cada hijo ocupa el mismo ancho disponible; el grupo
 * se adapta al ancho del contenedor.
 */
export function QuickActionGroup({ children, size, scheme, className, ...props }: QuickActionGroupProps) {
  return (
    <QuickActionContext.Provider value={{ size, scheme }}>
      <div {...props} className={['quick-action-group', className].filter(Boolean).join(' ')}>
        {children}
      </div>
    </QuickActionContext.Provider>
  );
}
