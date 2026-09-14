import { useEffect } from 'react';
import { ArrowLeft, Close } from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { FeedbackBanner } from '../../calipso/components/Banner';
import { Button } from '../../calipso/components/Button/Button';
import { ButtonActions } from '../../calipso/components/ButtonActions';
import { IconButton } from '../../calipso/components/IconButton/IconButton';
import { ItemLeading } from '../../calipso/components/ItemBlocks';
import { List } from '../../calipso/components/List';
import { ListItem } from '../../calipso/components/List/ListItem';
import { useConfirmarSalida } from '../../hooks/useConfirmarSalida';
import {
  estadoDelPaso,
  estadosSeguimiento,
  pasosIdentificacion,
  ULTIMO_ESTADO,
} from '../../datos/seguimientoIdentificacion';
import './SeguimientoIdentificacion.css';

/**
 * Seguimiento en tiempo real de "Identificación y autenticación" (nodo
 * 25:15845). Avanza SOLO por los 5 estados —simula que el cliente completa
 * cada paso en su propio teléfono— mientras la pantalla está montada; si el
 * usuario navega fuera, el avance se pausa donde iba (`pasoActual` vive en
 * App.tsx) y retoma al volver a entrar.
 *
 * Mapa de la pantalla → sistema:
 *   AppBar (stacked)    back + cerrar + título/contexto, cambian con el estado
 *   List + ListItem     un paso por fila; el leading es `ItemLeading
 *                        type="statusBadge"` (`_building_blocks_statusBadge`)
 *   FeedbackBanner       solo en los dos primeros estados (nodo 16:3381)
 *   ButtonActions        CTA sticky, texto y acción cambian con el estado
 *
 * Ya no hay ningún ícono ni color a mano en esta pantalla: `StatusBadge` es
 * componente del DS (llegó con él el punto exacto que se había reportado —
 * ver commits de la migración). Antes de esta versión había una composición
 * propia con Carbon icons sueltos + CircularProgress; se retiró entera.
 */

export type SeguimientoIdentificacionProps = {
  pasoActual: number;
  onAvanzar: () => void;
  onRegresar: () => void;
  onSalir: () => void;
  onCompletar: () => void;
};

export function SeguimientoIdentificacion({
  pasoActual,
  onAvanzar,
  onRegresar,
  onSalir,
  onCompletar,
}: SeguimientoIdentificacionProps) {
  const { abrir: abrirConfirmacion, sheet: confirmarSalida } = useConfirmarSalida(onSalir);
  const estado = estadosSeguimiento[pasoActual];
  const enElUltimo = pasoActual === ULTIMO_ESTADO;

  // Avanza solo mientras la pantalla está montada — el ritmo simula el tiempo
  // que tardaría el cliente en completar cada paso en su teléfono. `setTimeout`,
  // no `requestAnimationFrame`: debe seguir corriendo aunque la pestaña quede
  // en segundo plano (mismo motivo que el avance del LinearProgress en App.tsx).
  useEffect(() => {
    if (enElUltimo) return;
    const id = setTimeout(onAvanzar, 9000);
    return () => clearTimeout(id);
  }, [pasoActual, enElUltimo, onAvanzar]);

  return (
    <div className="seguimiento">
      <div className="seguimiento__scroll">
        <AppBar
          layout="stacked"
          size="sm"
          collapseOnScroll
          headline={estado.headline}
          supporting={estado.supporting}
          aria-label={estado.headline}
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

        <main className="seguimiento__contenido">
          <List type="segmented">
            {pasosIdentificacion.map((paso, indice) => (
              <ListItem
                key={paso.id}
                label={paso.nombre}
                supporting={paso.supporting}
                leading={<ItemLeading type="statusBadge" status={estadoDelPaso(indice, pasoActual)} />}
              />
            ))}
          </List>

          {estado.mostrarBanner && (
            <FeedbackBanner
              headline="Sugerencia"
              supporting="Si tu cliente está contigo, puedes completar los 4 pasos directo desde este dispositivo."
            />
          )}
        </main>

        <ButtonActions surface="screen" sticky>
          <Button
            emphasis="primary"
            size="sm"
            onClick={enElUltimo ? onCompletar : undefined}
          >
            {estado.cta}
          </Button>
        </ButtonActions>
      </div>

      {confirmarSalida}
    </div>
  );
}
