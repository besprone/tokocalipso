import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { CircularProgress } from '../CircularProgress/CircularProgress';
import type { CircularProgressSize } from '../CircularProgress/CircularProgress';
import './IconButton.css';

export type IconButtonEmphasis = 'primary' | 'secondary' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonScheme = 'brand' | 'neutral';

// Mapeo de tamaño del botón al tamaño del spinner (según Figma)
const spinnerSize: Record<IconButtonSize, CircularProgressSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

export type IconButtonProps = {
  icon: ReactNode;
  emphasis?: IconButtonEmphasis;
  size?: IconButtonSize;
  /** Paleta de color: `brand` (def., verde) · `neutral` (escala de grises). */
  scheme?: IconButtonScheme;
  isLoading?: boolean;
  'aria-label': string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function IconButton({
  icon,
  emphasis = 'primary',
  size = 'sm',
  scheme = 'brand',
  isLoading = false,
  disabled,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      data-emphasis={emphasis}
      data-size={size}
      data-scheme={scheme}
      data-loading={isLoading || undefined}
      className={['icon-button', className].filter(Boolean).join(' ')}
    >
      <span className="icon-button__btn">
        <span className="icon-button__state">
          {isLoading ? (
            <CircularProgress indeterminate size={spinnerSize[size]} aria-label="Cargando" />
          ) : (
            icon
          )}
        </span>
      </span>
    </button>
  );
}
