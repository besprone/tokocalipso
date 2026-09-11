/**
 * Los cuatro bloques de "Inicia la solicitud de crédito" (nodo 13:438).
 * Compartido entre el índice (`BloquesSolicitud`) y cada pantalla de bloque,
 * para que el id sea el mismo en los dos lados.
 */
export const bloques = [
  { id: 'identificacion', nombre: 'Identificación y autenticación' },
  { id: 'oferta', nombre: 'Seleccionar oferta' },
  { id: 'informacion', nombre: 'Información de la solicitud' },
  { id: 'documentos', nombre: 'Documentos' },
] as const;

export type BloqueId = (typeof bloques)[number]['id'];

/**
 * El proceso son 5 pasos: elegir dependencia, convenio y firma —el paso
 * anterior a este índice— más los cuatro bloques. De ahí que se entre con
 * 20%. Se calcula, no se fija: el componente de Figma es estático y su valor
 * no es una regla.
 */
const PASOS_TOTALES = bloques.length + 1;

export function porcentaje(completados: number): number {
  return Math.round(((completados + 1) / PASOS_TOTALES) * 100);
}
