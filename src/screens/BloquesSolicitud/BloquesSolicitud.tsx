import { ArrowLeft, Close } from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { Button } from '../../calipso/components/Button/Button';
import { ButtonActions } from '../../calipso/components/ButtonActions';
import { IconButton } from '../../calipso/components/IconButton/IconButton';
import { ItemTrailing } from '../../calipso/components/ItemBlocks/ItemTrailing';
import { LinearProgress } from '../../calipso/components/LinearProgress/LinearProgress';
import { List } from '../../calipso/components/List';
import { ListItem } from '../../calipso/components/List/ListItem';
import { bloques, porcentaje } from '../../datos/bloques';
import type { BloqueId } from '../../datos/bloques';
import { useConfirmarSalida } from '../../hooks/useConfirmarSalida';
import './BloquesSolicitud.css';

/**
 * Inicia la solicitud de crédito — índice de los bloques por completar.
 *
 * Mapa de la pantalla → sistema:
 *   AppBar (stacked)     back + cerrar + título + tiempo estimado
 *   LinearProgress       avance del proceso, con el porcentaje al lado
 *   List + ListItem      un bloque por fila; se habilitan en orden
 *   ButtonActions        CTA sticky con microcopy, bloqueado hasta completar
 *   useConfirmarSalida   sheet de confirmación al salir (nodo 13:2257),
 *                        compartido con las demás pantallas del flujo
 *
 * `completados` vive en App: sobrevive a entrar a un bloque y volver.
 */

export type BloquesSolicitudProps = {
  completados: BloqueId[];
  onAbrirBloque: (id: BloqueId) => void;
  onRegresar: () => void;
  onSalir: () => void;
};

export function BloquesSolicitud({
  completados,
  onAbrirBloque,
  onRegresar,
  onSalir,
}: BloquesSolicitudProps) {
  const { abrir: abrirConfirmacion, sheet: confirmarSalida } = useConfirmarSalida(onSalir);

  const avance = porcentaje(completados.length);
  const siguiente = bloques.find((b) => !completados.includes(b.id));
  const todoListo = completados.length === bloques.length;

  return (
    <div className="bloques">
      <div className="bloques__scroll">
        <AppBar
          layout="stacked"
          size="sm"
          collapseOnScroll
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
              onClick={abrirConfirmacion}
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
              const completado = completados.includes(bloque.id);
              const habilitado = completado || bloque.id === siguiente?.id;
              return (
                <ListItem
                  key={bloque.id}
                  interactive
                  disabled={!habilitado}
                  label={bloque.nombre}
                  trailing={<ItemTrailing type="icon" />}
                  onClick={() => onAbrirBloque(bloque.id)}
                />
              );
            })}
          </List>
        </main>

        <ButtonActions surface="screen" sticky microcopy="Completa los bloques para enviar.">
          <Button emphasis="primary" size="sm" disabled={!todoListo}>
            Enviar solicitud
          </Button>
        </ButtonActions>
      </div>

      {confirmarSalida}
    </div>
  );
}
