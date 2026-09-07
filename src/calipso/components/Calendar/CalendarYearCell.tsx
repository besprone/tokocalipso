import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './CalendarYearCell.css';

export type CalendarYearCellType = 'default' | 'selected';

export type CalendarYearCellProps = {
  year: number;
  type?: CalendarYearCellType;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * Building block interno del `Calendar` — una celda de año. Figma:
 * `_building_blocks_calendar_cell_year`. No usar fuera de `Calendar`.
 */
export const CalendarYearCell = forwardRef<HTMLButtonElement, CalendarYearCellProps>(
  function CalendarYearCell({ year, type = 'default', disabled, className, ...props }, ref) {
    return (
      <button
        {...props}
        ref={ref}
        type="button"
        disabled={disabled}
        data-type={type}
        aria-selected={type === 'selected' || undefined}
        className={['calendar-year-cell', className].filter(Boolean).join(' ')}
      >
        <span className="calendar-year-cell__content">
          <span className="calendar-year-cell__label">{year}</span>
        </span>
      </button>
    );
  },
);
