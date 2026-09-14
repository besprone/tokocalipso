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
import { dependencias, firmaInicial, tieneFirmaDisponible, tiposDeFirma } from '../../datos/convenios';
import type { DatosSolicitud } from '../../datos/convenios';
import { useConfirmarSalida } from '../../hooks/useConfirmarSalida';
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
 *
 * Controlada por App.tsx (`datos` + `onCambiarDatos`): si el usuario regresa
 * a esta pantalla, lo que ya había elegido sigue ahí.
 *
 * El back del AppBar no tiene una pantalla anterior DENTRO del flujo —acá
 * empieza—, así que se comporta como "salir": si ya hay al menos un bloque
 * completado (`hayProgreso`) pregunta con el mismo sheet de confirmación que
 * usan las demás pantallas; si no, no hay nada real que perder y descarta
 * directo.
 */

const opcionesDependencia: SelectOption[] = dependencias.map((d) => ({
  value: d.nombre,
  label: d.nombre,
}));

export type NuevaSolicitudProps = {
  datos: DatosSolicitud;
  onCambiarDatos: (parcial: Partial<DatosSolicitud>) => void;
  /** Ya hay al menos un bloque completado — el back del AppBar pregunta
   *  antes de descartarlo, en vez de salir directo. */
  hayProgreso: boolean;
  onSalir: () => void;
  onComenzar: () => void;
};

export function NuevaSolicitud({
  datos,
  onCambiarDatos,
  hayProgreso,
  onSalir,
  onComenzar,
}: NuevaSolicitudProps) {
  const { dependencia, convenio, firma } = datos;
  const { abrir: abrirConfirmacion, sheet: confirmarSalida } = useConfirmarSalida(onSalir);
  const manejarRegresar = hayProgreso ? abrirConfirmacion : onSalir;

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
    // el convenio anterior no existe en la nueva dependencia
    const d = dependencias.find((x) => x.nombre === valor);
    // con un solo convenio no hay nada que elegir: se preselecciona aunque no
    // tenga firma disponible — así el callejón sin salida se ve, en vez de
    // dejar el campo vacío sin explicar por qué no avanza
    const unico = d?.convenios.length === 1 ? d.convenios[0] : undefined;
    onCambiarDatos({
      dependencia: valor,
      convenio: unico?.nombre ?? '',
      firma: unico ? firmaInicial(unico) : '',
    });
  };

  const elegirConvenio = (valor: string) => {
    const c = dependenciaElegida?.convenios.find((x) => x.nombre === valor);
    if (!c) {
      onCambiarDatos({ convenio: valor, firma: '' });
      return;
    }
    // si lo que ya venía marcado sigue siendo válido, se respeta
    const sigueValiendo =
      (firma === 'autografa' && c.firmaAutografa) || (firma === 'digital' && c.firmaDigital);
    onCambiarDatos({ convenio: valor, firma: sigueValiendo ? firma : firmaInicial(c) });
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
          collapseOnScroll
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
              onClick={manejarRegresar}
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
                          onChange: () => onCambiarDatos({ firma: tipo.value }),
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
          <Button
            emphasis="primary"
            size="sm"
            disabled={!puedeComenzar}
            onClick={onComenzar}
          >
            Comenzar solicitud
          </Button>
        </ButtonActions>
      </div>

      {confirmarSalida}
    </div>
  );
}
