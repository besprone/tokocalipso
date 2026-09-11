import type { HTMLAttributes, ReactNode } from 'react';
import { Card } from '../Card/Card';
import { BannerLayout } from './BannerLayout';
import { CtaAffordance } from './CtaAffordance';
import './MarketingBanner.css';

export type MarketingBannerAccent = 'mint' | 'orchid';

export type MarketingBannerAffordance = {
  label: ReactNode;
  /** Icono opcional a la izquierda del label. */
  icon?: ReactNode;
  onClick?: () => void;
};

export type MarketingBannerProps = {
  /** Acento de campaña — fondo teñido. `mint` = campaña principal, `orchid` = secundaria. Default `mint`. */
  accent?: MarketingBannerAccent;
  /** Texto pequeño opcional sobre el headline (nombre de campaña, vigencia…). */
  eyebrow?: ReactNode;
  /** Mensaje principal (Body/md, negrita). */
  headline: ReactNode;
  /** Texto secundario opcional bajo el headline (Body/sm, hasta 3 líneas). */
  supporting?: ReactNode;
  /** CTA única del banner — chip `bg/neutralSoft` (fijo, no varía por `accent`). */
  affordance: MarketingBannerAffordance;
  /** Ilustración a la derecha (imagen ya recortada/aspect-ratio correcto). */
  trailing?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * MarketingBanner — patrón promocional para campañas/oportunidades
 * estratégicas. Figma: `pattern_app_marketing_banner`. Instancia `Card`
 * (`elevation="flat"`, estática) + `BannerLayout` (shell interno compartido
 * con `FeedbackBanner`) con el fondo teñido según `accent`.
 *
 * Solo un banner promocional visible por viewport como promoción principal;
 * no competir con otros banners del mismo peso visual. No usar para estados
 * de error/sistema — para eso, `FeedbackBanner`.
 */
export function MarketingBanner({
  accent = 'mint',
  eyebrow,
  headline,
  supporting,
  affordance,
  trailing,
  className,
  ...props
}: MarketingBannerProps) {
  return (
    <Card
      {...props}
      elevation="flat"
      data-accent={accent}
      className={['marketing-banner', className].filter(Boolean).join(' ')}
    >
      <BannerLayout
        eyebrow={eyebrow}
        headline={headline}
        supporting={supporting}
        bottomRow={
          <CtaAffordance
            scheme="neutral"
            size="sm"
            icon={affordance.icon}
            label={affordance.label}
            onClick={affordance.onClick}
          />
        }
        trailing={trailing}
      />
    </Card>
  );
}
