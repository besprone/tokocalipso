import { useId, useRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Close, WarningFilled } from '@carbon/icons-react';
import { IconButton } from '../IconButton/IconButton';
import './TextField.css';

export type TextFieldProps = {
  label: string;
  helperText?: string;
  error?: boolean;
  showTrailing?: boolean;
  onClear?: () => void;
  /**
   * Reemplaza el trailing por defecto (limpiar / warning) con un ícono
   * estático propio — p. ej. el chevron de un `Select`. Tiene prioridad
   * sobre `error`/`onClear` cuando se pasa.
   */
  trailingIcon?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export function TextField({
  label,
  helperText,
  error = false,
  showTrailing = false,
  onClear,
  trailingIcon,
  id: idProp,
  className,
  disabled,
  placeholder = ' ',
  ...props
}: TextFieldProps) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={['text-field', className].filter(Boolean).join(' ')}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
    >
      {/* onClick en el container → cualquier click dentro foca el input */}
      <div
        className="text-field__container"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-field__state">
          <div className="text-field__content">
            {/* label semántico: for/id para accesibilidad */}
            <label htmlFor={inputId} className="text-field__label">
              {label}
            </label>
            <input
              {...props}
              ref={inputRef}
              id={inputId}
              disabled={disabled}
              placeholder={placeholder}
              className="text-field__input"
            />
          </div>

          {showTrailing && (
            <span className="text-field__trailing">
              {trailingIcon ? (
                <span className="text-field__trailing-icon" aria-hidden="true">
                  {trailingIcon}
                </span>
              ) : error ? (
                <span className="text-field__trailing-icon text-field__trailing-icon--danger" aria-hidden="true">
                  <WarningFilled />
                </span>
              ) : (
                <IconButton
                  emphasis="ghost"
                  size="lg"
                  icon={<Close />}
                  aria-label="Limpiar"
                  onClick={onClear}
                  disabled={disabled}
                />
              )}
            </span>
          )}
        </div>
      </div>

      {helperText && (
        <span className="text-field__helper">{helperText}</span>
      )}
    </div>
  );
}
