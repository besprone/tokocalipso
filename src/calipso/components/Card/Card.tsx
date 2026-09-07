import { forwardRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { CheckmarkFilled } from '@carbon/icons-react';
import './Card.css';

export type CardElevation = 'flat' | 'raised';

export type CardProps = {
  /**
   * `false` (default) → contenedor estático. `true` → clickable: estados
   * hover (solo con cursor) / pressed / focus, `role="button"` y navegación
   * por teclado (Enter / Espacio).
   */
  interactive?: boolean;
  /**
   * Marca la card como elegida (fondo `brandSoft` + borde `brand` + check).
   * Solo aplica con `interactive`. Añade `data-selected` para estilar; la
   * semántica ARIA de selección (`aria-pressed` / `aria-checked` / `aria-current`)
   * la define el consumidor según su patrón (toggle, radio-group…).
   */
  selected?: boolean;
  /** `flat` → sin sombra (elevation-0). `raised` → elevation-2. Default `flat`. */
  elevation?: CardElevation;
  /**
   * Contenido opcional que se monta **sobre el borde superior**, centrado
   * (ej. `<Badge>`). Independiente del estado de interacción.
   */
  badge?: ReactNode;
  /** El slot: cualquier composición del sistema de diseño. */
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * Card — contenedor estructural para agrupar contenido dentro de un layout.
 * Figma: `components_card`. Define **superficie, radio, elevación e
 * interacción**; **no** define estilos internos del contenido: eso lo delega
 * al slot (`children`), que se renderiza a ras y se recorta al radio de 16px
 * (`overflow: clip`).
 *
 * No usar como sustituto de botón ni de acción primaria.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, selected = false, elevation = 'flat', badge, children, className, role, tabIndex, onKeyDown, ...props },
  ref,
) {
  const isSelected = interactive && selected;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!interactive || e.defaultPrevented) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  return (
    <div
      {...props}
      ref={ref}
      className={['card', className].filter(Boolean).join(' ')}
      data-elevation={elevation}
      data-interactive={interactive || undefined}
      data-selected={isSelected || undefined}
      role={interactive ? (role ?? 'button') : role}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      onKeyDown={handleKeyDown}
    >
      {badge != null && <div className="card__badge">{badge}</div>}
      <div className="card__surface">
        {children}
        {isSelected && (
          <span className="card__check" aria-hidden="true">
            <CheckmarkFilled size={20} />
          </span>
        )}
      </div>
    </div>
  );
});
