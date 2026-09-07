import { useCallback, useEffect, useRef, useState } from 'react';
import { Close, Logout, SidePanelClose, SidePanelOpen } from '@carbon/icons-react';
import type { AnimationEvent, KeyboardEvent, ReactNode } from 'react';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { RailNavItem } from './RailNavItem';
import type { AvatarProps } from '../Avatar/Avatar';
import { prefersReducedMotion } from '../../lib/spring';
import './NavigationRail.css';

export type NavigationRailMode = 'rail' | 'overlay';
export type NavigationRailSize = 'lg' | 'md';

export type RailNavItemDef = {
  value: string;
  label: string;
  supporting?: string;
  icon?: ReactNode;
  avatarProps?: Omit<AvatarProps, 'size'>;
  badge?: string;
  disabled?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onSelect?: () => void;
};

export type RailSection = {
  /** Encabezado de la sección (solo visible en `expanded`). */
  label?: string;
  items: RailNavItemDef[];
};

export type NavigationRailProps = {
  /** Logo de marca — visible cuando `expanded`. */
  logo?: ReactNode;
  /** Hasta 3 secciones navegables. */
  sections: RailSection[];
  /** Valor del navitem seleccionado (controlado). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Navitem de avatar al final del contenido, antes del footer. */
  avatar?: RailNavItemDef;
  /** Encabezado sobre el avatar (solo `expanded`). */
  avatarLabel?: string;
  /** Acción de logout en el footer. */
  footer?: { label: string; icon?: ReactNode; onClick: () => void };
  /** `rail` = panel fijo con toggle colapsar/expandir · `overlay` = panel
   *  deslizante sobre el contenido con backdrop y botón de cierre. Default `rail`. */
  mode?: NavigationRailMode;
  /** Expandido (260px) vs colapsado (96px). `rail` mode. Default `true`. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** `overlay` mode — se llama al cerrar (X, backdrop, Escape). */
  onClose?: () => void;
  /** `overlay` mode — controla la visibilidad para animar la salida. Al pasar a
   *  `false` reproduce la animación de cierre y luego llama `onExited`. Si se
   *  omite (`true`), el overlay se muestra y el consumidor lo desmonta sin
   *  animación de salida. */
  open?: boolean;
  /** `overlay` mode — se dispara al terminar la animación de salida; el
   *  consumidor lo usa para desmontar el overlay. */
  onExited?: () => void;
  /** `lg` = items con supporting · `md` = sin supporting. Default `lg`. */
  size?: NavigationRailSize;
  /** Items de menor alto. Default `false`. */
  compact?: boolean;
  /** Nombre accesible del `<nav>`. Default `Navegación`. */
  'aria-label'?: string;
};

/**
 * NavigationRail — navegación lateral vertical para tablet/desktop. Figma:
 * `components_navigation_rail`. Header (logo + toggle) · secciones con section
 * label · avatar item opcional · footer con logout.
 *
 * `expanded` (260px, con labels) ↔ colapsado (96px, solo iconos). `mode="overlay"`
 * lo muestra como panel deslizante con backdrop y X. Solo un navitem `selected`
 * a la vez. **No usar en mobile** — para eso `NavigationBar`.
 */
export function NavigationRail({
  logo,
  sections,
  value,
  defaultValue,
  onChange,
  avatar,
  avatarLabel,
  footer,
  mode = 'rail',
  expanded: expandedProp,
  defaultExpanded = true,
  onExpandedChange,
  onClose,
  open = true,
  onExited,
  size = 'lg',
  compact = false,
  'aria-label': ariaLabel = 'Navegación',
}: NavigationRailProps) {
  const allItems = [...sections.flatMap((s) => s.items), ...(avatar ? [avatar] : [])];
  const firstEnabled = allItems.find((i) => !i.disabled)?.value;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string | undefined>(defaultValue ?? firstEnabled);
  const selectedValue = isControlled ? value : internal;

  const isExpandedControlled = expandedProp !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = mode === 'overlay' ? true : isExpandedControlled ? !!expandedProp : internalExpanded;

  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // overlay: fase de entrada/salida para animar el cierre (no solo la apertura)
  const [overlayPhase, setOverlayPhase] = useState<'entering' | 'open' | 'exiting'>(
    mode === 'overlay' ? 'entering' : 'open',
  );
  const prevOpen = useRef(open);
  useEffect(() => {
    if (mode !== 'overlay' || prevOpen.current === open) return;
    prevOpen.current = open;
    if (prefersReducedMotion()) {
      setOverlayPhase(open ? 'open' : 'exiting');
      if (!open) onExited?.();
    } else {
      setOverlayPhase(open ? 'entering' : 'exiting');
    }
  }, [mode, open, onExited]);

  const onRailAnimEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (mode !== 'overlay' || e.target !== e.currentTarget) return;
    if (overlayPhase === 'entering') setOverlayPhase('open');
    else if (overlayPhase === 'exiting') onExited?.();
  };

  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isExpandedControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isExpandedControlled, onExpandedChange],
  );

  const select = (item: RailNavItemDef) => {
    if (item.disabled) return;
    if (!isControlled) setInternal(item.value);
    onChange?.(item.value);
    item.onSelect?.();
  };

  // Escape cierra el overlay
  useEffect(() => {
    if (mode !== 'overlay') return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mode, onClose]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const refs = itemRefs.current;
    const enabled = allItems.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!enabled.length) return;
    const focused = refs.findIndex((el) => el === document.activeElement);
    const pos = enabled.indexOf(focused);
    let next = -1;
    if (e.key === 'ArrowDown') next = enabled[pos < 0 ? 0 : (pos + 1) % enabled.length];
    else if (e.key === 'ArrowUp') next = enabled[pos < 0 ? enabled.length - 1 : (pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    else return;
    e.preventDefault();
    refs[next]?.focus();
  };

  const orientation = expanded ? 'horizontal' : 'vertical';
  const rovingIndex = Math.max(
    0,
    allItems.findIndex((i) => i.value === selectedValue),
  );

  let idx = -1;
  const renderItem = (item: RailNavItemDef) => {
    idx += 1;
    const i = idx;
    return (
      <RailNavItem
        key={item.value}
        ref={(el) => {
          itemRefs.current[i] = el;
        }}
        orientation={orientation}
        showContent={expanded}
        compact={compact || size === 'md'}
        label={item.label}
        supporting={size === 'lg' && !compact ? item.supporting : undefined}
        icon={item.icon}
        avatarProps={item.avatarProps}
        badge={item.badge}
        selected={item.value === selectedValue}
        disabled={item.disabled}
        expandable={item.expandable}
        expanded={item.expanded}
        tabIndex={i === rovingIndex ? 0 : -1}
        onClick={() => select(item)}
      />
    );
  };

  const rail = (
    <div
      ref={rootRef}
      className="navigation-rail"
      data-expanded={expanded ? '' : undefined}
      data-mode={mode}
      data-size={size}
      data-state={mode === 'overlay' ? overlayPhase : undefined}
      onAnimationEnd={onRailAnimEnd}
    >
      <div className="navigation-rail__header">
        {expanded && logo != null && <span className="navigation-rail__logo">{logo}</span>}
        {mode === 'overlay' ? (
          <IconButton
            emphasis="ghost"
            size="lg"
            aria-label="Cerrar"
            icon={<Close />}
            onClick={() => onClose?.()}
          />
        ) : (
          <IconButton
            emphasis="ghost"
            size="lg"
            aria-label={expanded ? 'Colapsar navegación' : 'Expandir navegación'}
            icon={expanded ? <SidePanelClose /> : <SidePanelOpen />}
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </div>

      <nav aria-label={ariaLabel} className="navigation-rail__segments" onKeyDown={onKeyDown}>
        {sections.map((section, si) => (
          <div key={si} className="navigation-rail__section">
            {expanded && section.label != null && (
              <p className="navigation-rail__section-label">{section.label}</p>
            )}
            <div className="navigation-rail__items">{section.items.map(renderItem)}</div>
          </div>
        ))}
      </nav>

      {avatar && (
        <div className="navigation-rail__section navigation-rail__avatar-section">
          {expanded && avatarLabel != null && (
            <p className="navigation-rail__section-label" data-avatar="">
              {avatarLabel}
            </p>
          )}
          <div className="navigation-rail__items">{renderItem(avatar)}</div>
        </div>
      )}

      {footer && (
        <div className="navigation-rail__footer">
          {expanded ? (
            <Button
              emphasis="ghost"
              size="sm"
              icon={footer.icon ?? <Logout />}
              onClick={footer.onClick}
              className="navigation-rail__logout"
            >
              {footer.label}
            </Button>
          ) : (
            <IconButton
              emphasis="ghost"
              size="lg"
              aria-label={footer.label}
              icon={footer.icon ?? <Logout />}
              onClick={footer.onClick}
            />
          )}
        </div>
      )}
    </div>
  );

  if (mode === 'overlay') {
    return (
      <div className="navigation-rail-overlay" data-state={overlayPhase}>
        <div
          className="navigation-rail-overlay__backdrop"
          onClick={() => onClose?.()}
          aria-hidden="true"
        />
        {rail}
      </div>
    );
  }

  return rail;
}
