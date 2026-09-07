import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { prefersReducedMotion, springTo } from '../../lib/spring';
import { PrimaryTab } from './PrimaryTab';
import './PrimaryTabs.css';

export type PrimaryTabsDistribution = 'equal' | 'content';
export type PrimaryTabsSize = 'sm' | 'md' | 'lg';

export type PrimaryTabDef = {
  /** Identificador de la tab (valor de selección). */
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Nombre accesible si la tab no tiene `label`. */
  'aria-label'?: string;
};

export type PrimaryTabsProps = {
  /** Tabs en orden. 2–4 recomendado con `distribution="equal"`. */
  items: PrimaryTabDef[];
  /** Valor seleccionado (controlado). */
  value?: string;
  /** Valor inicial (no controlado). */
  defaultValue?: string;
  /** Se llama con el `value` de la tab activada. */
  onChange?: (value: string) => void;
  /** `equal` = tabs de ancho equitativo, sin scroll (default). `content` = ancho
   *  por contenido con scroll horizontal. */
  distribution?: PrimaryTabsDistribution;
  /** Presencia del strip: `sm` compacto · `md` (default) · `lg`. Afecta el
   *  padding lateral del contenedor (sobre todo en `content`). */
  size?: PrimaryTabsSize;
  /** Nombre accesible del `role="tablist"`. Requerido. */
  'aria-label': string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>;

const INDICATOR_W = 32;

/**
 * PrimaryTabs — navegación horizontal entre secciones del mismo nivel dentro de
 * una pantalla. Figma: `components_primary_tabs`.
 *
 * Un **único indicador** (barra `bg/brand` de 32×4, esquinas superiores
 * redondeadas) **se desliza** bajo la tab activa con física de muelle
 * (`motion/spring`, solo eje X); las tabs solo recolorean icono + label.
 * `prefers-reduced-motion` → salto directo.
 */
export function PrimaryTabs({
  items,
  value,
  defaultValue,
  onChange,
  distribution = 'equal',
  size = 'md',
  'aria-label': ariaLabel,
  className,
  ...props
}: PrimaryTabsProps) {
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
      const track = trackRef.current;
      const ind = indicatorRef.current;
      const tab = tabRefs.current[selectedIndex];
      if (!track || !ind || !tab) return;
      // offsetLeft es relativo al track → funciona igual con scroll (content)
      const target = tab.offsetLeft + tab.offsetWidth / 2 - INDICATOR_W / 2;
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
    if (mountedRef.current) {
      tabRefs.current[selectedIndex]?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
    mountedRef.current = true;
  }, [positionIndicator, selectedIndex]);

  // el track cambia de tamaño → recolocar sin animar (creado una vez)
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
    <div
      className={['primary-tabs', className].filter(Boolean).join(' ')}
      data-distribution={distribution}
      data-size={size}
      {...props}
    >
      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className="primary-tabs__track"
        onKeyDown={onKeyDown}
      >
        {items.map((it, i) => {
          const sel = it.value === selectedValue;
          return (
            <PrimaryTab
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
        <span ref={indicatorRef} className="primary-tabs__indicator" aria-hidden="true" />
      </div>
    </div>
  );
}
