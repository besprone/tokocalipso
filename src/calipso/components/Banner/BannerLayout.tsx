import type { HTMLAttributes, ReactNode } from 'react';
import './BannerLayout.css';

export type BannerLayoutProps = {
  /** Slot izquierdo — icono (ver `FeedbackBanner`). */
  leading?: ReactNode;
  /** Texto pequeño sobre el headline (ver `MarketingBanner`). */
  eyebrow?: ReactNode;
  /** Mensaje principal (Body/md, negrita). */
  headline: ReactNode;
  /** Texto secundario opcional bajo el headline (Body/sm). */
  supporting?: ReactNode;
  /** Fila bajo el texto — acciones (`FeedbackBanner`) o el CTA affordance (`MarketingBanner`). */
  bottomRow?: ReactNode;
  /** Slot derecho — ilustración (ver `MarketingBanner`). */
  trailing?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * BannerLayout — shell interno compartido por `FeedbackBanner` y
 * `MarketingBanner`. Figma: `_building_blocks_layout_banner` — subconjunto:
 * solo los slots (`leading`/`eyebrow`/`bottomRow`/`trailing`) que alguno de
 * los dos patrones usa hoy; no expone `indicator` ni `actions` como slot
 * genérico separado de `bottomRow` (ninguno de los dos consumidores actuales
 * los necesita distintos de lo que ya resuelve `bottomRow`).
 *
 * **Building block interno — no se exporta desde `Banner/index.ts` ni se usa
 * suelto**, igual que su equivalente en Figma ("nunca se usan directamente
 * en pantallas de producto, solo instanciados dentro del patrón que
 * componen").
 */
export function BannerLayout({
  leading,
  eyebrow,
  headline,
  supporting,
  bottomRow,
  trailing,
  className,
  ...props
}: BannerLayoutProps) {
  return (
    <div {...props} className={['banner-layout', className].filter(Boolean).join(' ')}>
      {leading != null && <span className="banner-layout__leading">{leading}</span>}
      <div className="banner-layout__body">
        <div className="banner-layout__text">
          {eyebrow != null && <p className="banner-layout__eyebrow">{eyebrow}</p>}
          <p className="banner-layout__headline">{headline}</p>
          {supporting != null && <p className="banner-layout__supporting">{supporting}</p>}
        </div>
        {bottomRow}
      </div>
      {trailing != null && <span className="banner-layout__trailing">{trailing}</span>}
    </div>
  );
}
