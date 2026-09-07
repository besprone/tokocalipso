import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './FilterChip.css';

export type FilterChipProps = {
  /** Estado activo del filtro. Persistente, no transitorio. */
  selected?: boolean;
  /** Ícono leading opcional (20px). */
  leading?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * Chip de filtro: activa/desactiva una opción. Figma: `components_filter_chip`.
 *
 * El chip **no gestiona exclusividad** — el patrón que lo contenga define el
 * comportamiento de grupo (multi-select o exclusivo). Para single-select usar
 * `ChipGroup`. Por defecto expone `aria-pressed`; `ChipGroup` lo sustituye por
 * `role="radio"` + `aria-checked` vía props.
 */
export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
  function FilterChip({ selected = false, leading, disabled, className, children, ...props }, ref) {
    return (
      <button
        aria-pressed={selected}
        {...props}
        ref={ref}
        type="button"
        disabled={disabled}
        data-selected={selected || undefined}
        className={['filter-chip', className].filter(Boolean).join(' ')}
      >
        <span className="filter-chip__content">
          {leading != null && (
            <span className="filter-chip__leading" aria-hidden="true">
              {leading}
            </span>
          )}
          <span className="filter-chip__label">{children}</span>
        </span>
      </button>
    );
  },
);
