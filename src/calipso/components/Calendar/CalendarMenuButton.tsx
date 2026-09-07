import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import './CalendarMenuButton.css';

export type CalendarMenuButtonProps = {
  label: string;
  /** Vista de año abierta → el chevron apunta hacia arriba. */
  expanded?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * Building block interno del `Calendar` — botón que alterna la vista día/año.
 * Figma: `_building_blocks_menu_button`. No es un dropdown genérico ni un botón
 * primario; vive solo dentro del calendario.
 */
export const CalendarMenuButton = forwardRef<HTMLButtonElement, CalendarMenuButtonProps>(
  function CalendarMenuButton({ label, expanded = false, disabled, className, ...props }, ref) {
    return (
      <button
        {...props}
        ref={ref}
        type="button"
        disabled={disabled}
        aria-expanded={expanded}
        data-expanded={expanded || undefined}
        className={['calendar-menu-button', className].filter(Boolean).join(' ')}
      >
        <span className="calendar-menu-button__content">
          <span className="calendar-menu-button__label">{label}</span>
          <span className="calendar-menu-button__chevron" aria-hidden="true">
            <ChevronDown size={20} />
          </span>
        </span>
      </button>
    );
  },
);
