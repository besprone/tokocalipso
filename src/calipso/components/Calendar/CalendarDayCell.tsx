import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './CalendarDayCell.css';

export type CalendarDayCellSize = 'sm' | 'xs';
export type CalendarDayCellType = 'default' | 'today' | 'selected';

export type CalendarDayCellProps = {
  /** Número de día a mostrar. */
  day: number;
  size?: CalendarDayCellSize;
  /** `today` = día actual (outline brand); `selected` = elegido (relleno brand). */
  type?: CalendarDayCellType;
  /** Día de otro mes visible en el grid — atenuado, pero navegable. */
  outside?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * Building block interno del `Calendar` — una celda de día. Figma:
 * `_building_blocks_calendar_cell_day`. No usar fuera de `Calendar`.
 */
export const CalendarDayCell = forwardRef<HTMLButtonElement, CalendarDayCellProps>(
  function CalendarDayCell(
    { day, size = 'sm', type = 'default', outside = false, disabled, className, ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type="button"
        disabled={disabled}
        data-size={size}
        data-type={type}
        data-outside={outside || undefined}
        aria-current={type === 'today' ? 'date' : undefined}
        aria-selected={type === 'selected' || undefined}
        className={['calendar-day-cell', className].filter(Boolean).join(' ')}
      >
        <span className="calendar-day-cell__content">
          <span className="calendar-day-cell__label">{day}</span>
        </span>
      </button>
    );
  },
);
