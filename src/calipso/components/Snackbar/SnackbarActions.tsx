import { Close } from '@carbon/icons-react';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import './SnackbarActions.css';

export type SnackbarAction = {
  label: string;
  onClick: () => void;
};

export type SnackbarActionsProps = {
  /** Botón de acción secundaria (nunca primario). */
  action?: SnackbarAction;
  /** Si se pasa, muestra el ícono de cerrar. */
  onClose?: () => void;
  /** aria-label del botón de cerrar. */
  closeLabel?: string;
};

/**
 * Building block interno del `Snackbar` (`_building_blocks_snackbar_actions`).
 * **No usar fuera de `Snackbar`.** El botón de acción es siempre `ghost` (nunca
 * primario); el ícono de cerrar no cambia de color por pantalla.
 *
 * `type` = `all` (acción + cerrar) · `action` · `close` — se deriva de qué props
 * se pasan.
 */
export function SnackbarActions({ action, onClose, closeLabel = 'Cerrar' }: SnackbarActionsProps) {
  if (!action && !onClose) return null;
  const type = action && onClose ? 'all' : action ? 'action' : 'close';

  return (
    <div className="snackbar-actions" data-type={type}>
      {action && (
        <Button emphasis="ghost" size="xs" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {onClose && (
        <IconButton
          emphasis="ghost"
          size="md"
          icon={<Close size={20} />}
          aria-label={closeLabel}
          onClick={onClose}
        />
      )}
    </div>
  );
}
