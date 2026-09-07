import { useCallback, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, PointerEvent } from 'react';
import './AlphabetIndex.css';

export type AlphabetIndexSize = 'default' | 'compact';

/** A–Z con Ñ entre N y O (español). */
export const ALPHABET_ES: readonly string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

type BaseProps = {
  /** Letras a mostrar. Default: `ALPHABET_ES`. */
  letters?: readonly string[];
  /** Letras con contenido en la lista. Las demás se ven atenuadas y no
   *  disparan `onLetterChange`. Si se omite, todas están habilitadas. */
  available?: readonly string[];
  /** Letra de la sección visible ahora — la resalta (controlado). */
  activeLetter?: string;
  /** Se llama al tocar o arrastrar sobre una letra habilitada (continuo en drag). */
  onLetterChange?: (letter: string) => void;
  /** Overlay grande con la letra actual mientras se interactúa (estilo iOS). */
  showOverlay?: boolean;
  /** `default` (16px) · `compact` (12px). Default `default`. */
  size?: AlphabetIndexSize;
  /** Nombre accesible. Default `Índice alfabético`. */
  'aria-label'?: string;
};

export type AlphabetIndexProps = BaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseProps | 'onChange'>;

const OVERLAY_HIDE_MS = 200;

/**
 * AlphabetIndex — índice alfabético vertical al borde derecho de una lista
 * larga. Figma: `components_alphabet_index`. Tap o drag sobre una letra →
 * `onLetterChange(letra)`; **el scroll de la lista lo hace quien lo monta**
 * (p. ej. `document.getElementById('sec-' + letra)?.scrollIntoView()`).
 *
 * No es standalone: siempre acompaña a una lista con headers de sección, y
 * nunca debe ser la única forma de navegar (dar también search / scroll).
 * El posicionamiento (`absolute`/`fixed` a la derecha, centrado) lo pone el
 * contenedor.
 */
export function AlphabetIndex({
  letters = ALPHABET_ES,
  available,
  activeLetter,
  onLetterChange,
  showOverlay = false,
  size = 'default',
  'aria-label': ariaLabel = 'Índice alfabético',
  className,
  ...props
}: AlphabetIndexProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastFired = useRef<string | null>(null);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [dragging, setDragging] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);
  const [overlayLetter, setOverlayLetter] = useState<string | null>(null);

  const isEnabled = useCallback(
    (l: string) => (available ? available.includes(l) : true),
    [available],
  );

  const focusIndex = useRef(
    Math.max(0, activeLetter ? letters.indexOf(activeLetter) : 0),
  );

  const fire = useCallback(
    (letter: string) => {
      if (!isEnabled(letter) || letter === lastFired.current) return;
      lastFired.current = letter;
      setPressed(letter);
      if (showOverlay) {
        clearTimeout(overlayTimer.current);
        setOverlayLetter(letter);
      }
      onLetterChange?.(letter);
    },
    [isEnabled, onLetterChange, showOverlay],
  );

  const endInteraction = useCallback(() => {
    setDragging(false);
    setPressed(null);
    lastFired.current = null;
    if (showOverlay) {
      clearTimeout(overlayTimer.current);
      overlayTimer.current = setTimeout(() => setOverlayLetter(null), OVERLAY_HIDE_MS);
    }
  }, [showOverlay]);

  /** letra bajo la coordenada Y (geometría del strip, robusto sin elementFromPoint) */
  const letterAtY = useCallback(
    (clientY: number): string | null => {
      const el = listRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const ratio = (clientY - rect.top) / rect.height;
      const idx = Math.min(letters.length - 1, Math.max(0, Math.floor(ratio * letters.length)));
      return letters[idx] ?? null;
    },
    [letters],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button != null && e.button !== 0) return;
    listRef.current?.setPointerCapture?.(e.pointerId);
    setDragging(true);
    const l = letterAtY(e.clientY);
    if (l) fire(l);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const l = letterAtY(e.clientY);
    if (l) fire(l);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = letters.length;
    let target = -1;
    if (e.key === 'ArrowDown') target = Math.min(n - 1, focusIndex.current + 1);
    else if (e.key === 'ArrowUp') target = Math.max(0, focusIndex.current - 1);
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = n - 1;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fire(letters[focusIndex.current]);
      lastFired.current = null;
      return;
    } else return;
    e.preventDefault();
    focusIndex.current = target;
    btnRefs.current[target]?.focus();
    fire(letters[target]);
    lastFired.current = null;
  };

  return (
    <div
      className={['alphabet-index', className].filter(Boolean).join(' ')}
      data-size={size}
      data-dragging={dragging ? '' : undefined}
      {...props}
    >
      <div
        ref={listRef}
        role="toolbar"
        aria-label={ariaLabel}
        aria-orientation="vertical"
        className="alphabet-index__list"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        onLostPointerCapture={endInteraction}
        onKeyDown={onKeyDown}
      >
        {letters.map((letter, i) => {
          const enabled = isEnabled(letter);
          const isActive = letter === activeLetter;
          const roving = i === Math.max(0, activeLetter ? letters.indexOf(activeLetter) : 0);
          return (
            <button
              key={letter}
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              type="button"
              className="alphabet-index__letter"
              data-active={isActive ? '' : undefined}
              data-pressed={pressed === letter ? '' : undefined}
              data-disabled={!enabled ? '' : undefined}
              aria-disabled={!enabled || undefined}
              aria-label={`Ir a la sección ${letter}`}
              tabIndex={roving ? 0 : -1}
              onClick={() => {
                if (enabled) {
                  fire(letter);
                  lastFired.current = null;
                }
              }}
              onFocus={() => {
                focusIndex.current = i;
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {showOverlay && overlayLetter && (
        <div className="alphabet-index__overlay" aria-hidden="true">
          {overlayLetter}
        </div>
      )}
    </div>
  );
}
