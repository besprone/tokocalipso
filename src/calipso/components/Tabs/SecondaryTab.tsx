import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './SecondaryTab.css';

export type SecondaryTabProps = {
  /** Texto de la tab (Body/md-semiemphasized). */
  label?: ReactNode;
  /** Icono opcional (24px), a la izquierda del label. */
  icon?: ReactNode;
  /** Tab activa — recolorea icono + label a `brand`. Lo controla `SecondaryTabs`. */
  selected?: boolean;
  /** Muestra la barra indicadora de ESTA tab (solo para la story del building
   *  block; en `SecondaryTabs` el indicador real es único y vive en el contenedor). */
  showIndicator?: boolean;
  disabled?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * SecondaryTab — unidad individual de `SecondaryTabs`. Figma:
 * `_building_blocks_secondary_tab`. Más ligera que `PrimaryTab`: su indicador
 * es una línea fina **full-width**. `<button role="tab">` de 48px. No se usa
 * suelto en producto: siempre vía `SecondaryTabs`.
 */
export const SecondaryTab = forwardRef<HTMLButtonElement, SecondaryTabProps>(function SecondaryTab(
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
      className={['secondary-tab', className].filter(Boolean).join(' ')}
      data-selected={selected ? '' : undefined}
      {...props}
    >
      <span className="secondary-tab__inner">
        {icon != null && <span className="secondary-tab__icon">{icon}</span>}
        {label != null && <span className="secondary-tab__label">{label}</span>}
      </span>
      {showIndicator && selected && <span className="secondary-tab__indicator" aria-hidden="true" />}
    </button>
  );
});
