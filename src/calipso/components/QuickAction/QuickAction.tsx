import { useContext } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { QuickActionContext } from './quickActionContext';
import './QuickAction.css';

export type QuickActionEmphasis = 'primary' | 'secondary' | 'ghost';
export type QuickActionSize = 'sm' | 'lg';
export type QuickActionScheme = 'brand' | 'neutral';

export type QuickActionProps = {
  icon: ReactNode;
  /** Texto corto y accionable (máx. 2 líneas) — también es el nombre accesible del botón. */
  label: string;
  /** No cambia el tamaño — solo comunica prioridad. Un solo `primary` por grupo. */
  emphasis?: QuickActionEmphasis;
  size?: QuickActionSize;
  scheme?: QuickActionScheme;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

/**
 * QuickAction — acceso rápido a una acción clave (Home, Dashboard). Figma:
 * `patterns_quick_actions_single`.
 *
 * Todo el patrón (ícono + label debajo) es UN SOLO `<button>` — no anida un
 * `IconButton` completo adentro (un `<button>` dentro de otro es HTML
 * inválido, el navegador cierra el anidado y rompe el DOM). En su lugar
 * reproduce la estructura visual del `IconButton` `size="lg"` directamente
 * (mismo patrón que el chevron de `AccordionItem`) — así el hover/pressed/
 * clic cubren todo el bloque (ícono + label), sin clics muertos sobre el
 * texto. El label es `aria-hidden` y a la vez la fuente del `aria-label`
 * del botón — no hace falta pasarlo aparte.
 *
 * Patrón de solo presentación — no define lógica propia.
 */
export function QuickAction({
  icon,
  label,
  emphasis = 'primary',
  size,
  scheme,
  disabled,
  className,
  ...props
}: QuickActionProps) {
  const ctx = useContext(QuickActionContext);
  const resolvedSize = size ?? ctx?.size ?? 'sm';
  const resolvedScheme = scheme ?? ctx?.scheme ?? 'brand';

  return (
    <button
      {...props}
      type="button"
      disabled={disabled}
      aria-label={label}
      data-emphasis={emphasis}
      data-size={resolvedSize}
      data-scheme={resolvedScheme}
      className={['quick-action', className].filter(Boolean).join(' ')}
    >
      <span className="quick-action__icon-box">
        <span className="quick-action__icon-state">{icon}</span>
      </span>
      <p className="quick-action__label" aria-hidden="true">
        {label}
      </p>
    </button>
  );
}
