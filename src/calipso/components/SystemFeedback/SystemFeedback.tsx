import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ButtonActions } from '../ButtonActions/ButtonActions';
import './SystemFeedback.css';

export type SystemFeedbackEmphasis = 'low' | 'high';
export type SystemFeedbackState = 'empty' | 'success';
export type SystemFeedbackSize = 'sm' | 'md';

export type SystemFeedbackProps = {
  /**
   * `low` — tratamiento compacto en línea (icono de 56px, label `Body/lg`,
   * acciones en fila). `high` — pantalla/sección completa (banda visual de
   * 160px, label grande, CTA apiladas). Es el único switch de layout.
   * Default `high`.
   */
  emphasis?: SystemFeedbackEmphasis;
  /**
   * Tipo semántico del feedback — no cambia el layout. Se expone como
   * `data-state` para estilos/analítica del consumidor. Default `empty`.
   */
  state?: SystemFeedbackState;
  /**
   * Solo aplica a `emphasis="high"`: `sm` se adapta al ancho (móvil, banda
   * de texto `Headline/sm`); `md` limita a 480px (web, `Display/sm`).
   * Ignorado en `low` (siempre compacto). Default `sm`.
   */
  size?: SystemFeedbackSize;
  /**
   * Marca el feedback como asociado a un evento transaccional — no cambia el
   * layout, se expone como `data-transaction`. El detalle de la transacción
   * va en el slot `content`. Default `false`.
   */
  transaction?: boolean;
  /**
   * Slot visual — ilustración, imagen o icono. `high` → banda a lo ancho de
   * 160px (recorte `cover`); `low` → cuadro de 56px centrado. Pasá la imagen
   * ya con el aspect ratio correcto (o un wrapper propio) si no querés que
   * recorte.
   */
  media?: ReactNode;
  /** Mensaje principal — una sola línea corta. `Body/lg` en `low`, `Headline/sm` (`sm`) o `Display/sm` (`md`) en `high`. */
  label?: ReactNode;
  /** Texto secundario breve bajo el label. `Body/md` (`low`·`high sm`) · `Body/lg` (`high md`). */
  supporting?: ReactNode;
  /**
   * Slot de contenido contextual (lista breve, card, detalle de transacción).
   * Va a lo ancho entre el texto y las acciones. Orientado a `high`.
   */
  content?: ReactNode;
  /**
   * 1–3 `<Button>` — el primario suele ir último (más cerca del pulgar).
   * `SystemFeedback` los envuelve en `<ButtonActions>`: `surface="screen"`
   * (apiladas a lo ancho) en `high`, `surface="feedbackState"` (fila centrada)
   * en `low`. Tamaño de `Button` por `size`: `low` → `xs` · `high sm` → `sm` ·
   * `high md` → `md`.
   */
  actions?: ReactNode;
  /**
   * Solo `emphasis="high"` + `size="sm"`: el cuerpo crece y se centra, y las
   * acciones quedan al pie (patrón de pantalla completa — el contenedor
   * padre debe tener alto). Default `true`; ignorado en `md` y en `low`.
   */
  sticky?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'content'>;

/**
 * SystemFeedback — patrón de layout para pantallas o secciones de feedback del
 * sistema (empty states, success states, mensajes informativos). Figma:
 * `pattern_system_feedback`.
 *
 * Combina un slot visual + bloque de texto (label + supporting) + slot de
 * contenido opcional + grupo de acciones, en un orden vertical fijo. `emphasis`
 * elige entre el tratamiento compacto (`low`) y el de pantalla completa
 * (`high`); `size` sólo escala la tipografía/espaciado de `high`. Todo lo
 * demás son slots — el patrón no aporta lógica ni tokens propios.
 */
export const SystemFeedback = forwardRef<HTMLDivElement, SystemFeedbackProps>(
  function SystemFeedback(
    {
      emphasis = 'high',
      state = 'empty',
      size = 'sm',
      transaction = false,
      media,
      label,
      supporting,
      content,
      actions,
      sticky,
      className,
      ...props
    },
    ref,
  ) {
    const isSticky = emphasis === 'high' && size === 'sm' && (sticky ?? true);
    const hasText = label != null || supporting != null;
    const hasTextGroup = hasText || content != null;

    return (
      <div
        {...props}
        ref={ref}
        data-emphasis={emphasis}
        data-state={state}
        data-size={size}
        data-transaction={transaction || undefined}
        data-sticky={isSticky || undefined}
        className={['system-feedback', className].filter(Boolean).join(' ')}
      >
        <div className="system-feedback__body">
          {media != null && <div className="system-feedback__media">{media}</div>}
          {hasTextGroup && (
            <div className="system-feedback__text-group">
              {hasText && (
                <div className="system-feedback__text">
                  {label != null && <p className="system-feedback__label">{label}</p>}
                  {supporting != null && (
                    <p className="system-feedback__supporting">{supporting}</p>
                  )}
                </div>
              )}
              {content != null && <div className="system-feedback__content">{content}</div>}
            </div>
          )}
        </div>
        {actions != null && (
          <ButtonActions
            surface={emphasis === 'high' ? 'screen' : 'feedbackState'}
            className="system-feedback__actions"
          >
            {actions}
          </ButtonActions>
        )}
      </div>
    );
  },
);
