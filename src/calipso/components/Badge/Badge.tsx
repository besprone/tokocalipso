import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

export type BadgeSemantic =
  | 'success'
  | 'neutral'
  | 'info'
  | 'warning'
  | 'error'
  | 'accentPrimary'
  | 'accentSecondary';

export type BadgeVariant = 'soft' | 'outline' | 'filled';
export type BadgeSize = 'xxs' | 'xs' | 'md';
export type BadgeType = 'text' | 'circle';

export type BadgeProps = {
  /** Intención visual / significado. Default `neutral`. */
  semantic?: BadgeSemantic;
  /** Tratamiento de superficie. `soft` (fondo tenue) · `outline` (contorno sobre surface) · `filled` (sólido). Default `soft`. */
  variant?: BadgeVariant;
  /** Escala. `xxs` compacto · `xs` estándar · `md` texto 12px. Default `xs`. Ignorado para `type="circle"` (siempre 6px). */
  size?: BadgeSize;
  /** `text` (label + leading opcional) · `circle` (solo punto de color, sin texto). Default `text`. */
  type?: BadgeType;
  /** Texto del badge. Solo para `type="text"`. */
  label?: ReactNode;
  /** Ícono/elemento antes del label (12px en xxs/xs, 16px en md). Solo para `type="text"`. */
  leading?: ReactNode;
  /** Muestra el slot leading. Default: `true` si se pasó `leading`. */
  showLeading?: boolean;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>;

/**
 * Badge — elemento informativo compacto que comunica estado, categoría o énfasis
 * contextual. Figma: `components_badge`. **No es interactivo**: no reemplaza
 * botones ni chips seleccionables, y no debe ser el único indicador de un estado
 * crítico.
 *
 * `accentPrimary` / `accentSecondary` son acentos de marca (kubo: mint / orchid)
 * para énfasis estratégico (promos, recomendaciones), no para estado funcional.
 *
 * Figma trae `variant="filled"` solo para success/info/error/accentPrimary/
 * accentSecondary; el DS lo extiende a `warning` (texto oscuro sobre ámbar) y
 * `neutral` (`bg/neutral`) para mantener la API regular.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    semantic = 'neutral',
    variant = 'soft',
    size = 'xs',
    type = 'text',
    label,
    leading,
    showLeading,
    className,
    ...props
  },
  ref,
) {
  const withLeading = showLeading ?? leading != null;

  return (
    <span
      {...props}
      ref={ref}
      data-semantic={semantic}
      data-variant={variant}
      data-size={size}
      data-type={type}
      className={['badge', className].filter(Boolean).join(' ')}
    >
      {type === 'text' && (
        <>
          {withLeading && leading != null && (
            <span className="badge__leading" aria-hidden="true">
              {leading}
            </span>
          )}
          <span className="badge__label">{label}</span>
        </>
      )}
    </span>
  );
});
