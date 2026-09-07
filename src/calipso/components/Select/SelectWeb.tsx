import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import { createPortal } from 'react-dom';
import { TextField } from '../TextField/TextField';
import { Dropdown } from '../Dropdown/Dropdown';
import type { DropdownOption } from '../Dropdown/Dropdown';
import './Select.css';

export type SelectWebProps = {
  label: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
  className?: string;
};

const OFFSET = 4;
const VIEWPORT_MARGIN = 8;
const EXIT_MS = 160;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * SelectWeb — selector para tablet/desktop: `TextField` (trigger, no
 * editable) + `Dropdown` desplegado debajo. Figma: `pattern_select_web`.
 *
 * `Dropdown` (`components_dropdown`) documenta explícitamente que el
 * trigger/portal/posicionamiento/animación de apertura/click-fuera son
 * responsabilidad de quien lo monta — este componente es exactamente ese
 * "quien lo monta" (mismo motor de posicionamiento — portal a `body` +
 * `position:fixed`, sin dependencias — que ya usa `Tooltip`).
 *
 * Igual que `SelectBottomSheet`: el input es `readOnly` y el click que
 * abre el panel vive en un `<div>` que envuelve SOLO el `TextField`
 * (`.select-web__trigger`), NO en el `<div>` ancla (`.select-web`, el que
 * también contiene el `createPortal` del panel) ni en `onFocus`. Razón:
 * React sigue burbujeando los eventos de un portal por el ÁRBOL DE REACT
 * (el componente que llama `createPortal`), no por el árbol del DOM — así
 * que un `onClick` en el `<div>` ancla SÍ recibiría los clicks de dentro
 * del panel portado, aunque viva en otro lugar del DOM. Sin este scoping,
 * elegir una opción reabriría el panel justo después de cerrarlo (mismo
 * bug real encontrado y corregido en `SelectBottomSheet`, aquí por la vía
 * del portal en vez de la restauración de foco).
 */
export function SelectWeb({
  label,
  helperText,
  error,
  disabled,
  options,
  value,
  onChange,
  searchable,
  placeholder = 'Selecciona una opción',
  className,
}: SelectWebProps) {
  const id = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0, width: 0 });

  const selected = options.find((o) => o.value === value);
  // el trigger es un <input> real — solo puede mostrar texto plano, aunque
  // `DropdownOption.label` acepte ReactNode (para renders ricos en el panel)
  const selectedText =
    selected == null ? '' : typeof selected.label === 'string' ? selected.label : (selected.searchText ?? '');

  const open = useCallback(() => {
    if (disabled || error) return;
    clearTimeout(exitTimer.current);
    setMounted(true);
    requestAnimationFrame(() => setShown(true));
  }, [disabled, error]);

  const close = useCallback(() => {
    if (!mounted) return;
    setShown(false);
    exitTimer.current = setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : EXIT_MS);
  }, [mounted]);

  // el click del trigger alterna: si ya está abierto, lo cierra en vez de
  // no hacer nada (clickear el select de nuevo debe ocultar el dropdown)
  const toggle = useCallback(() => {
    if (mounted) close();
    else open();
  }, [mounted, open, close]);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  // Escape + click-fuera cierran
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onDocPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!anchorRef.current?.contains(target) && !panelRef.current?.contains(target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDocPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDocPointer, true);
    };
  }, [mounted, close]);

  // posicionamiento — siempre debajo del trigger, ancho igual al trigger
  const place = useCallback(() => {
    const anchorEl = anchorRef.current;
    if (!anchorEl) return;
    const a = anchorEl.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const left = Math.min(a.left, vw - a.width - VIEWPORT_MARGIN);
    setPos({ left: Math.round(left), top: Math.round(a.bottom + OFFSET), width: Math.round(a.width) });
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;
    place();
    const reposition = () => place();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [mounted, place]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    close();
  };

  return (
    <div
      ref={anchorRef}
      className={['select-web', className].filter(Boolean).join(' ')}
      data-open={mounted || undefined}
    >
      <div className="select-web__trigger" onClick={toggle}>
        <TextField
          label={label}
          helperText={helperText}
          error={error}
          disabled={disabled}
          showTrailing
          trailingIcon={<ChevronDown className="select-web__chevron" />}
          readOnly
          value={selectedText}
          placeholder={placeholder}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={mounted}
          aria-controls={mounted ? id : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
              e.preventDefault();
              open();
            }
          }}
        />
      </div>
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            className="select-web__panel"
            data-state={shown ? 'open' : 'closed'}
            style={{ position: 'fixed', left: pos.left, top: pos.top, width: pos.width }}
          >
            <Dropdown
              id={id}
              aria-label={label}
              options={options}
              value={value}
              searchable={searchable}
              onSelect={handleSelect}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
