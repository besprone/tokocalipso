import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { resolveBrandArt } from './brandArt';
import './Brand.css';

export type BrandType = 'primary' | 'secondary' | 'imagotype';
export type BrandVariant = 'original' | 'one' | 'two' | 'white' | 'gray';
export type BrandName = 'kubo' | 'maestro';
export type BrandSize = 'sm' | 'md' | 'lg';

const ACCESSIBLE_NAME: Record<BrandName, string> = {
  kubo: 'kubo.financiero',
  maestro: 'Crédito Maestro',
};

export type BrandProps = {
  /** `primary` (lockup completo) · `secondary` (isotipo/badge) · `imagotype` (lettermark). Default `primary`. */
  type?: BrandType;
  /**
   * Tratamiento de color. `original` (marca) · `one` (sobre fondo tenue/oscuro) ·
   * `two` (monocromo verde) · `white` (todo blanco, para fondos oscuros) ·
   * `gray` (monocromo gris). Default `original`. Solo aplica a `brand="kubo"` —
   * `maestro` solo tiene `original`.
   */
  variant?: BrandVariant;
  /** `kubo` (default) · `maestro`. */
  brand?: BrandName;
  /** Alto del logo: `sm` 16 · `md` 24 · `lg` 32. El ancho se ajusta al ratio. Default `md`. */
  size?: BrandSize;
  /**
   * Nombre accesible. Por defecto el nombre de la marca. Pasa `""` (o
   * `decorative`) para marcarlo decorativo (`aria-hidden`).
   */
  title?: string;
  /** Marca el logo como decorativo (`aria-hidden`, sin rol). */
  decorative?: boolean;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'title'>;

/**
 * Brand — logos de marca (kubo · maestro). Figma: `brand_assets_kugo_logo`.
 *
 * SVG inline: para `kubo` el `variant` recolorea los slots (mark / word / accent)
 * vía CSS; `maestro` es ilustración fija (solo `original`). `size` fija el alto,
 * el ancho sale del ratio del lockup. **No** es interactivo — envuélvelo en un
 * `<a>` / `Link` si debe navegar.
 */
export const Brand = forwardRef<HTMLSpanElement, BrandProps>(function Brand(
  {
    type = 'primary',
    variant = 'original',
    brand = 'kubo',
    size = 'md',
    title,
    decorative = false,
    className,
    ...props
  },
  ref,
) {
  const art = resolveBrandArt(brand, type);
  const isDecorative = decorative || title === '';
  const label = title || ACCESSIBLE_NAME[brand];
  const effectiveVariant = art.recolorable ? variant : 'original';

  return (
    <span
      {...props}
      ref={ref}
      data-brand={brand}
      data-type={type}
      data-variant={effectiveVariant}
      data-size={size}
      className={['brand', className].filter(Boolean).join(' ')}
      role={isDecorative ? undefined : 'img'}
      aria-label={isDecorative ? undefined : label}
      aria-hidden={isDecorative ? true : undefined}
    >
      <svg
        className="brand__svg"
        viewBox={art.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        aria-hidden="true"
      >
        {art.node}
      </svg>
    </span>
  );
});
