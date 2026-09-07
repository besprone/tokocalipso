import { forwardRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import './Avatar.css';

export type AvatarType = 'img' | 'initials';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarAccent = 'primary' | 'secondary';

type BaseProps = {
  /** `img` (foto) · `initials` (iniciales sobre color). Default `img`. */
  type?: AvatarType;
  /** Escala. xs 24 · sm 32 · md 40 · lg 48 · xl 56. Default `md`. */
  size?: AvatarSize;
  /** Tinte del fondo para `initials`. Default `primary`. */
  accent?: AvatarAccent;
  /** Fuente de la imagen (`type="img"`). */
  src?: string;
  /** Texto alternativo de la imagen. */
  alt?: string;
  /** Iniciales (`type="initials"`, o fallback de `img` sin `src` / con error). */
  label?: string;
};

export type AvatarProps = BaseProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof BaseProps>;

/**
 * Avatar — identidad visual del usuario: foto o iniciales en un círculo.
 * Figma: `components_avatar`.
 *
 * `type="img"` cae a iniciales si no hay `src` (o falla la carga) y se pasó
 * `label`; si no, queda el círculo `bg/successSoft` vacío.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { type = 'img', size = 'md', accent = 'primary', src, alt = '', label, className, ...props },
  ref,
) {
  const [errored, setErrored] = useState(false);
  const showImg = type === 'img' && !!src && !errored;
  const mode = showImg ? 'img' : label != null ? 'initials' : 'empty';

  return (
    <span
      ref={ref}
      className={['avatar', className].filter(Boolean).join(' ')}
      data-size={size}
      data-mode={mode}
      data-accent={mode === 'initials' ? accent : undefined}
      {...props}
    >
      {showImg ? (
        <img className="avatar__img" src={src} alt={alt} onError={() => setErrored(true)} />
      ) : mode === 'initials' ? (
        <span className="avatar__initials">{label}</span>
      ) : null}
    </span>
  );
});
