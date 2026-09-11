import type { HTMLAttributes, ReactNode } from 'react';
import { Information, CheckmarkOutline, Warning, WarningAlt } from '@carbon/icons-react';
import { Card } from '../Card/Card';
import { ButtonActions } from '../ButtonActions/ButtonActions';
import { BannerLayout } from './BannerLayout';
import './FeedbackBanner.css';

export type FeedbackBannerType = 'info' | 'success' | 'error' | 'warning';

// `error` → círculo con "!" (`Warning`, no `WarningAlt`) · `warning` →
// triángulo con "!" (`WarningAlt`). Nombres de Carbon contraintuitivos, pero
// coinciden con los assets de Figma (`ic_warning`/`ic_warning_alt`) — se
// confirmó comparando ambos icons renderizados, no por el nombre solo.
const ICON: Record<FeedbackBannerType, typeof Information> = {
  info: Information,
  success: CheckmarkOutline,
  error: Warning,
  warning: WarningAlt,
};

/** `error`/`warning` interrumpen → `alert` (asertivo); `info`/`success` informan → `status` (educado). */
const ROLE: Record<FeedbackBannerType, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  error: 'alert',
  warning: 'alert',
};

export type FeedbackBannerProps = {
  /** Tono semántico — fondo teñido, icono y rol ARIA. Default `info`. */
  type?: FeedbackBannerType;
  /** Mensaje principal (Body/md, negrita). */
  headline: ReactNode;
  /** Texto secundario opcional bajo el headline (Body/sm). */
  supporting?: ReactNode;
  /** 1–2 `<Button emphasis="ghost" size="xs">` — acciones alineadas a la derecha. */
  actions?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * FeedbackBanner — patrón de comunicación de estado dentro del dashboard.
 * Figma: `pattern_app_feedback_banner`. Instancia `Card` (`elevation="flat"`,
 * estática) + `BannerLayout` (shell interno compartido con `MarketingBanner`)
 * con el fondo teñido según `type`; **no** reemplaza a `SystemFeedback`
 * (pantalla/sección completa) ni al patrón de banner promocional
 * (`MarketingBanner` — contenido y tono son distintos, no intercambiables).
 *
 * No usar para contenido promocional ni para apilar varios banners del
 * mismo peso visual sin jerarquía clara.
 */
export function FeedbackBanner({
  type = 'info',
  headline,
  supporting,
  actions,
  className,
  ...props
}: FeedbackBannerProps) {
  const Icon = ICON[type];
  return (
    <Card
      {...props}
      elevation="flat"
      data-type={type}
      role={ROLE[type]}
      className={['feedback-banner', className].filter(Boolean).join(' ')}
    >
      <BannerLayout
        leading={
          <span className="feedback-banner__icon" aria-hidden="true">
            <Icon />
          </span>
        }
        headline={headline}
        supporting={supporting}
        bottomRow={
          actions != null && (
            <ButtonActions surface="dialog" className="feedback-banner__actions">
              {actions}
            </ButtonActions>
          )
        }
      />
    </Card>
  );
}
