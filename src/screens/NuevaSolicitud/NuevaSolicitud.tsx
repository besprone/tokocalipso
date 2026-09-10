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

/** Placeholders — pendientes de los catálogos reales. */
const dependencias: SelectOption[] = [
  { value: 'issste', label: 'ISSSTE' },
  { value: 'imss', label: 'IMSS' },
  { value: 'sep', label: 'SEP' },
  { value: 'pemex', label: 'Pemex' },
];

const convenios: SelectOption[] = [
  { value: 'nomina', label: 'Nómina' },
  { value: 'pension', label: 'Pensión' },
  { value: 'jubilados', label: 'Jubilados' },
];

const tiposDeFirma = [
  { value: 'autografa', label: 'Firma autógrafa' },
  { value: 'digital', label: 'Firma digital' },
];

export type NuevaSolicitudProps = {
  onRegresar: () => void;
};

export function NuevaSolicitud({ onRegresar }: NuevaSolicitudProps) {
  const [dependencia, setDependencia] = useState('');
  const [convenio, setConvenio] = useState('');
  const [firma, setFirma] = useState('autografa');

  const puedeComenzar = dependencia !== '' && convenio !== '';

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
              options={dependencias}
              value={dependencia}
              onChange={setDependencia}
            />

            <SelectBottomSheet
              label="Convenio"
              placeholder="Selecciona..."
              options={convenios}
              value={convenio}
              onChange={setConvenio}
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
                    trailing={
                      <ItemTrailing
                        type="radio"
                        control={{
                          name: 'tipo-de-firma',
                          value: tipo.value,
                          checked: firma === tipo.value,
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
