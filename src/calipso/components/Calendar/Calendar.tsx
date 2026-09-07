import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from '@carbon/icons-react';
import { IconButton } from '../IconButton/IconButton';
import { CalendarMenuButton } from './CalendarMenuButton';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarYearCell } from './CalendarYearCell';
import './Calendar.css';

export type CalendarSize = 'sm' | 'xs';
export type CalendarSurface = 'none' | 'card';

export type CalendarProps = {
  /** Fecha seleccionada (controlado). */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Mes visible al montar (no controlado). Default: `value` o hoy. */
  defaultMonth?: Date;
  minDate?: Date;
  maxDate?: Date;
  size?: CalendarSize;
  surface?: CalendarSurface;
  /** Locale para nombres de mes y días. Default `es-MX`. */
  locale?: string;
  /** 0 = domingo (default, como Figma), 1 = lunes. */
  weekStartsOn?: 0 | 1;
  className?: string;
  'aria-label'?: string;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isoKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const YEARS_PER_PAGE = 9;

/**
 * Calendario de selección de fecha (vista día / año). Figma: `components_calendar`.
 * Compone los building blocks internos (`CalendarMenuButton`, `CalendarDayCell`,
 * `CalendarYearCell`) y controla internamente qué celdas están disabled y cuál
 * está seleccionada.
 */
export function Calendar({
  value,
  defaultValue,
  onChange,
  defaultMonth,
  minDate,
  maxDate,
  size = 'sm',
  surface = 'none',
  locale = 'es-MX',
  weekStartsOn = 0,
  className,
  'aria-label': ariaLabel = 'Calendario',
}: CalendarProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null);
  const selected = isControlled ? value ?? null : internalValue;

  const today = useMemo(() => startOfDay(new Date()), []);

  const [viewMonth, setViewMonth] = useState<Date>(() =>
    startOfMonth(selected ?? defaultMonth ?? new Date()),
  );
  const [view, setView] = useState<'day' | 'year'>('day');
  const [yearPageStart, setYearPageStart] = useState<number>(
    () => (selected ?? new Date()).getFullYear() - 4,
  );
  const [focusedDate, setFocusedDate] = useState<Date>(() =>
    startOfDay(selected ?? new Date()),
  );

  const cellRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (!shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    cellRefs.current.get(isoKey(focusedDate))?.focus();
  }, [focusedDate]);

  // ── formatters ──────────────────────────────────────────────────────────
  const monthFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long' }),
    [locale],
  );
  const weekdayFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'narrow' }),
    [locale],
  );
  const monthLabel = `${capitalize(monthFmt.format(viewMonth))} ${viewMonth.getFullYear()}`;
  const weekdayLabels = useMemo(() => {
    // 2024-01-07 es domingo
    return Array.from({ length: 7 }, (_, i) =>
      weekdayFmt.format(new Date(2024, 0, 7 + ((i + weekStartsOn) % 7))),
    );
  }, [weekdayFmt, weekStartsOn]);

  // ── grid de días ────────────────────────────────────────────────────────
  const weeks = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const firstDow = new Date(y, m, 1).getDay();
    const offset = (firstDow - weekStartsOn + 7) % 7;
    const gridStart = new Date(y, m, 1 - offset);
    const cells = Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      return { date, outside: date.getMonth() !== m };
    });
    return Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [viewMonth, weekStartsOn]);

  const isDisabled = (d: Date) =>
    (minDate != null && +startOfDay(d) < +startOfDay(minDate)) ||
    (maxDate != null && +startOfDay(d) > +startOfDay(maxDate));

  function selectDay(date: Date) {
    if (isDisabled(date)) return;
    const picked = startOfDay(date);
    if (!isControlled) setInternalValue(picked);
    onChange?.(picked);
    setViewMonth(startOfMonth(picked));
    setFocusedDate(picked);
  }

  function selectYear(year: number) {
    setViewMonth(new Date(year, viewMonth.getMonth(), 1));
    setFocusedDate((f) => new Date(year, f.getMonth(), Math.min(f.getDate(), 28)));
    setView('day');
  }

  function goPrev() {
    if (view === 'day') setViewMonth((v) => addMonths(v, -1));
    else setYearPageStart((y) => y - YEARS_PER_PAGE);
  }
  function goNext() {
    if (view === 'day') setViewMonth((v) => addMonths(v, 1));
    else setYearPageStart((y) => y + YEARS_PER_PAGE);
  }
  function toggleView() {
    setView((v) => {
      const next = v === 'day' ? 'year' : 'day';
      if (next === 'year') {
        setYearPageStart((selected ?? viewMonth).getFullYear() - 4);
      }
      return next;
    });
  }

  function handleGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const map: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (e.key in map) {
      e.preventDefault();
      const next = addDays(focusedDate, map[e.key]);
      shouldFocusRef.current = true;
      setFocusedDate(next);
      if (next.getMonth() !== viewMonth.getMonth() || next.getFullYear() !== viewMonth.getFullYear()) {
        setViewMonth(startOfMonth(next));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectDay(focusedDate);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      const next = addMonths(focusedDate, -1);
      shouldFocusRef.current = true;
      setFocusedDate(next);
      setViewMonth(startOfMonth(next));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      const next = addMonths(focusedDate, 1);
      shouldFocusRef.current = true;
      setFocusedDate(next);
      setViewMonth(startOfMonth(next));
    }
  }

  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart + i);
  const yearDisabled = (yr: number) =>
    (minDate != null && yr < minDate.getFullYear()) ||
    (maxDate != null && yr > maxDate.getFullYear());

  const yearLabel =
    view === 'year' ? `${years[0]} – ${years[years.length - 1]}` : monthLabel;

  return (
    <div
      className={['calendar', className].filter(Boolean).join(' ')}
      data-size={size}
      data-surface={surface}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="calendar__header">
        <CalendarMenuButton
          label={yearLabel}
          expanded={view === 'year'}
          onClick={toggleView}
        />
        <div className="calendar__nav">
          <IconButton
            emphasis="ghost"
            size="sm"
            icon={<ChevronLeft />}
            aria-label={view === 'day' ? 'Mes anterior' : 'Años anteriores'}
            onClick={goPrev}
          />
          <IconButton
            emphasis="ghost"
            size="sm"
            icon={<ChevronRight />}
            aria-label={view === 'day' ? 'Mes siguiente' : 'Años siguientes'}
            onClick={goNext}
          />
        </div>
      </div>

      {view === 'day' ? (
        <>
          <div className="calendar__weekdays" aria-hidden="true">
            {weekdayLabels.map((w, i) => (
              <span key={i} className="calendar__weekday">
                {w}
              </span>
            ))}
          </div>
          <div
            className="calendar__grid"
            role="grid"
            aria-label={monthLabel}
            onKeyDown={handleGridKeyDown}
          >
            {weeks.map((week, wi) => (
              <div key={wi} className="calendar__week" role="row">
                {week.map(({ date, outside }) => {
                  const disabled = isDisabled(date);
                  const type = selected && sameDay(date, selected)
                    ? 'selected'
                    : sameDay(date, today)
                      ? 'today'
                      : 'default';
                  return (
                    <CalendarDayCell
                      key={isoKey(date)}
                      ref={(el) => {
                        cellRefs.current.set(isoKey(date), el);
                      }}
                      day={date.getDate()}
                      size={size}
                      type={type}
                      outside={outside}
                      disabled={disabled}
                      tabIndex={sameDay(date, focusedDate) ? 0 : -1}
                      aria-label={new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date)}
                      onClick={() => selectDay(date)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="calendar__years" role="grid" aria-label="Selección de año">
          {years.map((yr) => (
            <CalendarYearCell
              key={yr}
              year={yr}
              type={selected && selected.getFullYear() === yr ? 'selected' : 'default'}
              disabled={yearDisabled(yr)}
              onClick={() => selectYear(yr)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
