import { forwardRef, useEffect, useRef, useState } from 'react';
import type { InputHTMLAttributes, MutableRefObject } from 'react';
import {
  Checkbox as IcUnselected,
  CheckboxCheckedFilled,
  CheckboxIndeterminateFilled,
} from '@carbon/icons-react';
import './Checkbox.css';

export type CheckboxProps = {
  /** Selección parcial (ej. "Seleccionar todo" con items sueltos). Solo cuando
   *  hay significado real de selección parcial. */
  indeterminate?: boolean;
  /** Variante de error (Figma: solo aplica a `unselected`). El manejo del
   *  mensaje vive en el patrón de formulario. */
  error?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Control de selección binaria, sin label (el label es un patrón aparte:
 * checkbox + label). Figma: `components_checkbox`.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    indeterminate = false,
    error = false,
    checked,
    defaultChecked,
    disabled,
    className,
    onChange,
    ...props
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);

  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as MutableRefObject<HTMLInputElement | null>).current = node;
  };

  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isChecked = isControlled ? !!checked : internalChecked;

  // `indeterminate` no es un atributo — se refleja en la propiedad del DOM.
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const Icon = indeterminate
    ? CheckboxIndeterminateFilled
    : isChecked
      ? CheckboxCheckedFilled
      : IcUnselected;

  return (
    <span
      className={['checkbox', className].filter(Boolean).join(' ')}
      data-checked={(isChecked && !indeterminate) || undefined}
      data-indeterminate={indeterminate || undefined}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
    >
      <input
        {...props}
        ref={setRefs}
        type="checkbox"
        className="checkbox__input"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        aria-checked={indeterminate ? 'mixed' : undefined}
        onChange={(e) => {
          if (!isControlled) setInternalChecked(e.target.checked);
          onChange?.(e);
        }}
      />
      <span className="checkbox__box" aria-hidden="true">
        <span className="checkbox__content">
          <Icon size={24} />
        </span>
      </span>
    </span>
  );
});
