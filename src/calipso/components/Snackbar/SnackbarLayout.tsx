import type { ReactNode } from 'react';
import './SnackbarLayout.css';

export type SnackbarLayoutProps = {
  /** Texto de soporte (`text/primary`, Body/md-semiemphasized). */
  message: ReactNode;
  /** Slot de acciones — normalmente `<SnackbarActions />`. */
  actions?: ReactNode;
};

/**
 * Building block interno del `Snackbar` (`_building_blocks_snackbar_layout`).
 * **No usar fuera de `Snackbar`.** Coloca el mensaje y las acciones: en una
 * línea van en fila; si el mensaje ocupa varias, las acciones bajan a su propia
 * fila alineadas a la derecha. La altura se adapta al contenido; el radius y el
 * color contextual los define el contenedor.
 */
export function SnackbarLayout({ message, actions }: SnackbarLayoutProps) {
  return (
    <div className="snackbar-layout">
      <p className="snackbar-layout__message">{message}</p>
      {actions != null && <div className="snackbar-layout__actions">{actions}</div>}
    </div>
  );
}
