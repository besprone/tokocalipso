/**
 * Seguimiento en tiempo real de "Identificación y autenticación" (nodo
 * 25:15845 en Figma — 5 estados: Enlace enviado, Celular confirmado, INE
 * recibida, Biometría completada, Autenticación completa).
 *
 * Simula que el cliente va completando los pasos en su propio teléfono, sin
 * que el asesor haga nada — el estado avanza solo mientras la pantalla está
 * en pantalla (ver SeguimientoIdentificacion.tsx).
 */

export const pasosIdentificacion = [
  { id: 'telefono', nombre: 'Validar teléfono', supporting: 'Código de 6 dígitos (OTP)' },
  { id: 'ine', nombre: 'Carga de INE', supporting: 'Frente y reverso' },
  // Figma trae "Salfie" — se corrige a "Selfie", es un error tipográfico
  // evidente del propio diseño, no una decisión de contenido.
  { id: 'biometricos', nombre: 'Biométricos', supporting: 'Selfie de validación de identidad' },
  { id: 'carta', nombre: 'Carta de consulta al portal', supporting: 'Firma en pantalla' },
] as const;

export type PasoIdentificacionId = (typeof pasosIdentificacion)[number]['id'];

export type EstadoSeguimiento = {
  headline: string;
  supporting: string;
  /** Índice del paso que está "en curso" ahora mismo — `null` si ya no queda
   *  ninguno (todos completados). */
  pasoActivo: number | null;
  /** El banner "puedes completar los pasos tú mismo" solo aplica mientras el
   *  INE todavía no llega — después, la acción alternativa cambia de sentido
   *  (revisar lo ya recibido, no capturar desde cero). */
  mostrarBanner: boolean;
  cta: string;
};

export const estadosSeguimiento: EstadoSeguimiento[] = [
  {
    headline: 'Enlace enviado',
    supporting:
      'Le enviamos un enlace por WhatsApp a tu cliente. Cuando confirme en su teléfono, los pasos se irán completando aquí automáticamente.',
    pasoActivo: 0,
    mostrarBanner: true,
    cta: 'Capturar aquí con tu cliente',
  },
  {
    headline: 'Celular confirmado',
    supporting: 'Tu cliente confirmó su número. Ahora está cargando su INE.',
    pasoActivo: 1,
    mostrarBanner: true,
    cta: 'Capturar aquí con tu cliente',
  },
  {
    headline: 'INE recibida',
    supporting: 'Ya tenemos el INE de tu cliente. Los biométricos y la firma de la carta siguen en proceso.',
    pasoActivo: 2,
    mostrarBanner: false,
    cta: 'Continuar con los datos del INE',
  },
  {
    headline: 'Biometría completada',
    supporting: 'Ya tenemos el INE y la biometría de tu cliente. Solo falta que firme la carta de consulta.',
    pasoActivo: 3,
    mostrarBanner: false,
    cta: 'Continuar con los datos del INE',
  },
  {
    headline: 'Autenticación completa',
    supporting: 'Recibimos la verificación, biometría y firma de la carta de tu cliente. Revisa los datos y continúa.',
    pasoActivo: null,
    mostrarBanner: false,
    cta: 'Continuar',
  },
];

export const ULTIMO_ESTADO = estadosSeguimiento.length - 1;

/**
 * Estado de un paso dado el índice del estado actual, con los mismos nombres
 * que `StatusBadgeStatus` del DS (`ItemLeading type="statusBadge"`) — así se
 * pasa directo, sin traducir.
 */
export function estadoDelPaso(
  indicePaso: number,
  indiceEstadoActual: number,
): 'pending' | 'processing' | 'completed' {
  const activo = estadosSeguimiento[indiceEstadoActual].pasoActivo;
  if (activo === indicePaso) return 'processing';
  if (activo === null || indicePaso < activo) return 'completed';
  return 'pending';
}
