import { useContext } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { ItemContent } from '../ItemBlocks/ItemContent';
import { ListContext } from './listContext';
import type { ListItemLayout } from './listContext';
import './ListItem.css';

export type { ListItemLayout } from './listContext';

/** Estado visual forzado — para resaltado programático (p. ej. opción activa
 *  de un combobox). Sin él, `:hover` / `:active` aplican de forma natural. */
export type ListItemState = 'hovered' | 'pressed';

type BaseProps = {
  /** Texto principal (Body/lg). Requerido salvo que pases `content`. */
  label?: ReactNode;
  /** Texto secundario opcional (Body/md en stacked, Body/lg en horizontal). */
  supporting?: ReactNode;
  /** Reemplaza el bloque de contenido — un `<ItemContent>` propio con
   *  `overline` / `supporting2` / `action`, etc. Ignora `label`/`supporting`. */
  content?: ReactNode;
  /** Slot izquierdo — icono ~20px, o un `<ItemLeading>`. */
  leading?: ReactNode;
  /** Slot derecho — icono/acción ~24px (chevron, checkbox, checkmark…), o un `<ItemTrailing>`. */
  trailing?: ReactNode;
  /** Fila seleccionada — fondo `bg/brandSoft`. */
  selected?: boolean;
  /** Deshabilitada — atenúa texto/iconos y bloquea interacción. */
  disabled?: boolean;
  /** Fuerza el overlay de estado (resaltado programático). */
  state?: ListItemState;
  /** `stacked` | `horizontal`. Si se omite, lo hereda de `List` (size). */
  layout?: ListItemLayout;
  /** Renderiza un `<button>` en vez de `<div role="listitem">`. */
  interactive?: boolean;
};

export type ListItemProps = BaseProps &
  Omit<HTMLAttributes<HTMLDivElement> & ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

/**
 * ListItem — fila base de `List`. Figma: `_building_blocks_list_item`.
 * **No lleva `border-radius`**: la esquina redondeada la aporta el `List` que
 * lo instancia (`overflow: clip` + radio). Compone `leading` · `ItemContent`
 * (`label` + `supporting`, o el slot `content`) · `trailing`.
 *
 * Building block interno: no se usa suelto en producto, se instancia dentro de
 * `List` (o de un componente que lo envuelva — Select, Dropdown…).
 */
export function ListItem({
  label,
  supporting,
  content,
  leading,
  trailing,
  selected = false,
  disabled = false,
  state,
  layout: layoutProp,
  interactive = false,
  className,
  ...props
}: ListItemProps) {
  const ctx = useContext(ListContext);
  const layout = layoutProp ?? ctx?.layout ?? 'stacked';

  const body = (
    <span className="list-item__state" data-state={state || undefined}>
      <span className="list-item__container">
        {leading != null && <span className="list-item__leading">{leading}</span>}
        {content ?? (
          <ItemContent
            className="list-item__content"
            size="lg"
            layout={layout}
            label={label}
            supporting={supporting}
          />
        )}
        {trailing != null && <span className="list-item__trailing">{trailing}</span>}
      </span>
    </span>
  );

  const shared = {
    className: ['list-item', className].filter(Boolean).join(' '),
    'data-layout': layout,
    'data-selected': selected ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
  };

  if (interactive) {
    // `aria-pressed` solo por defecto; si el consumidor da otro `role`
    // (radio, option, menuitemcheckbox…) maneja su propio estado ARIA.
    const defaultPressed = props.role == null ? selected || undefined : undefined;
    return (
      <button
        type="button"
        disabled={disabled}
        aria-pressed={defaultPressed}
        {...shared}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      role="listitem"
      aria-disabled={disabled || undefined}
      {...shared}
      {...(props as HTMLAttributes<HTMLDivElement>)}
    >
      {body}
    </div>
  );
}
