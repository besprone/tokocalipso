import { useState } from 'react';

import { HomeSolicitudes } from './screens/HomeSolicitudes/HomeSolicitudes';
import { NuevaSolicitud } from './screens/NuevaSolicitud/NuevaSolicitud';

/**
 * Navegación del prototipo: un estado de vista, sin router.
 *
 * Con dos pantallas no hace falta más. Cuando haya URLs que compartir, deep
 * links o botón atrás del navegador, aquí es donde entra un router de verdad.
 */
type Vista = 'home' | 'nuevaSolicitud';

export function App() {
  const [vista, setVista] = useState<Vista>('home');

  if (vista === 'nuevaSolicitud') {
    return <NuevaSolicitud onRegresar={() => setVista('home')} />;
  }
  return <HomeSolicitudes onNuevaSolicitud={() => setVista('nuevaSolicitud')} />;
}
