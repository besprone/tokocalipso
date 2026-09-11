import type { ReactNode } from 'react';
import './CtaAffordance.css';

export type CtaAffordanceScheme = 'brand' | 'neutral';
export type CtaAffordanceSize = 'sm' | 'md';

export type CtaAffordanceProps = {
  /** `brand` (bg/brandSoft · text/brand) · `neutral` (bg/neutralSoft · text/neutral). Default `brand`. */
  scheme?: CtaAffordanceScheme;
  /** `sm` (16px icono, padding 8/4, radio 8) · `md` (20px icono, padding 12/6, radio 10). Default `sm`. */
  size?: CtaAffordanceSize;
  /** Icono opcional a la izquierda del label. */
  icon?: ReactNode;
  label: ReactNode;
  onClick?: () => void;
};

/**
 * CtaAffordance — chip de acción única del banner promocional. Figma:
 * `_building_blocks_app_banner_cta_affordance`. **Building block interno de
 * `MarketingBanner` — no se exporta desde `Banner/index.ts`.**
 */
export function CtaAffordance({ scheme = 'brand', size = 'sm', icon, label, onClick }: CtaAffordanceProps) {
  return (
    <button
      type="button"
      className="cta-affordance"
      data-scheme={scheme}
      data-size={size}
      onClick={onClick}
    >
      {icon != null && (
        <span className="cta-affordance__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="cta-affordance__label">{label}</span>
    </button>
  );
}
