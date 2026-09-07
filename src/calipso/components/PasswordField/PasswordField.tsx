import { useId, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { View, ViewOff, WarningFilled } from '@carbon/icons-react';
import { IconButton } from '../IconButton/IconButton';
import { PasswordDots } from './PasswordDots';
import './PasswordField.css';

export type PasswordFieldProps = {
  label: string;
  helperText?: string;
  error?: boolean;
  /** Muestra el toggle mostrar/ocultar. Default true. En `error` se sustituye
   *  por el ícono de advertencia. */
  showToggle?: boolean;
  /** Visibilidad controlada del valor. */
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Campo especializado para contraseñas. Extiende la estructura de `TextField`
 * (label flotante, helper, estados) y agrega toggle de visibilidad y
 * representación protegida del valor (`PasswordDots`) cuando está oculto.
 */
export function PasswordField({
  label,
  helperText,
  error = false,
  showToggle = true,
  visible: visibleProp,
  defaultVisible = false,
  onVisibilityChange,
  id: idProp,
  className,
  disabled,
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  ...props
}: PasswordFieldProps) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  const [focused, setFocused] = useState(false);

  const isVisibleControlled = visibleProp != null;
  const [visibleInternal, setVisibleInternal] = useState(defaultVisible);
  const visible = isVisibleControlled ? visibleProp : visibleInternal;

  const isValueControlled = value != null;
  const [valueInternal, setValueInternal] = useState(String(defaultValue ?? ''));
  const currentValue = isValueControlled ? String(value) : valueInternal;
  const hasValue = currentValue.length > 0;

  const floated = focused || hasValue || Boolean(placeholder);

  function toggleVisible() {
    const next = !visible;
    if (!isVisibleControlled) setVisibleInternal(next);
    onVisibilityChange?.(next);
    inputRef.current?.focus();
  }

  return (
    <div
      className={['password-field', className].filter(Boolean).join(' ')}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
      data-hidden={!visible || undefined}
    >
      <div
        className="password-field__container"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="password-field__state">
          <div className="password-field__field" data-floated={floated || undefined}>
            <label htmlFor={inputId} className="password-field__label">
              {label}
            </label>

            <div className="password-field__value">
              <input
                {...props}
                ref={inputRef}
                id={inputId}
                type={visible ? 'text' : 'password'}
                disabled={disabled}
                placeholder={floated ? placeholder : ' '}
                value={currentValue}
                aria-invalid={error || undefined}
                className="password-field__input"
                onChange={(e) => {
                  if (!isValueControlled) setValueInternal(e.target.value);
                  onChange?.(e);
                }}
                onFocus={(e) => {
                  setFocused(true);
                  onFocus?.(e);
                }}
                onBlur={(e) => {
                  setFocused(false);
                  onBlur?.(e);
                }}
              />

              {!visible && hasValue && (
                <PasswordDots
                  count={currentValue.length}
                  className="password-field__dots"
                />
              )}
            </div>
          </div>

          <span className="password-field__trailing">
            {error ? (
              <span className="password-field__trailing-icon" aria-hidden="true">
                <WarningFilled />
              </span>
            ) : showToggle ? (
              <IconButton
                emphasis="ghost"
                size="lg"
                icon={visible ? <View /> : <ViewOff />}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={visible}
                onClick={toggleVisible}
                disabled={disabled}
                tabIndex={-1}
              />
            ) : null}
          </span>
        </div>
      </div>

      {helperText && <span className="password-field__helper">{helperText}</span>}
    </div>
  );
}
