import type { ChangeEvent, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Add } from '@carbon/icons-react';
import { Avatar } from '../Avatar/Avatar';
import type { AvatarProps } from '../Avatar/Avatar';
import { Checkbox } from '../Checkbox/Checkbox';
import { Radio } from '../Radio/Radio';
import './ItemLeading.css';

export type ItemLeadingType =
  | 'icon'
  | 'img'
  | 'avatar'
  | 'number'
  | 'checkbox'
  | 'radiobutton'
  | 'paymentStatus';

/** `icon` acepta `sm`·`md`; `img`/`avatar` aceptan `xs`–`xl`; el resto es `sm`. */
export type ItemLeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ControlProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'disabled' | 'name' | 'value' | 'required' | 'aria-label' | 'aria-labelledby'
> & { onChange?: (e: ChangeEvent<HTMLInputElement>) => void };

type BaseProps = {
  /** Qué va en el borde izquierdo de un row. Figma: `_building_blocks_leading`. */
  type: ItemLeadingType;
  /** Tamaño. Default `sm`. Solo aplica a `icon` (sm·md) y `img`/`avatar` (xs–xl). */
  size?: ItemLeadingSize;
  /** `type="icon"` — glifo. */
  icon?: ReactNode;
  /** `type="img"` — un `<img>` que llena el marco. */
  img?: ReactNode;
  /** `type="avatar"` — props del `<Avatar>` (el `size` lo aporta `ItemLeading`). */
  avatarProps?: Omit<AvatarProps, 'size'>;
  /** `type="avatar"` — escape hatch: un nodo propio en vez del `<Avatar>`. */
  avatar?: ReactNode;
  /** `type="paymentStatus"` — slot (hasta que exista `PaymentStatus`). */
  paymentStatus?: ReactNode;
  /** `type="number"` — el número dentro del círculo. */
  number?: string | number;
  /** `img`/`avatar` — badge `+` abajo-derecha (`showIcon` en Figma). */
  badge?: boolean;
  /** `type` checkbox·radiobutton — props del control. */
  control?: ControlProps;
};

export type ItemLeadingProps = BaseProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof BaseProps>;

/**
 * ItemLeading — bloque del borde izquierdo de un row (list item, menu item,
 * cell…). Figma: `_building_blocks_leading`. Despacha por `type`.
 *
 * `type="avatar"` instancia `<Avatar>` (con el `size` de `ItemLeading`) desde
 * `avatarProps`; `avatar` es un escape hatch. `paymentStatus` sigue siendo un
 * slot hasta que exista su componente (`_building_block_paymentstatus`).
 */
export function ItemLeading({
  type,
  size = 'sm',
  icon,
  img,
  avatarProps,
  avatar,
  paymentStatus,
  number,
  badge = false,
  control,
  className,
  ...props
}: ItemLeadingProps) {
  const showBadge = badge && (type === 'img' || type === 'avatar');

  return (
    <span
      className={['item-leading', className].filter(Boolean).join(' ')}
      data-type={type}
      data-size={size}
      {...props}
    >
      {type === 'icon' && <span className="item-leading__icon">{icon}</span>}

      {type === 'img' && (
        <span className="item-leading__frame">
          {img}
          {showBadge && (
            <span className="item-leading__badge" aria-hidden="true">
              <Add />
            </span>
          )}
        </span>
      )}

      {type === 'avatar' && (
        <span className="item-leading__frame item-leading__frame--avatar">
          {avatar ?? <Avatar size={size} {...avatarProps} />}
          {showBadge && (
            <span className="item-leading__badge" aria-hidden="true">
              <Add />
            </span>
          )}
        </span>
      )}

      {type === 'number' && <span className="item-leading__number">{number}</span>}

      {type === 'checkbox' && (
        <span className="item-leading__control">
          <Checkbox {...control} />
        </span>
      )}
      {type === 'radiobutton' && (
        <span className="item-leading__control">
          <Radio {...control} />
        </span>
      )}

      {type === 'paymentStatus' && <span className="item-leading__payment">{paymentStatus}</span>}
    </span>
  );
}
