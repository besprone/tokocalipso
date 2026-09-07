import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Link } from '../Link/Link';
import './Breadcrumbs.css';

export type BreadcrumbsSize = 'md' | 'lg';

export type BreadcrumbItem = {
  /** Texto del link navegable. */
  label: ReactNode;
  /** Destino. Se hace spread sobre el `<a>` interno junto con el resto de props. */
  href?: string;
  /** Key opcional para React (por defecto usa el índice). */
  key?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>;

export type BreadcrumbsProps = {
  /**
   * Links navegables, del origen hacia la página actual. **No** incluyas aquí la
   * página actual — va en `current`. Recomendado 1–3 (2–4 niveles con `current`).
   */
  items: BreadcrumbItem[];
  /** Nombre exacto de la página actual. Texto plano, **no interactivo**, siempre el último. */
  current: ReactNode;
  /** `md` (default) · `lg` — mayor inset horizontal, para más jerarquía visual. */
  size?: BreadcrumbsSize;
  /** Nombre accesible del `<nav>`. Default `Ruta de navegación`. */
  'aria-label'?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'aria-label'>;

/**
 * Breadcrumbs — indicador de ubicación jerárquica. Muestra la ruta desde el
 * origen hasta la página actual. Figma: `components_breadcrumbs`.
 *
 * Los items intermedios son instancias de `Link` (navegables); el separador `/`
 * es decorativo y el `current` es texto plano no interactivo. **Web/desktop** —
 * no usar en mobile (basta la navegación por back).
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, current, size = 'md', 'aria-label': ariaLabel = 'Ruta de navegación', className, ...props },
  ref,
) {
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={ariaLabel}
      data-size={size}
      className={['breadcrumbs', className].filter(Boolean).join(' ')}
    >
      <ol className="breadcrumbs__list">
        {items.map(({ label, key, ...linkProps }, i) => (
          <li key={key ?? i} className="breadcrumbs__item">
            <Link {...linkProps} className="breadcrumbs__link">
              {label}
            </Link>
            <span className="breadcrumbs__sep" aria-hidden="true">
              /
            </span>
          </li>
        ))}
        <li className="breadcrumbs__item breadcrumbs__item--current">
          <span className="breadcrumbs__current" aria-current="page">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
});
