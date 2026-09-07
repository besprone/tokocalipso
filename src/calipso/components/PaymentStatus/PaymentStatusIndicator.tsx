import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Checkmark } from '@carbon/icons-react';
import './PaymentStatusIndicator.css';

export type PaymentStatusValue = 'future' | 'next' | 'paid' | 'offer';
export type PaymentStatusPosition = 'first' | 'middle' | 'last';

export type PaymentStatusIndicatorProps = {
  /** Estado del pago. `future` = pendiente (gris) · `next` = próximo (anillo verde) · `paid` = completado (check verde) · `offer` = pago especial/promocional (gris, mismo trato visual que `future`). */
  status: PaymentStatusValue;
  /**
   * Con `showIcon=true` (header): `first` → sin línea antes · `last` → sin
   * línea después · `middle` (def.) → línea a ambos lados.
   * Con `showIcon=false` (puente, ver `contentLeading` de `AccordionItem`):
   * el tramo es uno solo, sin split antes/después (no hay círculo en
   * medio) — invisible completo solo en `last` (el final real del
   * timeline); visible completo en `first`/`middle`, porque siempre
   * continúa desde el propio header de ese mismo item.
   */
  position?: PaymentStatusPosition;
  /**
   * `true` (def.) → círculo + líneas (uso en el header del item). `false` →
   * solo la línea, sin círculo — para continuar el timeline a través del
   * área de contenido expandida de un `AccordionItem`.
   */
  showIcon?: boolean;
  /**
   * Número de pago mostrado dentro del círculo — reemplaza el ícono en
   * `future`/`offer` (mismo círculo gris, con el número en vez de vacío).
   * Sin efecto en `next`/`paid`, que siempre muestran su propio ícono.
   */
  number?: ReactNode;
  /**
   * Status del item ANTERIOR en la secuencia (solo relevante con
   * `showIcon=true`). Si es `paid`/`next`, la línea de "antes" de ESTE item
   * se pinta verde (como `next`) en vez de con el status propio — refleja
   * que el recorrido hasta aquí ya se completó, aunque este item en
   * concreto todavía esté `future`. Deliberadamente NO es el
   * comportamiento del componente base en Figma (que pinta cada tramo solo
   * con su propio status, sin mirar al vecino) — decisión explícita de
   * producto. Sin efecto en `contentLeading` (`showIcon=false`), que sigue
   * reflejando únicamente el status propio del item.
   */
  previousStatus?: PaymentStatusValue;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * PaymentStatusIndicator — unidad vertical de un timeline de estados de
 * pago: ícono de estado + líneas de conexión arriba/abajo. Figma:
 * `_building_block_paymentstatus` (+ `_building_block_paymentstatus_line`).
 *
 * Puramente visual — no es interactivo y no debe ser el único indicador de
 * estado (acompañar con texto). Pensado para apilarse verticalmente (p. ej.
 * como `leading` de varios `AccordionItem` en secuencia, con `Accordion
 * type="paymentStatus"` para que los items queden contiguos y la línea se
 * vea continua).
 */
export const PaymentStatusIndicator = forwardRef<HTMLDivElement, PaymentStatusIndicatorProps>(
  function PaymentStatusIndicator(
    { status, position = 'middle', showIcon = true, number, previousStatus, className, ...props },
    ref,
  ) {
    // El header (showIcon=true) tiene un círculo entre dos tramos
    // independientes: el de antes se corta en `first` (nada arriba de todo
    // el timeline), el de después en `last` (nada abajo). El puente del área
    // expandida (showIcon=false) no tiene círculo — es un solo tramo
    // continuo por item, y Figma lo hace transparente completo únicamente
    // en `last` (el final real del timeline); en `first`/`middle` va visible
    // de punta a punta, porque siempre continúa desde el propio header de
    // ese mismo item.
    //
    // El tramo "antes" del header, además, refleja el status del item
    // ANTERIOR cuando ya se resolvió (paid/next) — ver `previousStatus`.
    const beforeStatus =
      showIcon && (previousStatus === 'paid' || previousStatus === 'next') ? previousStatus : status;
    const lineBeforeStatus = !showIcon
      ? position === 'last'
        ? 'transparent'
        : status
      : position === 'first'
        ? 'transparent'
        : beforeStatus;
    const lineAfterStatus = position === 'last' ? 'transparent' : status;

    return (
      <div
        {...props}
        ref={ref}
        className={['payment-status-indicator', className].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        <span className="payment-status-indicator__line" data-status={lineBeforeStatus} />
        {showIcon && (
          <span className="payment-status-indicator__icon" data-status={status}>
            {status === 'paid' && (
              <Checkmark className="payment-status-indicator__check" />
            )}
            {(status === 'future' || status === 'offer') && number != null && (
              <span className="payment-status-indicator__number">{number}</span>
            )}
          </span>
        )}
        <span className="payment-status-indicator__line" data-status={lineAfterStatus} />
      </div>
    );
  },
);
