import { useState } from 'react';
import { ArrowLeft } from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { Button } from '../../calipso/components/Button/Button';
import { ButtonActions } from '../../calipso/components/ButtonActions/ButtonActions';
import { IconButton } from '../../calipso/components/IconButton/IconButton';
import { ItemTrailing } from '../../calipso/components/ItemBlocks/ItemTrailing';
import { List } from '../../calipso/components/List';
import { ListItem } from '../../calipso/components/List/ListItem';
import { SelectBottomSheet } from '../../calipso/components/Select';
import type { SelectOption } from '../../calipso/components/Select';
import { dependencias, tieneFirmaDisponible } from '../../datos/convenios';
import type { Convenio } from '../../datos/convenios';
import './NuevaSolicitud.css';

/**
 * Iniciemos la solicitud — primer paso de "Nueva solicitud de crédito".
 *
 * Mapa de la pantalla → sistema:
 *   AppBar (stacked)     back + título + párrafo de contexto
 *   SelectBottomSheet    dependencia y convenio (campo que abre un sheet)
 *   List + Radio         tipo de firma — una opción por fila, `role="radiogroup"`
 *   ButtonActions        CTA fijo al pie (`sticky`), con su borde en `auto`:
 *                        solo aparece si queda contenido por debajo
 *
 * Mismo shell que la home: alto completo, columna de ancho móvil centrada, y
 * solo el bloque de contenido scrollea.
 */

const tiposDeFirma = [
  { value: 'autografa', label: 'Firma autógrafa' },
  { value: 'digital', label: 'Firma digital' },
] as const;

type TipoDeFirma = (typeof tiposDeFirma)[number]['value'];

/**
 * Propuesta cuando el convenio admite las dos. Sin convenio no se propone
 * nada: la pantalla no presume una respuesta antes de tener con qué.
 */
const FIRMA_PROPUESTA: TipoDeFirma = 'autografa';

const opcionesDependencia: SelectOption[] = dependencias.map((d) => ({
  value: d.nombre,
  label: d.nombre,
}));

/**
 * Qué firma queda seleccionada al elegir un convenio. Si solo admite una, esa
 * queda fija; si admite las dos, se propone la autógrafa y el usuario decide.
 */
function firmaInicial(convenio: Convenio): TipoDeFirma | '' {
  if (convenio.firmaAutografa && convenio.firmaDigital) return FIRMA_PROPUESTA;
  if (convenio.firmaAutografa) return 'autografa';
  if (convenio.firmaDigital) return 'digital';
  return '';
}

export type NuevaSolicitudProps = {
  onRegresar: () => void;
};

export function NuevaSolicitud({ onRegresar }: NuevaSolicitudProps) {
  const [dependencia, setDependencia] = useState('');
  const [convenio, setConvenio] = useState('');
  const [firma, setFirma] = useState<TipoDeFirma | ''>('');

  const dependenciaElegida = dependencias.find((d) => d.nombre === dependencia);
  const convenioElegido = dependenciaElegida?.convenios.find((c) => c.nombre === convenio);

  /** Los convenios sin ninguna firma disponible se listan, pero deshabilitados. */
  const opcionesConvenio: SelectOption[] =
    dependenciaElegida?.convenios.map((c) => ({
      value: c.nombre,
      label: c.nombre,
      disabled: !tieneFirmaDisponible(c),
    })) ?? [];

  const elegirDependencia = (valor: string) => {
    setDependencia(valor);
    // el convenio anterior no existe en la nueva dependencia
    const d = dependencias.find((x) => x.nombre === valor);
    // con un solo convenio no hay nada que elegir: se preselecciona aunque no
    // tenga firma disponible — así el callejón sin salida se ve, en vez de
    // dejar el campo vacío sin explicar por qué no avanza
    const unico = d?.convenios.length === 1 ? d.convenios[0] : undefined;
    setConvenio(unico?.nombre ?? '');
    setFirma(unico ? firmaInicial(unico) : '');
  };

  const elegirConvenio = (valor: string) => {
    setConvenio(valor);
    const c = dependenciaElegida?.convenios.find((x) => x.nombre === valor);
    if (!c) {
      setFirma('');
      return;
    }
    // si lo que ya venía marcado sigue siendo válido, se respeta
    const sigueValiendo =
      (firma === 'autografa' && c.firmaAutografa) || (firma === 'digital' && c.firmaDigital);
    setFirma(sigueValiendo ? firma : firmaInicial(c));
  };

  const puedeComenzar = convenioElegido != null && firma !== '';

  /**
   * Solo se bloquea cuando YA hay convenio y ese convenio admite una sola
   * firma: ahí no hay nada que elegir, así que van las dos filas inertes con
   * la que aplica marcada — dejar la otra habilitada sugeriría una alternativa
   * que no existe.
   *
   * Mientras no hay convenio el campo se ve normal, con la propuesta marcada:
   * apagarlo de entrada haría ver la pantalla como si estuviera rota al cargar.
   */
  const firmaDeterminada =
    convenioElegido != null && !(convenioElegido.firmaAutografa && convenioElegido.firmaDigital);

  return (
    <div className="solicitud">
      <div className="solicitud__scroll">
        <AppBar
          configuration="navigation"
          layout="stacked"
          size="sm"
          headline="Iniciemos la solicitud"
          supporting="Para comenzar la solicitud debes seleccionar en qué dependencia y convenio se encuentra registrado el cliente."
          aria-label="Iniciemos la solicitud"
          leading={
            <IconButton
              emphasis="ghost"
              scheme="neutral"
              size="lg"
              icon={<ArrowLeft />}
              aria-label="Regresar"
              onClick={onRegresar}
            />
          }
        />

        <main className="solicitud__content">
          <div className="solicitud__grupo">
            <SelectBottomSheet
              label="Dependencia"
              placeholder="Selecciona..."
              options={opcionesDependencia}
              value={dependencia}
              onChange={elegirDependencia}
            />

            <SelectBottomSheet
              label="Convenio"
              placeholder="Selecciona..."
              options={opcionesConvenio}
              value={convenio}
              onChange={elegirConvenio}
              disabled={dependenciaElegida == null}
            />
          </div>

          <div className="solicitud__campo">
            <span className="solicitud__etiqueta" id="tipo-de-firma">
              Tipo de firma
            </span>
            {/* El <label> envuelve la fila entera para que todo el row active
                el radio. No se usa `ListItem interactive` porque renderiza un
                <button>, y un <input> dentro de un <button> es HTML inválido.
                El `role="radiogroup"` sustituye al `role="list"` por defecto:
                aquí las filas son opciones, no una lista. */}
            <List type="segmented" role="radiogroup" aria-labelledby="tipo-de-firma">
              {tiposDeFirma.map((tipo) => (
                <label key={tipo.value} className="solicitud__opcion">
                  <ListItem
                    label={tipo.label}
                    disabled={firmaDeterminada}
                    trailing={
                      <ItemTrailing
                        type="radio"
                        control={{
                          name: 'tipo-de-firma',
                          value: tipo.value,
                          checked: firma === tipo.value,
                          disabled: firmaDeterminada,
                          onChange: () => setFirma(tipo.value),
                        }}
                      />
                    }
                  />
                </label>
              ))}
            </List>
          </div>
        </main>

        <ButtonActions surface="screen" sticky>
          <Button emphasis="primary" size="sm" disabled={!puedeComenzar}>
            Comenzar solicitud
          </Button>
        </ButtonActions>
      </div>
    </div>
  );
}
