import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './OtpDigit.css';

export type OtpDigitSize = 'sm' | 'md';

/** Estados visuales del building block (Figma: `_buildingblocks_otp_input`). */
export type OtpDigitState =
  | 'enabled'
  | 'hovered'
  | 'focused'
  | 'pressed'
  | 'disabled'
  | 'error';

export type OtpDigitProps = {
  size?: OtpDigitSize;
  /**
   * Fuerza el estado visual. Solo para documentación / stories — en uso real
   * `hovered` / `focused` / `pressed` salen de la interacción (`:hover` etc.).
   */
  state?: OtpDigitState;
  error?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

/**
 * Building block: un cuadro = un dígito. No se usa aislado — lo instancia
 * `OtpInput`, que orquesta navegación, borrado, paste y validación.
 */
export const OtpDigit = forwardRef<HTMLInputElement, OtpDigitProps>(
  function OtpDigit({ size = 'md', state, error = false, disabled, className, ...props }, ref) {
    return (
      <div
        className={['otp-digit', className].filter(Boolean).join(' ')}
        data-size={size}
        data-state={state}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
      >
        <div className="otp-digit__state">
          <input
            {...props}
            ref={ref}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            disabled={disabled}
            className="otp-digit__input"
          />
        </div>
      </div>
    );
  },
);
