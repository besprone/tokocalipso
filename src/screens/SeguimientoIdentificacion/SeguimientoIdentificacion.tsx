import { useEffect } from 'react';
import { ArrowLeft, CheckmarkFilled, Close, RadioButton } from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { FeedbackBanner } from '../../calipso/components/Banner';
import { Button } from '../../calipso/components/Button/Button';
import { ButtonActions } from '../../calipso/components/ButtonActions';
import { CircularProgress } from '../../calipso/components/CircularProgress/CircularProgress';
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
 *   List + ListItem     un paso por fila; el leading es el statusBadge — ver
 *                        nota abajo, no hay componente dedicado en el DS
 *   FeedbackBanner       solo en los dos primeros estados (nodo 16:3381)
 *   ButtonActions        CTA sticky, texto y acción cambian con el estado
 *
 * El `_building_blocks_statusBadge` de Figma (pendiente/activo/completado) no
 * tiene componente propio en el catálogo — se resuelve por completo con
 * piezas que ya existen, sin pisar ninguna clase interna:
 *   pendiente   RadioButton (Carbon) en icon/tertiary
 *   activo      CircularProgress indeterminate size="xs" (16px en una caja de
 *               20, igual que especifica el nodo)
 *   completado  CheckmarkFilled (Carbon) en icon/success — el nodo de Figma
 *               trae el verde de marca de kubo (ref/green/500, #2e9f30) en vez
 *               del semántico; se usa icon/success (#1f6f40, no depende de
 *               marca) porque es el token correcto, no el valor pegado.
 */

export type SeguimientoIdentificacionProps = {
  pasoActual: number;
  onAvanzar: () => void;
  onRegresar: () => void;
  onSalir: () => void;
  onCompletar: () => void;
};

// `RadioButton`/`CheckmarkFilled` van como hijo DIRECTO de `.item-leading__icon`
// a propósito: el CSS del DS los redimensiona a 20px con un selector `> svg`,
// que coincide con el tamaño real que traen (20px con `size={20}`).
//
// `CircularProgress` NO puede ir directo ahí: es TAMBIÉN un `<svg>`, así que
// esa misma regla lo capturaba y lo forzaba a 20px por especificidad —
// pisando su propio CSS (`[data-size="xs"] { width: 16px; height: 16px; }`,
// que es el tamaño correcto según el DS: nodo `components_circular_
// indeterminate_progress_indicator`, 16px dentro de una caja de 20 con 2px
// de margen por lado). El `<span>` rompe el combinador `>` para que esa
// regla no lo alcance — no es un hueco del DS, es evitar que una regla
// pensada para glifos simples se aplique a un componente que ya trae su
// propio sistema de tamaños.
function StatusBadge({ estado }: { estado: 'pendiente' | 'activo' | 'completado' }) {
  if (estado === 'completado') {
    return <CheckmarkFilled size={20} aria-hidden="true" className="seguimiento__glifo-completado" />;
  }
  if (estado === 'activo') {
    return (
      <span className="seguimiento__badge-activo" aria-hidden="true">
        <CircularProgress indeterminate size="xs" />
      </span>
    );
  }
  return <RadioButton size={20} aria-hidden="true" className="seguimiento__glifo-pendiente" />;
}

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
                leading={
                  <ItemLeading
                    type="icon"
                    icon={<StatusBadge estado={estadoDelPaso(indice, pasoActual)} />}
                  />
                }
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
