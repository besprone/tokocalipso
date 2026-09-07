import type { HTMLAttributes, ReactNode } from 'react';
import './SliderHandleIndicator.css';

export type SliderHandleIndicatorProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Building block interno de `RangeSlider` — burbuja que muestra el valor actual
 * del handle durante la interacción. Figma:
 * `_building_blocks_slider_handle_indicator`. No usar como badge suelto ni fuera
 * de `RangeSlider`.
 */
export function SliderHandleIndicator({ children, className, ...props }: SliderHandleIndicatorProps) {
  return (
    <div
      {...props}
      className={['slider-handle-indicator', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
