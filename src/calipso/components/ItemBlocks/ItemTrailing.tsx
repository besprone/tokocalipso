import type { ChangeEvent, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { ChevronRight } from '@carbon/icons-react';
import { IconButton } from '../IconButton/IconButton';
import { Checkbox } from '../Checkbox/Checkbox';
import { Radio } from '../Radio/Radio';
import { Switch } from '../Switch/Switch';
import './ItemTrailing.css';

export type ItemTrailingType = 'icon' | 'checkbox' | 'radio' | 'switch' | 'badge' | 'text';

type ControlProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'disabled' | 'name' | 'value' | 'required' | 'aria-label' | 'aria-labelledby'
> & { onChange?: (e: ChangeEvent<HTMLInputElement>) => void };

export type ItemTrailingProps = {
  /** Qué va en el borde derecho de un row. Figma: `_building_blocks_trailing`. */
  type: ItemTrailingType;
  /** `type="icon"` — glifo. Default `<ChevronRight />`. */
  icon?: ReactNode;
  /** `type="icon"` — si se pasa, es un `IconButton` real (acción propia);
   *  si no, el icono es decorativo (afordancia de navegación). */
  onIconClick?: () => void;
  /** `type="icon"` — nombre accesible del `IconButton` cuando `onIconClick`. */
  iconLabel?: string;
  /** `type` checkbox·radio·switch — props que se pasan al control. */
  control?: ControlProps;
  /** `type="badge"` (un `<Badge>`) · `type="text"` (el texto). */
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>;

/**
 * ItemTrailing — bloque del borde derecho de un row (list item, menu item,
 * cell…). Figma: `_building_blocks_trailing`. Despacha según `type` al control
 * correspondiente del sistema; `badge`/`text` reciben el contenido por slot.
 *
 * `icon` sin `onIconClick` = chevron decorativo (el row es el área táctil);
 * `icon` con `onIconClick` = acción independiente (`IconButton`).
 */
export function ItemTrailing({
  type,
  icon,
  onIconClick,
  iconLabel,
  control,
  className,
  children,
  ...props
}: ItemTrailingProps) {
  return (
    <span className={['item-trailing', className].filter(Boolean).join(' ')} data-type={type} {...props}>
      {type === 'icon' &&
        (onIconClick ? (
          <IconButton
            emphasis="ghost"
            size="lg"
            aria-label={iconLabel ?? 'Acción'}
            icon={icon ?? <ChevronRight />}
            onClick={onIconClick}
          />
        ) : (
          <span className="item-trailing__icon" aria-hidden="true">
            {icon ?? <ChevronRight />}
          </span>
        ))}

      {type === 'checkbox' && <Checkbox {...control} />}
      {type === 'radio' && <Radio {...control} />}
      {type === 'switch' && <Switch {...control} />}

      {type === 'badge' && children}
      {type === 'text' && <span className="item-trailing__text">{children}</span>}
    </span>
  );
}
