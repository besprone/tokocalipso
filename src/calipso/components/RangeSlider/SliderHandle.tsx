import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './SliderHandle.css';

export type SliderHandleProps = {
  /** Feedback de interacción — activa la capa de estado. Transitorio. */
  pressed?: boolean;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Building block interno de `RangeSlider` — el knob arrastrable. Figma:
 * `_building_blocks_slider_handle`. `area` define el hit target (48px), `knob`
 * es solo el círculo visual (20px). No usar fuera de `RangeSlider`.
 */
export const SliderHandle = forwardRef<HTMLDivElement, SliderHandleProps>(
  function SliderHandle({ pressed = false, className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-pressed={pressed || undefined}
        className={['slider-handle', className].filter(Boolean).join(' ')}
      >
        <span className="slider-handle__area">
          <span className="slider-handle__knob" />
        </span>
      </div>
    );
  },
);
