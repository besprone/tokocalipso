import { useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { FilterChip } from '../FilterChip/FilterChip';
import './ChipGroup.css';

export type ChipGroupOption = {
  value: string;
  label: ReactNode;
  leading?: ReactNode;
  disabled?: boolean;
};

export type ChipGroupProps = {
  options: ChipGroupOption[];
  /** Valor seleccionado (controlado). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Deshabilita todo el grupo. */
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
};

/**
 * Grupo de `FilterChip` en una sola fila, **single-select**: siempre hay
 * exactamente 1 chip seleccionado, sin toggle-off. Figma: `components_chip_group`.
 * Navegación por teclado tipo radio group (flechas ← →).
 */
export function ChipGroup({
  options,
  value,
  defaultValue,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: ChipGroupProps) {
  const isControlled = value !== undefined;
  const firstEnabled = options.find((o) => !o.disabled)?.value ?? options[0]?.value;
  const [internal, setInternal] = useState<string>(defaultValue ?? firstEnabled);
  const selected = isControlled ? value : internal;

  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // fuente de verdad síncrona para que ráfagas de flechas no lean estado obsoleto
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  function select(next: string) {
    if (next === selectedRef.current) return;
    selectedRef.current = next;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const enabled = options.map((o, i) => ({ o, i })).filter(({ o }) => !o.disabled);
    const pos = enabled.findIndex(({ o }) => o.value === selectedRef.current);
    const nextEntry = enabled[(pos + dir + enabled.length) % enabled.length];
    if (!nextEntry) return;
    select(nextEntry.o.value);
    chipRefs.current[nextEntry.i]?.focus();
  }

  return (
    <div
      className={['chip-group', className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
    >
      {options.map((opt, i) => {
        const isSelected = opt.value === selected;
        return (
          <FilterChip
            key={opt.value}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            role="radio"
            aria-checked={isSelected}
            aria-pressed={undefined}
            selected={isSelected}
            leading={opt.leading}
            disabled={disabled || opt.disabled}
            tabIndex={isSelected || (!options.some((o) => o.value === selected) && i === 0) ? 0 : -1}
            onClick={() => select(opt.value)}
          >
            {opt.label}
          </FilterChip>
        );
      })}
    </div>
  );
}
