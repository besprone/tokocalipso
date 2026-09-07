import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { RadioButton, RadioButtonChecked } from '@carbon/icons-react';
import './Radio.css';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Control de selección única dentro de un grupo (mismo `name`). Sin label —
 * el label es un patrón aparte (radio + label). Figma: `components_radiobutton`.
 *
 * El estado visible lo maneja el propio `<input type="radio">` vía CSS
 * (`:has(:checked)`), así que funciona igual controlado o no controlado — al
 * seleccionar uno, los hermanos del grupo se deseleccionan solos.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, disabled, ...props },
  ref,
) {
  return (
    <span className={['radio', className].filter(Boolean).join(' ')}>
      <input
        {...props}
        ref={ref}
        type="radio"
        disabled={disabled}
        className="radio__input"
      />
      <span className="radio__box" aria-hidden="true">
        <span className="radio__content">
          <span className="radio__icon radio__icon--off">
            <RadioButton size={24} />
          </span>
          <span className="radio__icon radio__icon--on">
            <RadioButtonChecked size={24} />
          </span>
        </span>
      </span>
    </span>
  );
});
