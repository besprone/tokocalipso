import { useEffect, useState } from 'react';
import './BrandToggle.css';

export type Brand = 'kubo' | 'maestro';

const CLAVE = 'toko-brand';
const MARCAS: Brand[] = ['kubo', 'maestro'];

/** Este flujo es de Crédito Maestro. kubo queda solo como comparación. */
const MARCA_POR_DEFECTO: Brand = 'maestro';

/**
 * Toggle de marca — andamiaje del prototipo, NO es parte del producto ni del
 * design system. El DS emite `:root` con kubo y un bloque
 * `[data-brand="maestro"]` que redefine solo las familias de marca, así que
 * cambiar de marca es cambiar un atributo en <html>.
 */

/** Marca guardada, o la de por defecto si no hay nada o el storage falla. */
export function marcaGuardada(): Brand {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === 'maestro' || v === 'kubo' ? v : MARCA_POR_DEFECTO;
  } catch {
    return MARCA_POR_DEFECTO;
  }
}

/** kubo vive en `:root`, así que se representa quitando el atributo. */
export function aplicarMarca(marca: Brand) {
  const raiz = document.documentElement;
  if (marca === 'kubo') raiz.removeAttribute('data-brand');
  else raiz.dataset.brand = marca;
}

export function BrandToggle() {
  const [marca, setMarca] = useState<Brand>(marcaGuardada);

  useEffect(() => {
    aplicarMarca(marca);
  }, [marca]);

  /**
   * Se persiste SOLO al elegir, nunca al montar. Si se guardara en un efecto
   * sobre `marca`, un montaje donde la lectura falle (modo privado, storage
   * vaciado, partición distinta) escribiría el fallback `kubo` encima de la
   * marca elegida y la perdería en silencio.
   */
  const elegir = (valor: Brand) => {
    setMarca(valor);
    try {
      localStorage.setItem(CLAVE, valor);
    } catch {
      // storage bloqueado: la marca dura lo que la sesión
    }
  };

  return (
    <div className="brand-toggle" role="group" aria-label="Marca del prototipo">
      <span className="brand-toggle__etiqueta" aria-hidden="true">
        marca
      </span>
      {MARCAS.map((valor) => (
        <button
          key={valor}
          type="button"
          className="brand-toggle__opcion"
          data-activa={valor === marca || undefined}
          aria-pressed={valor === marca}
          onClick={() => elegir(valor)}
        >
          {valor}
        </button>
      ))}
    </div>
  );
}
