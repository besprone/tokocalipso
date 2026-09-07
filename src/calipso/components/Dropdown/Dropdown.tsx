import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { Checkmark, Search } from '@carbon/icons-react';
import './Dropdown.css';

export type DropdownOption = {
  value: string;
  /** Texto o contenido de la opción. */
  label: ReactNode;
  /** Ícono/imagen leading (20px). */
  icon?: ReactNode;
  /** Texto para el filtro cuando `label` no es string. */
  searchText?: string;
  disabled?: boolean;
};

export type DropdownProps = {
  options: DropdownOption[];
  /** Valor(es) seleccionado(s). */
  value?: string | string[];
  /** Selección múltiple (marca cada opción elegida, no cierra al elegir). */
  multiple?: boolean;
  /** Se llama con el `value` de la opción elegida. */
  onSelect?: (value: string) => void;
  /** `type: search + list` — campo de búsqueda arriba que filtra por texto. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Alto máximo de la lista en px; más allá aparece el scroll. Default `320`. */
  maxHeight?: number;
  /** Mensaje cuando el filtro no devuelve resultados. */
  emptyMessage?: ReactNode;
  /** Nombra la lista para lectores de pantalla. Requerido. */
  'aria-label': string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'>;

const searchTextOf = (o: DropdownOption) =>
  (o.searchText ?? (typeof o.label === 'string' ? o.label : '')).toLowerCase();

/**
 * Dropdown — panel flotante de selección: lista de opciones (con búsqueda
 * opcional) sobre una superficie elevada. Figma: `components_dropdown` (solo
 * `step=1`, el panel abierto).
 *
 * Es un **sub-componente**: normalmente se instancia dentro de un `Select` /
 * combobox / filtro. **No** gestiona el trigger, el portal, el posicionamiento
 * respecto al viewport, la animación de apertura ni el click-fuera — eso lo
 * pone quien lo monta.
 *
 * No usar para menos de ~5 opciones (preferir radio group o segmented control).
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  {
    options,
    value,
    multiple = false,
    onSelect,
    searchable = false,
    searchPlaceholder = 'Buscar',
    maxHeight = 320,
    emptyMessage = 'Sin resultados',
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const baseId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [scrollNeeded, setScrollNeeded] = useState(false);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => searchTextOf(o).includes(q));
  }, [options, searchable, query]);

  optionRefs.current.length = filtered.length;

  const isSelected = useCallback(
    (v: string) => (Array.isArray(value) ? value.includes(v) : value === v),
    [value],
  );

  const firstEnabled = useCallback(
    (from: number, dir: 1 | -1) => {
      let i = from;
      for (let n = 0; n < filtered.length; n++) {
        if (i >= 0 && i < filtered.length && !filtered[i].disabled) return i;
        i += dir;
      }
      return -1;
    },
    [filtered],
  );

  // reinicia el highlight al primer habilitado cuando cambia el filtro
  useEffect(() => {
    setHighlight(Math.max(0, firstEnabled(0, 1)));
  }, [firstEnabled]);

  const move = useCallback(
    (dir: 1 | -1) => {
      setHighlight((h) => {
        const next = firstEnabled(h + dir, dir);
        return next === -1 ? h : next;
      });
    },
    [firstEnabled],
  );

  // mantiene la opción resaltada a la vista
  useEffect(() => {
    optionRefs.current[highlight]?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  const select = useCallback(
    (o: DropdownOption) => {
      if (o.disabled) return;
      onSelect?.(o.value);
    },
    [onSelect],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(-1);
        break;
      case 'Home':
        e.preventDefault();
        setHighlight(Math.max(0, firstEnabled(0, 1)));
        break;
      case 'End':
        e.preventDefault();
        setHighlight(Math.max(0, firstEnabled(filtered.length - 1, -1)));
        break;
      case 'Enter':
        if (filtered[highlight]) {
          e.preventDefault();
          select(filtered[highlight]);
        }
        break;
      default:
        break;
    }
  };

  // ── scrollbar propio (indicador) ──────────────────────────────────────
  const updateScrollbar = useCallback(() => {
    const el = listRef.current;
    const thumb = thumbRef.current;
    if (!el) return;
    const overflow = el.scrollHeight > el.clientHeight + 1;
    setScrollNeeded(overflow);
    if (!overflow || !thumb) return;
    const trackH = el.clientHeight - 4; /* padding 2px por lado */
    const thumbH = Math.max(24, Math.round((el.clientHeight / el.scrollHeight) * trackH));
    const maxTop = trackH - thumbH;
    const top = maxTop <= 0 ? 0 : (el.scrollTop / (el.scrollHeight - el.clientHeight)) * maxTop;
    thumb.style.height = `${thumbH}px`;
    thumb.style.transform = `translateY(${Math.round(top)}px)`;
  }, []);

  useLayoutEffect(updateScrollbar, [updateScrollbar, filtered.length, maxHeight]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateScrollbar);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(updateScrollbar);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [updateScrollbar]);

  return (
    <div
      {...props}
      ref={ref}
      className={['dropdown', className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
    >
      {searchable && (
        <div className="dropdown__search">
          <Search size={20} className="dropdown__search-icon" aria-hidden="true" />
          <input
            type="text"
            className="dropdown__search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            autoComplete="off"
          />
        </div>
      )}

      <div className="dropdown__list-wrap">
        <ul
          ref={listRef}
          className="dropdown__list"
          role="listbox"
          aria-label={props['aria-label']}
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={filtered[highlight] ? `${baseId}-opt-${highlight}` : undefined}
          tabIndex={searchable ? -1 : 0}
          style={{ maxHeight }}
        >
          {filtered.length === 0 ? (
            <li className="dropdown__empty" role="presentation">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((o, i) => {
              const selected = isSelected(o.value);
              return (
                <li
                  key={o.value}
                  id={`${baseId}-opt-${i}`}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={o.disabled || undefined}
                  data-highlighted={i === highlight || undefined}
                  className="dropdown__option"
                  onPointerMove={() => !o.disabled && setHighlight(i)}
                  onClick={() => select(o)}
                >
                  {o.icon != null && (
                    <span className="dropdown__option-icon" aria-hidden="true">
                      {o.icon}
                    </span>
                  )}
                  <span className="dropdown__option-label">{o.label}</span>
                  {selected && <Checkmark size={20} className="dropdown__option-check" aria-hidden="true" />}
                </li>
              );
            })
          )}
        </ul>

        <div className="dropdown__scrollbar" data-visible={scrollNeeded || undefined} aria-hidden="true">
          <div ref={thumbRef} className="dropdown__thumb" />
        </div>
      </div>
    </div>
  );
});
