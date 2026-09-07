import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { prefersReducedMotion, springTo } from '../../lib/spring';
import type { AvatarProps } from '../Avatar/Avatar';
import { NavigationBarItem } from './NavigationBarItem';
import type { NavigationBarItemType } from './NavigationBarItem';
import './NavigationBar.css';

export type { NavigationBarItemType } from './NavigationBarItem';

export type NavigationBarItemDef = {
  /** Identificador único del item (valor de selección). */
  value: string;
  /** Texto bajo el icono. Requerido salvo en `type="emphasis"`. */
  label?: string;
  /** Glifo del icono (24px). Para `icon` y `emphasis`. */
  icon?: ReactNode;
  /** `type="avatar"` — props del `<Avatar>` (`size` fijo `xs`). */
  avatarProps?: Omit<AvatarProps, 'size'>;
  /** `type="avatar"` — escape hatch: un nodo propio en vez del `<Avatar>`. */
  avatar?: ReactNode;
  /** Tipo de navitem. Default `icon`. `emphasis` = acción destacada, no navegable. */
  type?: NavigationBarItemType;
  /** Nombre accesible cuando el item no tiene `label` (avatar / emphasis). */
  'aria-label'?: string;
  /** Se dispara al activar el item (después de cambiar la selección, si aplica). */
  onSelect?: () => void;
  disabled?: boolean;
};

export type NavigationBarProps = {
  /** Items en orden. 3–5 recomendado. */
  items: NavigationBarItemDef[];
  /** Valor seleccionado (controlado). */
  value?: string;
  /** Valor seleccionado inicial (no controlado). */
  defaultValue?: string;
  /** Se llama con el `value` del item navegable activado. */
  onChange?: (value: string) => void;
  /** Borde de separación: `top` para nav inferior (default), `bottom` para nav superior. */
  border?: 'top' | 'bottom';
  /** Nombre accesible del `<nav>`. Default `Navegación principal`. */
  'aria-label'?: string;
  className?: string;
};

/**
 * NavigationBar — barra de navegación principal: organiza 3–5 `NavigationBarItem`
 * en fila y controla cuál está activo. Figma: `components_navigation_bar`.
 *
 * El indicador (pill `bg/brandSoft` 40×32) es un único elemento que **se
 * desliza** hasta el item activo con física de muelle (`motion/spring`); los
 * items solo recolorean icono + label. `prefers-reduced-motion` → salto directo.
 *
 * El posicionamiento en pantalla (fixed al borde, safe-area) es responsabilidad
 * del contenedor — ver la story `En contexto`.
 */
export function NavigationBar({
  items,
  value,
  defaultValue,
  onChange,
  border = 'top',
  'aria-label': ariaLabel = 'Navegación principal',
  className,
}: NavigationBarProps) {
  const isControlled = value !== undefined;
  const firstNavigable = items.find((i) => i.type !== 'emphasis' && !i.disabled)?.value;
  const [internal, setInternal] = useState<string | undefined>(defaultValue ?? firstNavigable);
  const selectedValue = isControlled ? value : internal;

  const hasIndicator = items.some(
    (i) => i.value === selectedValue && i.type !== 'emphasis',
  );

  const barRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const currentLeftRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const cancelRef = useRef<(() => void) | undefined>(undefined);

  const positionPill = useCallback(
    (animate: boolean) => {
      const bar = barRef.current;
      const pill = pillRef.current;
      if (!bar || !pill || !hasIndicator) return;

      const idx = items.findIndex((i) => i.value === selectedValue);
      const btn = bar.querySelectorAll<HTMLElement>('.nav-bar-item')[idx];
      const iconEl = btn?.querySelector<HTMLElement>('.nav-bar-item__icon');
      if (!iconEl) return;

      const barRect = bar.getBoundingClientRect();
      const iconRect = iconEl.getBoundingClientRect();
      // el pill (absolute) se posiciona desde el borde de padding del nav;
      // restamos el borde para que calce exactamente el contenedor del icono
      // (40×32 en Figma).
      const targetLeft = iconRect.left - barRect.left - bar.clientLeft;
      pill.style.top = `${iconRect.top - barRect.top - bar.clientTop}px`;
      pill.style.width = `${iconRect.width}px`;
      pill.style.height = `${iconRect.height}px`;

      cancelRef.current?.();

      const from = currentLeftRef.current;
      if (!animate || from == null || prefersReducedMotion()) {
        pill.style.left = `${targetLeft}px`;
        currentLeftRef.current = targetLeft;
        return;
      }
      cancelRef.current = springTo(from, targetLeft, (x) => {
        pill.style.left = `${x}px`;
        currentLeftRef.current = x;
      });
    },
    [items, selectedValue, hasIndicator],
  );

  // ref siempre-fresca de positionPill para observers de vida larga
  const positionPillRef = useRef(positionPill);
  positionPillRef.current = positionPill;

  // reposiciona (con animación si ya montó) al cambiar la selección
  useLayoutEffect(() => {
    positionPill(mountedRef.current);
    mountedRef.current = true;
  }, [positionPill]);

  // el bar cambia de tamaño (rotación, resize) → recolocar sin animar.
  // Se crea UNA vez: recrearlo por cambio de selección haría que el callback
  // inicial de `observe()` cancele el spring recién arrancado.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === 'undefined') return;
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false; // fire síncrono inicial — ya lo cubre el layout effect
        return;
      }
      positionPillRef.current(false);
    });
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => cancelRef.current?.(), []);

  const handleActivate = (item: NavigationBarItemDef) => {
    if (item.disabled) return;
    if (item.type !== 'emphasis' && item.value !== selectedValue) {
      if (!isControlled) setInternal(item.value);
      onChange?.(item.value);
    }
    item.onSelect?.();
  };

  return (
    <nav
      ref={barRef}
      aria-label={ariaLabel}
      data-border={border}
      className={['nav-bar', className].filter(Boolean).join(' ')}
    >
      {hasIndicator && <span ref={pillRef} className="nav-bar__pill" aria-hidden="true" />}
      {items.map((item) => (
        <NavigationBarItem
          key={item.value}
          type={item.type}
          label={item.label}
          icon={item.icon}
          avatarProps={item.avatarProps}
          avatar={item.avatar}
          selected={item.value === selectedValue}
          disabled={item.disabled}
          aria-label={item['aria-label']}
          data-disabled={item.disabled ? '' : undefined}
          onClick={() => handleActivate(item)}
        />
      ))}
    </nav>
  );
}
