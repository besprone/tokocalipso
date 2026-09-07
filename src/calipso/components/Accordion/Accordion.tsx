import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Accordion.css';

export type AccordionType = 'segmented' | 'paymentStatus';

export type AccordionProps = {
  /**
   * `segmented` (def.) — separación visual entre items (`space-25`), para
   * contenido general. `paymentStatus` — items contiguos (gap 0), para que
   * el `PaymentStatusIndicator` de cada item forme un timeline continuo.
   */
  type?: AccordionType;
  /** `AccordionItem` (múltiples). Cada uno controla su propio expandido/colapsado. */
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Accordion — agrupa varios `AccordionItem` en secciones colapsables.
 * Figma: `pattern_accordion`.
 *
 * Organiza información en bloques jerárquicos, reduciendo la carga visual
 * inicial. Cada item se expande/colapsa de forma independiente — por
 * default pueden estar varios abiertos a la vez. Mínimo 2 items para que
 * tenga sentido como accordion.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { type = 'segmented', children, className, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={['accordion', className].filter(Boolean).join(' ')}
      data-type={type}
    >
      {children}
    </div>
  );
});
