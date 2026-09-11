import { useState } from 'react';

import { HomeSolicitudes } from './screens/HomeSolicitudes/HomeSolicitudes';
import { BloquesSolicitud } from './screens/BloquesSolicitud/BloquesSolicitud';
import { NuevaSolicitud } from './screens/NuevaSolicitud/NuevaSolicitud';
import { AutenticacionCliente } from './screens/AutenticacionCliente/AutenticacionCliente';
import type { BloqueId } from './datos/bloques';

/**
 * Navegación del prototipo: un estado de vista, sin router.
 *
 * Cuando haya URLs que compartir, deep links o botón atrás del navegador,
 * aquí es donde entra un router de verdad.
 *
 * `completados` vive aquí (no en BloquesSolicitud) porque tiene que
 * sobrevivir a entrar a un bloque y volver al índice.
 */
type Vista = 'home' | 'nuevaSolicitud' | 'bloques' | 'identificacion';

export function App() {
  const [vista, setVista] = useState<Vista>('home');
  const [completados, setCompletados] = useState<BloqueId[]>([]);

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
        onAbrirBloque={abrirBloque}
        onRegresar={() => setVista('nuevaSolicitud')}
        onSalir={() => setVista('home')}
      />
    );
  }
  if (vista === 'nuevaSolicitud') {
    return (
      <NuevaSolicitud
        onRegresar={() => setVista('home')}
        onComenzar={() => setVista('bloques')}
      />
    );
  }
  return <HomeSolicitudes onNuevaSolicitud={() => setVista('nuevaSolicitud')} />;
}
