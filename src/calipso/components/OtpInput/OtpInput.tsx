import { useReducer, useRef } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { OtpDigit } from './OtpDigit';
import type { OtpDigitSize } from './OtpDigit';
import './OtpInput.css';

export type OtpInputProps = {
  /** Nº de dígitos. Default 6. */
  length?: number;
  size?: OtpDigitSize;
  /** Valor controlado (string de dígitos, se rellena de izquierda a derecha). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Se dispara cuando todos los dígitos están llenos. */
  onComplete?: (value: string) => void;
  /** Validación fallida — aplica el estado error a TODOS los cuadros. */
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** aria-label del grupo. Default "Código de verificación". */
  'aria-label'?: string;
  /** Emite un input hidden con el valor concatenado para envíos de formulario. */
  name?: string;
  className?: string;
};

const DIGIT = /\d/g;

function toArray(v: string, length: number): string[] {
  const digits = (v.match(DIGIT) ?? []).slice(0, length);
  return Array.from({ length }, (_, i) => digits[i] ?? '');
}

/**
 * Orquestador del patrón OTP (Figma: `components_otp_input` / `pattern_otp`).
 * Instancia N `OtpDigit` y maneja: auto-avance, backspace hacia atrás, flechas,
 * paste del código completo y validación al llenarse. El estado `error` se
 * aplica a todos los cuadros a la vez.
 *
 * La fuente de verdad vive en una ref (`digitsRef`) para que ráfagas de tecleo
 * y el paste no operen sobre un estado obsoleto (stale closure).
 */
export function OtpInput({
  length = 6,
  size = 'md',
  value: valueProp,
  defaultValue = '',
  onChange,
  onComplete,
  error = false,
  disabled = false,
  autoFocus = false,
  'aria-label': ariaLabel = 'Código de verificación',
  name,
  className,
}: OtpInputProps) {
  const isControlled = valueProp != null;
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const digitsRef = useRef<string[]>(toArray(isControlled ? valueProp : defaultValue, length));

  // resync si cambia length o si el padre empuja un value distinto
  const external = toArray(isControlled ? valueProp : digitsRef.current.join(''), length);
  if (external.length !== digitsRef.current.length || (isControlled && external.join('') !== digitsRef.current.join(''))) {
    digitsRef.current = external;
  }
  const chars = digitsRef.current;

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function setDigits(next: string[]) {
    digitsRef.current = next;
    if (!isControlled) rerender();
    const str = next.join('');
    onChange?.(str);
    if (next.every((c) => c !== '')) onComplete?.(str);
  }

  function focusAt(index: number) {
    const i = Math.max(0, Math.min(length - 1, index));
    const el = inputsRef.current[i];
    el?.focus();
    el?.select();
  }

  function handleChange(index: number, raw: string) {
    const digit = (raw.match(DIGIT) ?? []).pop() ?? '';
    const next = [...digitsRef.current];
    next[index] = digit; // '' si escribieron algo no numérico → limpia el cuadro
    setDigits(next);
    if (digit && index < length - 1) focusAt(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    const next = [...digitsRef.current];
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (next[index]) {
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = '';
        setDigits(next);
        focusAt(index - 1);
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      next[index] = '';
      setDigits(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(index + 1);
    }
  }

  function handlePaste(index: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text').match(DIGIT) ?? []).join('');
    if (!pasted) return;
    const next = [...digitsRef.current];
    for (let i = 0; i < pasted.length && index + i < length; i++) {
      next[index + i] = pasted[i];
    }
    setDigits(next);
    focusAt(index + pasted.length);
  }

  return (
    <div
      className={['otp-input', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
      data-disabled={disabled || undefined}
    >
      {name && <input type="hidden" name={name} value={chars.join('')} readOnly />}
      {chars.map((char, i) => (
        <OtpDigit
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          size={size}
          error={error}
          disabled={disabled}
          value={char}
          autoFocus={autoFocus && i === 0}
          aria-label={`Dígito ${i + 1} de ${length}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
