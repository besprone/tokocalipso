/**
 * Catálogo de dependencias y convenios.
 *
 * Derivado de la hoja `Convenios CM` del libro de migración. Se copia aquí
 * SOLO lo que la pantalla necesita para funcionar: el nombre visible y qué
 * tipos de firma admite cada convenio.
 *
 * Deliberadamente NO se incluye nada más de esa hoja — tasas, montos, plazos,
 * capacidad, tipo de empleado, estatus de migración ni comentarios internos.
 * Si algo de eso hace falta en el futuro, va por API, no en el repo.
 *
 * En el lenguaje del negocio: "dependencia" es el estado y "convenio" es la
 * entidad dentro de ese estado.
 */

export type Convenio = {
  nombre: string;
  /** Al menos una de las dos es true, salvo los convenios sin firma disponible. */
  firmaAutografa: boolean;
  firmaDigital: boolean;
};

export type Dependencia = {
  nombre: string;
  convenios: Convenio[];
};

export const dependencias: Dependencia[] = [
  {
    nombre: "Baja California Norte",
    convenios: [
      { nombre: "Educación Baja California", firmaAutografa: true, firmaDigital: true },
      { nombre: "Poder Judicial", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Campeche",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "CDMX",
    convenios: [
      { nombre: "Gobierno", firmaAutografa: true, firmaDigital: true },
      { nombre: "Educación", firmaAutografa: true, firmaDigital: true },
      { nombre: "PBI", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Chihuahua",
    convenios: [
      { nombre: "Salud", firmaAutografa: false, firmaDigital: false },
    ],
  },
  {
    nombre: "Estado de México",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Guerrero",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: false },
      { nombre: "Salud", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Hidalgo",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Michoacán",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: true },
      { nombre: "Salud", firmaAutografa: true, firmaDigital: false },
      { nombre: "Gobierno", firmaAutografa: true, firmaDigital: true },
      { nombre: "CECYT", firmaAutografa: false, firmaDigital: false },
    ],
  },
  {
    nombre: "Nacional",
    convenios: [
      { nombre: "IPN", firmaAutografa: true, firmaDigital: true },
      { nombre: "IMSS Ley", firmaAutografa: false, firmaDigital: true },
      { nombre: "IMSS Bienestar", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Nayarit",
    convenios: [
      { nombre: "Fiscalía", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Nuevo León",
    convenios: [
      { nombre: "Gobierno", firmaAutografa: false, firmaDigital: false },
    ],
  },
  {
    nombre: "Oaxaca",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: true },
      { nombre: "Gobierno", firmaAutografa: true, firmaDigital: false },
      { nombre: "Pensiones", firmaAutografa: true, firmaDigital: true },
    ],
  },
  {
    nombre: "Puebla",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: false },
      { nombre: "Magisterio", firmaAutografa: false, firmaDigital: false },
    ],
  },
  {
    nombre: "Querétaro",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: false },
      { nombre: "Magisterio", firmaAutografa: true, firmaDigital: false },
      { nombre: "Gobierno", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Quintana Roo",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: true },
    ],
  },
  {
    nombre: "San Luis Potosi",
    convenios: [
      { nombre: "Educación", firmaAutografa: true, firmaDigital: false },
    ],
  },
  {
    nombre: "Sonora",
    convenios: [
      { nombre: "Gobierno", firmaAutografa: false, firmaDigital: false },
    ],
  },
  {
    nombre: "Tabasco",
    convenios: [
      { nombre: "Colegio de Bachilleres", firmaAutografa: true, firmaDigital: false },
      { nombre: "Gobierno", firmaAutografa: false, firmaDigital: false },
    ],
  },
];

/** Un convenio sin ninguna firma disponible no permite iniciar solicitud. */
export function tieneFirmaDisponible(c: Convenio): boolean {
  return c.firmaAutografa || c.firmaDigital;
}
