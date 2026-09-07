import { useId, useRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Search, Close } from '@carbon/icons-react';
import { IconButton } from '../IconButton/IconButton';
import './SearchField.css';

export type SearchFieldVariant = 'appbar' | 'inContainer';

export type SearchFieldProps = {
  /**
   * Eje `type` de Figma.
   *  - `appbar`      → sin ícono leading; el app bar ya da el contexto de búsqueda.
   *  - `inContainer` → con ícono de lupa leading, para superficies densas.
   */
  variant?: SearchFieldVariant;
  /** Etiqueta accesible fija (no visible). Ej: "Buscar inversiones". */
  'aria-label': string;
  /**
   * Handler del botón de limpiar (×). Cuando se define, el botón aparece
   * dentro del campo y se oculta solo mientras el input está vacío.
   */
  onClear?: () => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export function SearchField({
  variant = 'appbar',
  onClear,
  id: idProp,
  className,
  disabled,
  placeholder = 'Buscar',
  ...props
}: SearchFieldProps) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={['search-field', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-disabled={disabled || undefined}
    >
      {/* click en cualquier parte del container → foca el input */}
      <div
        className="search-field__container"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="search-field__state">
          {variant === 'inContainer' && (
            <span className="search-field__icon" aria-hidden="true">
              <Search />
            </span>
          )}

          <input
            {...props}
            ref={inputRef}
            id={inputId}
            type="search"
            disabled={disabled}
            placeholder={placeholder}
            className="search-field__input"
          />

          {onClear && (
            <span className="search-field__clear">
              <IconButton
                emphasis="ghost"
                size="md"
                icon={<Close />}
                aria-label="Limpiar búsqueda"
                disabled={disabled}
                tabIndex={-1}
                onClick={() => {
                  onClear();
                  inputRef.current?.focus();
                }}
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
