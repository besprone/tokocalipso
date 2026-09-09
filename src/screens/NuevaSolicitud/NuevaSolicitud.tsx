import { useState } from 'react';
import { ArrowLeft } from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { Button } from '../../calipso/components/Button/Button';
import { ButtonActions } from '../../calipso/components/ButtonActions/ButtonActions';
import { ChipGroup } from '../../calipso/components/ChipGroup/ChipGroup';
import { IconButton } from '../../calipso/components/IconButton/IconButton';
import { SelectBottomSheet } from '../../calipso/components/Select';
import type { SelectOption } from '../../calipso/components/Select';
import './NuevaSolicitud.css';

/**
 * Iniciemos la solicitud — primer paso de "Nueva solicitud de crédito".
 *
 * Mapa de la pantalla → sistema:
 *   AppBar (stacked)     back + título + párrafo de contexto
 *   SelectBottomSheet    dependencia y convenio (campo que abre un sheet)
 *   ChipGroup            tipo de firma — elección única, `role="radio"`
 *   ButtonActions        CTA fijo al pie, a lo ancho
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

          <div className="solicitud__campo">
            <span className="solicitud__etiqueta" id="tipo-de-firma">
              Tipo de firma
            </span>
            <ChipGroup
              options={tiposDeFirma}
              value={firma}
              onChange={setFirma}
              aria-label="Tipo de firma"
            />
          </div>
        </main>
      </div>

      <div className="solicitud__footer">
        <ButtonActions surface="screen">
          <Button emphasis="primary" size="md" disabled={!puedeComenzar}>
            Comenzar solicitud
          </Button>
        </ButtonActions>
      </div>
    </div>
  );
}
