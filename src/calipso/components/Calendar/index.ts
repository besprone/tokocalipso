export { Calendar } from './Calendar';
export type { CalendarProps, CalendarSize, CalendarSurface } from './Calendar';

// Los building blocks (`CalendarMenuButton`, `CalendarDayCell`, `CalendarYearCell`)
// son internos del Calendar y no se exportan al catálogo público. Se importan
// directamente por ruta solo en las stories para documentarlos.
