import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './AppBar.css';

export type AppBarSize = 'sm' | 'md' | 'lg';
export type AppBarLayout = 'inline' | 'stacked';
export type AppBarElevation = 'flat' | 'raised';

/** Presets de layout/spacing de Figma (`patterns_app_bar` → prop `configuration`). */
export type AppBarConfiguration =
  | 'home'
  | 'home-settings'
  | 'navigation'
  | 'dialog'
  | 'search'
  | 'section'
  | 'resumen-de-saldos'
  | 'dos-columnas';

/** Configs cuyo `layout` por defecto es `stacked`. */
const STACKED_CONFIGS = new Set<AppBarConfiguration>(['dialog']);
/** Configs cuya `elevation` por defecto es `raised`. */
const RAISED_CONFIGS = new Set<AppBarConfiguration>(['dos-columnas']);

export type AppBarProps = {
  /** `sm` (móvil, 64px, headline 22) · `md` (84px, headline 28) · `lg` (84px, headline 28, más aire). Default `sm`. */
  size?: AppBarSize;
  /**
   * `inline` — leading · texto · trailing en una fila.
   * `stacked` — fila de acciones (leading + trailing) y el texto debajo, a lo ancho.
   * Default `inline` (o `stacked` si `configuration="dialog"`).
   */
  layout?: AppBarLayout;
  /** `flat` (sin fondo) · `raised` (fondo `bg/surface` + sombra `elevation-2`, estado on-scroll). Default `flat` (o `raised` si `configuration="dos-columnas"`). */
  elevation?: AppBarElevation;
  /**
   * **Capa opcional** — preset de la variante de Figma. Ajusta `layout` /
   * `elevation` por defecto y el padding / ancho del contenido. Los slots
   * siguen siendo la API de contenido. Sin definir = el shell plano.
   *
   * - `home` · `home-settings` · `resumen-de-saldos` → shell `inline`, sin overrides.
   * - `navigation` → `inline`; en `stacked` centra el contenido (~480px).
   * - `dialog` → fuerza `stacked` + contenido centrado + más aire vertical (12/16).
   * - `search` → `inline` sin bloque de texto (el `SearchField` va en `trailing`).
   * - `section` → `inline` con `padding-inline` ancho (40).
   * - `dos-columnas` → `inline` centrado ancho + `elevation="raised"` por defecto.
   */
  configuration?: AppBarConfiguration;
  /** Slot izquierdo — normalmente un `IconButton` (back / menú) o un `Brand`. */
  leading?: ReactNode;
  /** Título de la vista. `Headline/xs` en `sm`, `Display/sm` en `md`/`lg`. */
  headline?: ReactNode;
  /** Texto secundario bajo el headline (`Body/sm` en `sm`, `Body/lg` en `md`/`lg`). */
  supporting?: ReactNode;
  /** Muestra el bloque de texto. Default: `true` si hay `headline` o `supporting`. */
  showHeadline?: boolean;
  /**
   * Slot derecho — acciones secundarias alineadas al final: hasta 3 `IconButton`,
   * un `Button`, un `SearchField`, un `Avatar` / `AvatarAction`. Nunca la acción
   * crítica de la pantalla.
   */
  trailing?: ReactNode;
  /** Nombre accesible del `<header>`. */
  'aria-label'?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;

/**
 * AppBar — barra de navegación superior. Figma: `patterns_app_bar`.
 *
 * Orienta al usuario (título de la vista) y ofrece acción principal (`leading`,
 * normalmente back) + acciones secundarias (`trailing`). **No** es un contenedor
 * de contenido y **no** reemplaza al tab bar. Las `configuration` de Figma se
 * pueden pasar por la prop (capa opcional) o componerse con `layout`/`size` +
 * slots. El posicionamiento fijo y la elevación on-scroll son del consumidor
 * (ver stories `En contexto` / `Colapsada ↔ expandida`).
 */
export const AppBar = forwardRef<HTMLElement, AppBarProps>(function AppBar(
  {
    size = 'sm',
    layout: layoutProp,
    elevation: elevationProp,
    configuration,
    leading,
    headline,
    supporting,
    showHeadline,
    trailing,
    className,
    ...props
  },
  ref,
) {
  const layout: AppBarLayout =
    layoutProp ?? (configuration && STACKED_CONFIGS.has(configuration) ? 'stacked' : 'inline');
  const elevation: AppBarElevation =
    elevationProp ?? (configuration && RAISED_CONFIGS.has(configuration) ? 'raised' : 'flat');

  const showText = showHeadline ?? (headline != null || supporting != null);
  const hasText =
    configuration !== 'search' && showText && (headline != null || supporting != null);

  const text = hasText ? (
    <div className="app-bar__text">
      {headline != null && <p className="app-bar__headline">{headline}</p>}
      {supporting != null && <p className="app-bar__supporting">{supporting}</p>}
    </div>
  ) : null;

  return (
    <header
      {...props}
      ref={ref}
      data-size={size}
      data-layout={layout}
      data-elevation={elevation}
      data-configuration={configuration}
      className={['app-bar', className].filter(Boolean).join(' ')}
    >
      <div className="app-bar__row">
        {leading != null && <div className="app-bar__leading">{leading}</div>}
        {layout === 'inline' && text}
        {trailing != null && <div className="app-bar__trailing">{trailing}</div>}
      </div>
      {layout === 'stacked' && text}
    </header>
  );
});
