import { forwardRef, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './AppBar.css';

type ScrollTarget = HTMLElement | Window;

function getScrollParent(node: HTMLElement | null): ScrollTarget {
  let el = node?.parentElement ?? null;
  while (el) {
    if (/(auto|scroll)/.test(getComputedStyle(el).overflowY)) return el;
    el = el.parentElement;
  }
  return window;
}

function getScrollTop(target: ScrollTarget): number {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

function getMaxScroll(target: ScrollTarget): number {
  const el = target instanceof Window ? (document.scrollingElement ?? document.documentElement) : target;
  return el.scrollHeight - el.clientHeight;
}

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
  /**
   * `true` — el propio AppBar resuelve el patrón "colapsar al bajar,
   * expandir al llegar al tope" (ver story `En contexto (scroll)`): `layout`
   * pasa a `inline` en cuanto el ancestro con scroll baja más de
   * `collapseThreshold` px, y vuelve a `stacked` solo al llegar al tope
   * (no en cualquier subida — igual que el patrón que reemplaza); `elevation`
   * pasa a `raised` en cuanto se despega del tope, antes de ese umbral.
   * Mientras está activo, ignora `layout`/`elevation` explícitos.
   *
   * También ancla la barra (`position: sticky; top: 0`) — colapsar solo
   * tiene sentido si la barra sigue visible mientras se scrollea; sin
   * anclaje propio, un consumidor sin wrapper sticky ve la barra colapsar Y
   * salirse de pantalla con el resto del contenido (`elevation="raised"`
   * quedaba aplicado a una barra que ya no estaba ahí). No es una prop
   * aparte — no hay uso razonable de `collapseOnScroll` sin sticky, sería
   * una combinación rota. El ancestro con scroll (el que se posiciona
   * `sticky` CONTRA) sigue siendo del consumidor. Default `false`.
   *
   * **Requiere `overflow-anchor: none` en el contenedor CON SCROLL del
   * consumidor.** El cambio de alto de la barra (stacked→inline) puede
   * disparar el scroll-anchoring del navegador, que "compensa" ese cambio
   * corrigiendo el `scrollTop` en el mismo instante — visualmente, el scroll
   * pega un salto hacia el tope justo cuando la barra colapsa. El AppBar ya
   * se excluye a sí mismo de ser el nodo ancla, pero eso no alcanza si el
   * navegador ancla en otro elemento del contenido; el fix real vive en el
   * contenedor con scroll, fuera del alcance del componente (ver story `En
   * contexto (scroll)`).
   *
   * Solo colapsa si el scroll restante alcanza a cubrir lo que el colapso
   * libera (alto expandido − alto colapsado) — si no, colapsar dejaría al
   * contenedor sin overflow, el navegador ajustaría `scrollTop` a 0 por su
   * cuenta, y sin este chequeo eso se leía como "llegó al tope" y
   * re-expandía, liberando el mismo scroll de nuevo: parpadeo en loop, y en
   * el caso límite (todo el scroll restante es justo lo que libera el
   * colapso) la barra quedaba colapsada sin forma de volver a expandirse, ni
   * scrolleando, porque ya no quedaba nada que scrollear. El alto colapsado
   * se mide contra el DOM real (un clon oculto en `layout="inline"`), no se
   * calcula — ver story `En contexto (scroll corto — sin parpadeo)`.
   */
  collapseOnScroll?: boolean;
  /** Umbral en px para colapsar (ver `collapseOnScroll`). Default `24`. */
  collapseThreshold?: number;
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
   * crítica de la pantalla. En `inline` con `headline`/`supporting` el slot se
   * queda a su ancho de contenido (no le roba espacio al título); en `stacked`
   * o en `inline` sin texto (config `search`) crece para alinear/expandir.
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
 * slots. El swap de `layout`/`elevation` al scrollear y el anclaje
 * (`position: sticky`) los resuelve `collapseOnScroll` (ver stories `En
 * contexto (scroll)` / `Colapsada ↔ expandida`); sin `collapseOnScroll`, el
 * posicionamiento sigue siendo del consumidor.
 */
export const AppBar = forwardRef<HTMLElement, AppBarProps>(function AppBar(
  {
    size = 'sm',
    layout: layoutProp,
    elevation: elevationProp,
    configuration,
    collapseOnScroll = false,
    collapseThreshold = 24,
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
  const headerRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [atTop, setAtTop] = useState(true);
  // Alto que tendría la barra en `layout="inline"` — medido contra un clon
  // oculto (ver más abajo), no calculado: depende del contenido real
  // (headline/supporting presentes o no, largo del texto) igual que el alto
  // expandido, que ya se mide directo del header real.
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);

  const setHeaderRef = (node: HTMLElement | null) => {
    headerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (!collapseOnScroll) return;
    const node = measureRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      if (node) setCollapsedHeight(node.getBoundingClientRect().height);
      return;
    }
    const ro = new ResizeObserver(() => setCollapsedHeight(node.getBoundingClientRect().height));
    ro.observe(node);
    return () => ro.disconnect();
  }, [collapseOnScroll]);

  // Mismo patrón que la story `En contexto (scroll)`: colapsa (stacked→inline)
  // al bajar más de `collapseThreshold`, expande solo al llegar al tope
  // (no en cualquier subida); `raised` apenas se despega del tope. El
  // ancestro con scroll se resuelve igual que `divider="auto"` de
  // `ButtonActions` — el default (`window`) sirve para scroll de página
  // completa, pero un contenedor `overflow` propio necesita resolverse
  // explícitamente o el listener nunca ve el scroll real.
  useEffect(() => {
    if (!collapseOnScroll) return;
    const target = getScrollParent(headerRef.current);
    let lastY = getScrollTop(target);
    const onScroll = () => {
      const y = getScrollTop(target);
      setAtTop(y <= 0);
      if (y > lastY && y > collapseThreshold) {
        // Solo colapsa si lo que sobra por scrollear alcanza a cubrir lo
        // que el colapso va a liberar — si no, colapsar dejaría al
        // contenedor sin overflow (ver JSDoc de `collapseOnScroll`).
        // `collapsedHeight == null` (el clon todavía no midió) cuenta como
        // "no alcanza": mejor no colapsar todavía que colapsar y quedar
        // atrapada.
        const expandedHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
        const freed = collapsedHeight == null ? Infinity : expandedHeight - collapsedHeight;
        if (getMaxScroll(target) >= freed) setCollapsed(true);
      } else if (y <= 0) {
        setCollapsed(false);
      }
      lastY = y;
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [collapseOnScroll, collapseThreshold, collapsedHeight]);

  const layout: AppBarLayout = collapseOnScroll
    ? (collapsed ? 'inline' : 'stacked')
    : (layoutProp ?? (configuration && STACKED_CONFIGS.has(configuration) ? 'stacked' : 'inline'));
  const elevation: AppBarElevation = collapseOnScroll
    ? (atTop ? 'flat' : 'raised')
    : (elevationProp ?? (configuration && RAISED_CONFIGS.has(configuration) ? 'raised' : 'flat'));

  const showText = showHeadline ?? (headline != null || supporting != null);
  const hasText =
    configuration !== 'search' && showText && (headline != null || supporting != null);

  const text = hasText ? (
    <div className="app-bar__text">
      {headline != null && <p className="app-bar__headline">{headline}</p>}
      {supporting != null && <p className="app-bar__supporting">{supporting}</p>}
    </div>
  ) : null;

  const header = (
    <header
      {...props}
      ref={setHeaderRef}
      data-size={size}
      data-layout={layout}
      data-elevation={elevation}
      data-configuration={configuration}
      data-sticky={collapseOnScroll || undefined}
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

  if (!collapseOnScroll) return header;
  return (
    <>
      {header}
      {/* Clon oculto SOLO para medir el alto real en `layout="inline"` — ver
          `collapsedHeight` arriba. `position:fixed` fuera de pantalla en vez
          de `display:none` (que no genera caja, imposible de medir);
          `visibility:hidden` lo saca del árbol de accesibilidad y de la
          interacción sin necesidad de duplicar `aria-hidden` a mano. */}
      <header
        ref={(node: HTMLElement | null) => {
          measureRef.current = node;
        }}
        aria-hidden="true"
        data-size={size}
        data-layout="inline"
        data-elevation="flat"
        data-configuration={configuration}
        className={['app-bar', className].filter(Boolean).join(' ')}
        style={{ position: 'fixed', top: -9999, left: -9999, visibility: 'hidden', pointerEvents: 'none' }}
      >
        <div className="app-bar__row">
          {leading != null && <div className="app-bar__leading">{leading}</div>}
          {text}
          {trailing != null && <div className="app-bar__trailing">{trailing}</div>}
        </div>
      </header>
    </>
  );
});
