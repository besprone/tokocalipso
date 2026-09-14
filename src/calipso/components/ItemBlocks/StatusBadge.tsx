import { RadioButton, CheckmarkFilled, Close } from '@carbon/icons-react';
import { CircularProgress } from '../CircularProgress/CircularProgress';
import './StatusBadge.css';

export type StatusBadgeStatus = 'pending' | 'processing' | 'completed' | 'failed';

const ICON: Record<Exclude<StatusBadgeStatus, 'processing'>, typeof RadioButton> = {
  pending: RadioButton,
  completed: CheckmarkFilled,
  failed: Close,
};

const DEFAULT_LABEL: Record<StatusBadgeStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Fallido',
};

export type StatusBadgeProps = {
  status?: StatusBadgeStatus;
  'aria-label'?: string;
};

/**
 * StatusBadge — icono de estado de 20×20. Figma:
 * `_building_blocks_statusBadge`, instanciado por `ItemLeading`
 * (`type="statusBadge"`). **Building block interno — no se exporta desde
 * `ItemBlocks/index.ts`.**
 *
 * `processing` no dibuja un spinner propio — instancia el `CircularProgress`
 * (`indeterminate size="xs"`) ya existente en el DS; es el mismo Figma
 * component (`components_circular_indeterminate_progress_indicator`) del
 * que sale ese componente, tokens incluidos (track `bg/subtle` · arco
 * `bg/brand`).
 */
export function StatusBadge({ status = 'pending', 'aria-label': ariaLabel }: StatusBadgeProps) {
  const label = ariaLabel ?? DEFAULT_LABEL[status];

  if (status === 'processing') {
    return (
      <span className="status-badge" data-status={status}>
        <RadioButton aria-hidden="true" />
        <CircularProgress
          indeterminate
          size="xs"
          aria-label={label}
          className="status-badge__spinner"
        />
      </span>
    );
  }

  const Icon = ICON[status];
  return (
    <span className="status-badge" data-status={status} role="img" aria-label={label}>
      <Icon />
    </span>
  );
}
