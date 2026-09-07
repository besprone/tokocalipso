import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { SliderHandle } from './SliderHandle';
import { SliderHandleIndicator } from './SliderHandleIndicator';
import './RangeSlider.css';

type CommonProps = {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Burbuja de valor: `true` = durante drag/focus · `'always'` = siempre · `false` = nunca. */
  showIndicator?: boolean | 'always';
  /** Formatea el valor para la burbuja y el `aria-valuetext`. */
  formatValue?: (value: number) => string;
  className?: string;
  'aria-label'?: string;
};

export type RangeSliderStandardProps = CommonProps & {
  type?: 'standard';
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
};

export type RangeSliderCenteredProps = CommonProps & {
  type: 'centered';
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
};

export type RangeSliderProps = RangeSliderStandardProps | RangeSliderCenteredProps;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Slider de valor único (`standard`) o de rango (`centered`). Figma:
 * `components_range_slider`. Compone los building blocks internos `SliderHandle`
 * y `SliderHandleIndicator`. Pointer drag + teclado (flechas, Home/End, PageUp/Down).
 */
export function RangeSlider(props: RangeSliderProps) {
  const {
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    showIndicator = true,
    formatValue = (v) => String(v),
    className,
    'aria-label': ariaLabel,
  } = props;
  const isCentered = (props.type ?? 'standard') === 'centered';
  const isControlled = props.value !== undefined;

  const toArray = useCallback(
    (v: number | [number, number] | undefined): number[] => {
      if (v === undefined) return isCentered ? [min, max] : [min];
      return Array.isArray(v) ? [v[0], v[1]] : [v];
    },
    [isCentered, min, max],
  );

  const [internal, setInternal] = useState<number[]>(() =>
    toArray(isControlled ? props.value : props.defaultValue),
  );
  const values = isControlled ? toArray(props.value) : internal;

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const snap = (raw: number) => {
    const s = Math.round((raw - min) / step) * step + min;
    return clamp(Number(s.toFixed(10)), min, max);
  };

  const commit = useCallback(
    (next: number[]) => {
      if (!isControlled) setInternal(next);
      if (isCentered) {
        (props.onChange as ((v: [number, number]) => void) | undefined)?.([next[0], next[1]]);
      } else {
        (props.onChange as ((v: number) => void) | undefined)?.(next[0]);
      }
    },
    [isControlled, isCentered, props],
  );

  const setHandle = useCallback(
    (index: number, rawValue: number) => {
      const v = snap(rawValue);
      const next = [...values];
      if (isCentered) {
        if (index === 0) next[0] = clamp(v, min, next[1]);
        else next[1] = clamp(v, next[0], max);
      } else {
        next[0] = v;
      }
      if (next[index] !== values[index]) commit(next);
    },
    [values, isCentered, min, max, step, commit], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const valueFromClientX = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return min;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return min + ratio * (max - min);
  }, [min, max]);

  useEffect(() => {
    if (dragIndex === null) return;
    const onMove = (e: PointerEvent) => setHandle(dragIndex, valueFromClientX(e.clientX));
    const onUp = () => setDragIndex(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragIndex, setHandle, valueFromClientX]);

  const handlePointerDown = (index: number) => (e: ReactPointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).focus();
    setDragIndex(index);
    setHandle(index, valueFromClientX(e.clientX));
  };

  const handleTrackPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const v = valueFromClientX(e.clientX);
    const index = isCentered
      ? Math.abs(v - values[0]) <= Math.abs(v - values[1])
        ? 0
        : 1
      : 0;
    setDragIndex(index);
    setHandle(index, v);
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent) => {
    if (disabled) return;
    const big = step * 10;
    if (e.key === 'Home') {
      e.preventDefault();
      setHandle(index, isCentered && index === 1 ? values[0] : min);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setHandle(index, isCentered && index === 0 ? values[1] : max);
      return;
    }
    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step;
    else if (e.key === 'PageUp') delta = big;
    else if (e.key === 'PageDown') delta = -big;
    else return;
    e.preventDefault();
    setHandle(index, values[index] + delta);
  };

  const activeLeft = isCentered ? pct(values[0]) : 0;
  const activeRight = isCentered ? pct(values[1]) : pct(values[0]);

  const showFor = (index: number) =>
    showIndicator === 'always' ||
    (!!showIndicator && (dragIndex === index || focusIndex === index));

  return (
    <div
      className={['range-slider', className].filter(Boolean).join(' ')}
      data-disabled={disabled || undefined}
      role={isCentered ? 'group' : undefined}
      aria-label={ariaLabel}
    >
      <div ref={trackRef} className="range-slider__track" onPointerDown={handleTrackPointerDown}>
        <div
          className="range-slider__track-active"
          style={{ left: `${activeLeft}%`, right: `${100 - activeRight}%` }}
        />
      </div>

      {values.map((v, i) => (
        <div key={i} className="range-slider__handle-wrap" style={{ left: `${pct(v)}%` }}>
          {showFor(i) && (
            <SliderHandleIndicator className="range-slider__indicator">
              {formatValue(v)}
            </SliderHandleIndicator>
          )}
          <SliderHandle
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-orientation="horizontal"
            aria-valuemin={isCentered && i === 1 ? values[0] : min}
            aria-valuemax={isCentered && i === 0 ? values[1] : max}
            aria-valuenow={v}
            aria-valuetext={formatValue(v)}
            aria-label={isCentered ? (i === 0 ? 'Valor mínimo' : 'Valor máximo') : ariaLabel}
            aria-disabled={disabled || undefined}
            pressed={dragIndex === i}
            onPointerDown={handlePointerDown(i)}
            onKeyDown={handleKeyDown(i)}
            onFocus={() => setFocusIndex(i)}
            onBlur={() => setFocusIndex(null)}
          />
        </div>
      ))}
    </div>
  );
}
