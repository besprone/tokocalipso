import { useEffect, useState } from 'react';

import { HomeSolicitudes } from './screens/HomeSolicitudes/HomeSolicitudes';
import { BloquesSolicitud } from './screens/BloquesSolicitud/BloquesSolicitud';
import { NuevaSolicitud } from './screens/NuevaSolicitud/NuevaSolicitud';
import {
  AutenticacionCliente,
  datosIdentificacionVacios,
} from './screens/AutenticacionCliente/AutenticacionCliente';
import type { DatosIdentificacion } from './screens/AutenticacionCliente/AutenticacionCliente';
import { porcentaje } from './datos/bloques';
import type { BloqueId } from './datos/bloques';
import { datosSolicitudVacios } from './datos/convenios';
import type { DatosSolicitud } from './datos/convenios';

/**
 * Navegación del prototipo: un estado de vista, sin router.
 *
 * Cuando haya URLs que compartir, deep links o botón atrás del navegador,
 * aquí es donde entra un router de verdad.
 *
 * Todo lo que tiene que sobrevivir a salir de una pantalla y volver vive
 * aquí, no en el `useState` de cada pantalla (que se resetea al desmontar):
 * `completados`, `datosSolicitud` (dependencia/convenio/firma) y
 * `datosIdentificacion` (celular/correo).
 */
type Vista = 'home' | 'nuevaSolicitud' | 'bloques' | 'identificacion';

export function App() {
  const [vista, setVista] = useState<Vista>('home');
  const [completados, setCompletados] = useState<BloqueId[]>([]);
  const [datosSolicitud, setDatosSolicitud] = useState<DatosSolicitud>(datosSolicitudVacios);
  const [datosIdentificacion, setDatosIdentificacion] =
    useState<DatosIdentificacion>(datosIdentificacionVacios);

  /**
   * Lo que el `LinearProgress` de `BloquesSolicitud` muestra AHORA — separado
   * del valor real (`porcentaje(completados.length)`) para poder animar entre
   * los dos. Arranca en 0 y el efecto de abajo lo persigue.
   */
  const [avanceMostrado, setAvanceMostrado] = useState(0);
  const avanceReal = porcentaje(completados.length);

  /**
   * Cuando `BloquesSolicitud` se monta (o `completados` cambia estando ya
   * montada) con un `avanceMostrado` atrasado respecto al real, lo alcanza
   * poco después — eso es lo que dispara la transición CSS de
   * `LinearProgress` (`inline-size`), porque el componente ya está montado
   * cuando el valor cambia. Si llegan iguales (nada cambió desde la última
   * vez que se vio esta pantalla), no hace nada: no hay que re-animar un
   * valor que ya se mostró.
   *
   * `setTimeout`, no `requestAnimationFrame`: rAF se PAUSA por completo en
   * una pestaña en segundo plano — si el usuario cambia de pestaña justo al
   * navegar aquí, el callback nunca corre y la barra queda congelada en el
   * valor viejo hasta que la pestaña vuelve a primer plano. `setTimeout`
   * sigue disparando (con el throttling normal del navegador) aunque la
   * pestaña esté oculta.
   */
  useEffect(() => {
    if (vista !== 'bloques' || avanceMostrado === avanceReal) return;
    const id = setTimeout(() => setAvanceMostrado(avanceReal), 0);
    return () => clearTimeout(id);
  }, [vista, avanceReal, avanceMostrado]);

  const cambiarDatosSolicitud = (parcial: Partial<DatosSolicitud>) =>
    setDatosSolicitud((actual) => ({ ...actual, ...parcial }));

  const cambiarDatosIdentificacion = (parcial: Partial<DatosIdentificacion>) =>
    setDatosIdentificacion((actual) => ({ ...actual, ...parcial }));

  const completarBloque = (id: BloqueId) => {
    setCompletados((actual) => (actual.includes(id) ? actual : [...actual, id]));
    setVista('bloques');
  };

  const abrirBloque = (id: BloqueId) => {
    if (id === 'identificacion') {
      setVista('identificacion');
      return;
    }
    // los otros tres bloques todavía no tienen pantalla propia
  };

  if (vista === 'identificacion') {
    return (
      <AutenticacionCliente
        datos={datosIdentificacion}
        onCambiarDatos={cambiarDatosIdentificacion}
        onRegresar={() => setVista('bloques')}
        onSalir={() => setVista('home')}
        onEnviar={() => completarBloque('identificacion')}
      />
    );
  }
  if (vista === 'bloques') {
    return (
      <BloquesSolicitud
        completados={completados}
        avance={avanceMostrado}
        onAbrirBloque={abrirBloque}
        onRegresar={() => setVista('nuevaSolicitud')}
        onSalir={() => setVista('home')}
      />
    );
  }
  if (vista === 'nuevaSolicitud') {
    return (
      <NuevaSolicitud
        datos={datosSolicitud}
        onCambiarDatos={cambiarDatosSolicitud}
        onRegresar={() => setVista('home')}
        onComenzar={() => setVista('bloques')}
      />
    );
  }
  return <HomeSolicitudes onNuevaSolicitud={() => setVista('nuevaSolicitud')} />;
}
