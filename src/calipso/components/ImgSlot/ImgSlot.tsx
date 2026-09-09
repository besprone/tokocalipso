import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import {
  CheckmarkFilled,
  InformationFilled,
  ErrorFilled,
  WarningAltFilled,
  Image as ImageIcon,
} from '@carbon/icons-react';
import './ImgSlot.css';

export type ImgSlotType = 'slot' | 'feedbackState';
export type ImgSlotState =
  | 'default'
  | 'success'
  | 'info'
  | 'error'
  | 'warning'
  | 'empty';
export type ImgSlotSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export type ImgSlotProps = {
  /**
   * `slot` (def.) — contenedor reservado para una imagen/ilustración final
   * (se pasa por `children`); sin `children` pinta un placeholder. `feedbackState`
   * — ilustración pre-armada: acuarela (imagen natural, sin filtros) + halo +
   * icono centrado.
   */
  type?: ImgSlotType;
  /**
   * Estado del `feedbackState` — **sólo cambia el icono** (glifo por defecto y
   * su color); la acuarela no se tiñe. `default` es para `type="slot"`.
   * Default `default`.
   */
  state?: ImgSlotState;
  /** `xxs` 24 · `xs` 48 · `sm` 56 · `md` 80 (cuadrados) · `lg` banda × 160 (la acuarela se ajusta al alto, ancho proporcional). Default `lg`. */
  size?: ImgSlotSize;
  /**
   * Icono central del `feedbackState` (o del placeholder `slot`). Sin pasarlo,
   * `feedbackState` usa un glifo de estado de `@carbon/icons-react` teñido con
   * `icon/<estado>`. En Figma el mock usa la marca kubo — pasá
   * `<Brand type="secondary" />` o el nodo que quieras.
   */
  icon?: ReactNode;
  /** Imagen/ilustración final para `type="slot"`. Ignorada en `feedbackState`. */
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

const DEFAULT_ICON: Record<
  Exclude<ImgSlotState, 'default'>,
  typeof CheckmarkFilled
> = {
  success: CheckmarkFilled,
  info: InformationFilled,
  error: ErrorFilled,
  warning: WarningAltFilled,
  empty: ImageIcon,
};

/**
 * ImgSlot — slot visual de los patrones. Figma: `_building_blocks_img_component`.
 *
 * Dos modos: `type="slot"` es un contenedor reservado para contenido visual
 * dinámico (una imagen final que pasa el consumidor); `type="feedbackState"`
 * es una ilustración pre-armada (acuarela sin filtros + halo + icono) donde
 * el `state` sólo cambia el icono. Pensado para el slot `media` de
 * `SystemFeedback` (`size="lg"` en `high`, `size="sm"` en `low`).
 */
export const ImgSlot = forwardRef<HTMLDivElement, ImgSlotProps>(function ImgSlot(
  { type = 'slot', state = 'default', size = 'lg', icon, children, className, ...props },
  ref,
) {
  const isFeedback = type === 'feedbackState';
  const resolvedState: ImgSlotState =
    isFeedback && state === 'default' ? 'empty' : state;

  let iconNode: ReactNode = icon;
  if (isFeedback && iconNode == null && resolvedState !== 'default') {
    const Glyph = DEFAULT_ICON[resolvedState];
    iconNode = <Glyph />;
  }

  return (
    <div
      {...props}
      ref={ref}
      data-type={type}
      data-state={resolvedState}
      data-size={size}
      className={['img-slot', className].filter(Boolean).join(' ')}
    >
      {isFeedback ? (
        <>
          <span className="img-slot__wash" aria-hidden="true" />
          <span className="img-slot__halo" aria-hidden="true" />
          {iconNode != null && (
            <span className="img-slot__icon" aria-hidden="true">
              {iconNode}
            </span>
          )}
        </>
      ) : children != null ? (
        <span className="img-slot__media">{children}</span>
      ) : (
        <span className="img-slot__placeholder" aria-hidden="true">
          {icon}
        </span>
      )}
    </div>
  );
});
