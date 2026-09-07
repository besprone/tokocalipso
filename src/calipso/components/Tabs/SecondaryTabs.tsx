import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { prefersReducedMotion, springTo } from '../../lib/spring';
import { SecondaryTab } from './SecondaryTab';
import './SecondaryTabs.css';

export type SecondaryTabDef = {
  /** Identificador de la tab (valor de selección). */
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Nombre accesible si la tab no tiene `label`. */
  'aria-label'?: string;
};

export type SecondaryTabsProps = {
  /** Tabs en orden. Máximo 4 (sin scroll). */
  items: SecondaryTabDef[];
  /** Valor seleccionado (controlado). */
  value?: string;
  /** Valor inicial (no controlado). */
  defaultValue?: string;
  /** Se llama con el `value` de la tab activada. */
  onChange?: (value: string) => void;
  /** Nombre accesible del `role="tablist"`. Requerido. */
  'aria-label': string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>;

/**
 * SecondaryTabs — navegación secundaria dentro de una sección ya definida por
 * `PrimaryTabs`. Figma: `components_secondary_tabs`.
 *
 * Como `PrimaryTabs`, pero **más ligero**: el indicador es una línea fina de
 * **2px que ocupa todo el ancho** de la tab activa (sin esquinas redondeadas),
 * y se desliza en X con física de muelle (`motion/spring`). Las tabs solo
 * recolorean icono + label. `prefers-reduced-motion` → salto directo.
 *
 * Siempre reparte el ancho equitativo, sin scroll. Máx. 4 tabs.
 */
export function SecondaryTabs({
  items,
  value,
  defaultValue,
  onChange,
  'aria-label': ariaLabel,
  className,
  ...props
}: SecondaryTabsProps) {
  const isControlled = value !== undefined;
  const firstEnabled = items.find((i) => !i.disabled)?.value;
  const [internal, setInternal] = useState<string | undefined>(defaultValue ?? firstEnabled);
  const selectedValue = isControlled ? value : internal;
  const selectedIndex = Math.max(
    0,
    items.findIndex((i) => i.value === selectedValue),
  );

  const trackRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentLeftRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const cancelRef = useRef<(() => void) | undefined>(undefined);

  const positionIndicator = useCallback(
    (animate: boolean) => {
      const ind = indicatorRef.current;
      const tab = tabRefs.current[selectedIndex];
      if (!ind || !tab) return;
      // el indicador ocupa TODO el ancho de la tab activa
      ind.style.width = `${tab.offsetWidth}px`;
      const target = tab.offsetLeft;
      cancelRef.current?.();
      const from = currentLeftRef.current;
      if (!animate || from == null || prefersReducedMotion()) {
        ind.style.transform = `translateX(${target}px)`;
        currentLeftRef.current = target;
        return;
      }
      cancelRef.current = springTo(from, target, (x) => {
        ind.style.transform = `translateX(${x}px)`;
        currentLeftRef.current = x;
      });
    },
    [selectedIndex],
  );

  const positionRef = useRef(positionIndicator);
  positionRef.current = positionIndicator;

  useLayoutEffect(() => {
    positionIndicator(mountedRef.current);
    mountedRef.current = true;
  }, [positionIndicator]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return;
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      positionRef.current(false);
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => cancelRef.current?.(), []);

  const select = (v: string) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!enabled.length) return;
    const pos = enabled.indexOf(selectedIndex);
    let next = -1;
    if (e.key === 'ArrowRight') next = enabled[(pos + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next < 0) return;
    e.preventDefault();
    select(items[next].value);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={['secondary-tabs', className].filter(Boolean).join(' ')} {...props}>
      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className="secondary-tabs__track"
        onKeyDown={onKeyDown}
      >
        {items.map((it, i) => {
          const sel = it.value === selectedValue;
          return (
            <SecondaryTab
              key={it.value}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              label={it.label}
              icon={it.icon}
              selected={sel}
              disabled={it.disabled}
              tabIndex={sel ? 0 : -1}
              aria-label={it['aria-label']}
              onClick={() => select(it.value)}
            />
          );
        })}
        <span ref={indicatorRef} className="secondary-tabs__indicator" aria-hidden="true" />
      </div>
    </div>
  );
}
