import type { HTMLAttributes } from 'react';
import './PasswordDots.css';

export type PasswordDotsProps = {
  /** Nº de dots (normalmente = longitud del valor). */
  count?: number;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Building block: representación protegida del valor. Figma:
 * `_building_blocks_password_dots`. Una fila de dots circulares, uno por
 * carácter. Lo usa `PasswordField` cuando `visibility = hidden`.
 */
export function PasswordDots({ count = 8, className, ...props }: PasswordDotsProps) {
  const n = Math.max(0, Math.floor(count));
  return (
    <div
      {...props}
      className={['password-dots', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="password-dots__dot" />
      ))}
    </div>
  );
}
