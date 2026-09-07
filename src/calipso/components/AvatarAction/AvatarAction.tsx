import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import { Avatar } from '../Avatar/Avatar';
import type { AvatarProps } from '../Avatar/Avatar';
import { ItemTrailing } from '../ItemBlocks/ItemTrailing';
import './AvatarAction.css';

export type AvatarActionType = 'menu' | 'button';

type BaseProps = {
  /** `menu` (chevron + panel al abrir) · `button` (acción directa, sin panel).
   *  Default `menu`. */
  type?: AvatarActionType;
  /** Nombre de la cuenta. */
  label: ReactNode;
  /** Texto secundario (correo, rol…). */
  supporting?: ReactNode;
  /** Props del `<Avatar>` (el `size` es fijo `sm`). */
  avatarProps?: Omit<AvatarProps, 'size'>;
  /** Escape hatch: un nodo propio en vez del `<Avatar>`. */
  avatar?: ReactNode;
  /** Contenido del panel (`type="menu"`): opciones de cuenta. Es un **pattern**
   *  — normalmente una `List` / `Dropdown` de acciones. */
  children?: ReactNode;
  /** Panel abierto (controlado). */
  open?: boolean;
  /** Estado inicial no controlado. Default `false`. */
  defaultOpen?: boolean;
  /** Se llama al pedir abrir/cerrar (click, Escape, click-fuera). */
  onOpenChange?: (open: boolean) => void;
};

export type AvatarActionProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

/**
 * AvatarAction — chip de identidad de la cuenta. Figma: `components_avatar_action`.
 * `type="menu"` despliega un panel (`children`) con las acciones de cuenta;
 * `type="button"` es un acceso directo sin panel.
 *
 * Orquesta abrir/cerrar (click, Escape, click-fuera) y la rotación del chevron.
 * El panel se posiciona `absolute` bajo el chip (sin portal ni colisión): el
 * contenedor debe tener espacio y `overflow: visible`. El contenido del panel
 * (opciones de cuenta) es un pattern, no parte del componente.
 */
export function AvatarAction({
  type = 'menu',
  label,
  supporting,
  avatarProps,
  avatar,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  onClick,
  onKeyDown,
  ...props
}: AvatarActionProps) {
  const controlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = type === 'menu' && (controlled ? !!openProp : internalOpen);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  // click-fuera + Escape cierran
  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDocPointer, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointer, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (type === 'menu') setOpen(!open);
  };

  return (
    <div
      ref={rootRef}
      className={['avatar-action', className].filter(Boolean).join(' ')}
      data-type={type}
      data-open={open ? '' : undefined}
    >
      <button
        ref={btnRef}
        type="button"
        className="avatar-action__chip"
        aria-haspopup={type === 'menu' ? 'true' : undefined}
        aria-expanded={type === 'menu' ? open : undefined}
        aria-controls={type === 'menu' && open ? panelId : undefined}
        onClick={handleClick}
        onKeyDown={onKeyDown}
        {...props}
      >
        <span className="avatar-action__state">
          {avatar ?? <Avatar size="sm" {...avatarProps} />}
          <span className="avatar-action__content">
            <span className="avatar-action__label">{label}</span>
            {supporting != null && <span className="avatar-action__supporting">{supporting}</span>}
          </span>
          {type === 'menu' && (
            <ItemTrailing className="avatar-action__chevron" type="icon" icon={<ChevronDown />} />
          )}
        </span>
      </button>

      {type === 'menu' && open && (
        <div id={panelId} className="avatar-action__panel" role="menu">
          <div className="avatar-action__panel-scroll">{children}</div>
        </div>
      )}
    </div>
  );
}
