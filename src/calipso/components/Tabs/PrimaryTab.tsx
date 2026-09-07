import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './PrimaryTab.css';

export type PrimaryTabProps = {
  /** Texto de la tab (Body/md-semiemphasized). */
  label?: ReactNode;
  /** Icono opcional (24px), a la izquierda del label. */
  icon?: ReactNode;
  /** Tab activa — recolorea icono + label a `brand`. Lo controla `PrimaryTabs`. */
  selected?: boolean;
  /** Muestra la barra indicadora de ESTA tab. Solo para la story del building
   *  block; en `PrimaryTabs` el indicador real es único y vive en el contenedor. */
  showIndicator?: boolean;
  disabled?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * PrimaryTab — unidad individual de `PrimaryTabs`. Figma:
 * `_building_blocks_primary_tab`. `<button role="tab">` de 48px con icono +
 * label centrados. No se usa suelto en producto: siempre vía `PrimaryTabs`.
 */
export const PrimaryTab = forwardRef<HTMLButtonElement, PrimaryTabProps>(function PrimaryTab(
  { label, icon, selected = false, showIndicator = false, disabled = false, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      className={['primary-tab', className].filter(Boolean).join(' ')}
      data-selected={selected ? '' : undefined}
      {...props}
    >
      <span className="primary-tab__inner">
        {icon != null && <span className="primary-tab__icon">{icon}</span>}
        {label != null && <span className="primary-tab__label">{label}</span>}
      </span>
      {showIndicator && selected && <span className="primary-tab__indicator" aria-hidden="true" />}
    </button>
  );
});
