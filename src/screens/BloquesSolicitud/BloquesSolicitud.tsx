import { useState } from 'react';
import { ArrowLeft, Close } from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { Button } from '../../calipso/components/Button/Button';
import { ButtonActions } from '../../calipso/components/ButtonActions';
import { IconButton } from '../../calipso/components/IconButton/IconButton';
import { ItemTrailing } from '../../calipso/components/ItemBlocks/ItemTrailing';
import { LinearProgress } from '../../calipso/components/LinearProgress/LinearProgress';
import { List } from '../../calipso/components/List';
import { ListItem } from '../../calipso/components/List/ListItem';
import './BloquesSolicitud.css';

/**
 * Inicia la solicitud de crédito — índice de los bloques por completar.
 *
 * Mapa de la pantalla → sistema:
 *   AppBar (stacked)     back + cerrar + título + tiempo estimado
 *   LinearProgress       avance del proceso, con el porcentaje al lado
 *   List + ListItem      un bloque por fila; se habilitan en orden
 *   ButtonActions        CTA sticky con microcopy, bloqueado hasta completar
 */

const bloques = [
  { id: 'identificacion', nombre: 'Identificación y autenticación' },
  { id: 'oferta', nombre: 'Seleccionar oferta' },
  { id: 'informacion', nombre: 'Información de la solicitud' },
  { id: 'documentos', nombre: 'Documentos' },
] as const;

/**
 * El proceso son 5 pasos: elegir dependencia, convenio y firma —ya hecho al
 * llegar aquí— más los cuatro bloques. De ahí que se entre con 20%.
 *
 * Se calcula, no se fija: el componente de Figma es estático y su valor no es
 * una regla.
 */
const PASOS_TOTALES = bloques.length + 1;

function porcentaje(completados: number): number {
  return Math.round(((completados + 1) / PASOS_TOTALES) * 100);
}

export type BloquesSolicitudProps = {
  onRegresar: () => void;
  onSalir: () => void;
};

export function BloquesSolicitud({ onRegresar, onSalir }: BloquesSolicitudProps) {
  // ningún bloque está construido todavía; el orden es secuencial
  const [completados] = useState<string[]>([]);

  const avance = porcentaje(completados.length);
  const siguiente = bloques.find((b) => !completados.includes(b.id));
  const todoListo = completados.length === bloques.length;

  return (
    <div className="bloques">
      <div className="bloques__scroll">
        <AppBar
          layout="stacked"
          size="sm"
          headline="Inicia la solicitud de crédito"
          supporting="Completa los bloques de información para enviar tu solicitud. El proceso completo puede tardar hasta 15 minutos."
          aria-label="Inicia la solicitud de crédito"
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
          trailing={
            <IconButton
              emphasis="ghost"
              scheme="neutral"
              size="lg"
              icon={<Close />}
              aria-label="Salir de la solicitud"
              onClick={onSalir}
            />
          }
        />

        <main className="bloques__contenido">
          <div className="bloques__avance">
            <LinearProgress value={avance} aria-label="Avance de la solicitud" />
            <span className="bloques__porcentaje">{avance}%</span>
          </div>

          <List type="segmented">
            {bloques.map((bloque) => {
              const habilitado = bloque.id === siguiente?.id;
              return (
                <ListItem
                  key={bloque.id}
                  interactive
                  disabled={!habilitado}
                  label={bloque.nombre}
                  trailing={<ItemTrailing type="icon" />}
                  onClick={() => undefined}
                />
              );
            })}
          </List>
        </main>

        <ButtonActions surface="screen" sticky>
          <p className="bloques__microcopy">Completa los bloques para enviar.</p>
          <Button emphasis="primary" size="sm" disabled={!todoListo}>
            Enviar solicitud
          </Button>
        </ButtonActions>
      </div>
    </div>
  );
}
