import { useState } from 'react';

import { Button } from '../calipso/components/Button/Button';
import { BottomSheet } from '../calipso/components/Overlays';

/**
 * Confirmación al salir de un flujo de solicitud (nodo 13:2257). Compartida
 * entre todas las pantallas que llevan el IconButton "Salir de la solicitud"
 * en el trailing del AppBar — ninguna debe salir directo sin preguntar.
 *
 * Encapsula el estado montado/abierto del sheet y expone el nodo ya armado,
 * para que cada pantalla solo tenga que llamar `abrir()` desde su botón de
 * cerrar y renderizar `{sheet}`.
 */
export function useConfirmarSalida(onSalir: () => void) {
  // el sheet se desmonta al terminar su animación de salida (`onExited`)
  const [montado, setMontado] = useState(false);
  const [abierto, setAbierto] = useState(false);

  const abrir = () => {
    setMontado(true);
    setAbierto(true);
  };
  const cerrar = () => setAbierto(false);

  const descartarYSalir = () => {
    cerrar();
    onSalir();
  };
  const guardarYSalir = () => {
    // TODO: persistir el borrador cuando exista guardado real; por ahora
    // el efecto visible es el mismo que descartar — no hay backend.
    cerrar();
    onSalir();
  };

  const sheet = montado && (
    <BottomSheet
      open={abierto}
      onClose={cerrar}
      onExited={() => setMontado(false)}
      label="¿Guardar la solicitud?"
      supporting="Puedes retomarla después desde tus solicitudes guardadas."
      footer={
        <>
          <Button emphasis="secondary" size="sm" onClick={descartarYSalir}>
            Descartar y salir
          </Button>
          <Button emphasis="primary" size="sm" onClick={guardarYSalir}>
            Guardar y salir
          </Button>
        </>
      }
    />
  );

  return { abrir, sheet };
}
