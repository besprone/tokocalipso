import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Switch.css';

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'>;

/**
 * Control binario on/off que aplica el cambio al instante (sin confirmación).
 * Figma: `components_switch`. Siempre debe acompañarse de un label (patrón
 * label + switch, con el switch a la derecha del row).
 *
 * El estado visible se deriva del propio `<input type="checkbox" role="switch">`
 * vía CSS (`:has(:checked)`), así que funciona igual controlado o no controlado.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, disabled, ...props },
  ref,
) {
  return (
    <span className={['switch', className].filter(Boolean).join(' ')}>
      <input
        {...props}
        ref={ref}
        type="checkbox"
        role="switch"
        disabled={disabled}
        className="switch__input"
      />
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb">
          <span className="switch__state-layer" />
        </span>
      </span>
    </span>
  );
});
