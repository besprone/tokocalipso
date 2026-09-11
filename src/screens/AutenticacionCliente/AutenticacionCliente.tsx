import { useState } from 'react';
import { ArrowLeft, Close, Information } from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { Button } from '../../calipso/components/Button/Button';
import { ButtonActions } from '../../calipso/components/ButtonActions';
import { IconButton } from '../../calipso/components/IconButton/IconButton';
import { TextField } from '../../calipso/components/TextField/TextField';
import { useConfirmarSalida } from '../../hooks/useConfirmarSalida';
import './AutenticacionCliente.css';

/**
 * Bloque "Identificación y autenticación" (nodo 16:2371).
 *
 * Mapa de la pantalla → sistema:
 *   AppBar (stacked)  back + cerrar + título + contexto
 *   TextField × 2     celular y correo de el/la cliente
 *   banner            aviso contextual — ver nota abajo
 *   ButtonActions     CTA sticky, bloqueado hasta llenar los dos campos
 *   useConfirmarSalida  sheet de confirmación al salir (nodo 13:2257),
 *                       compartido con las demás pantallas del flujo
 *
 * El banner (`pattern_app_feedback_banner` en Figma: bg/infoMuted + icono +
 * texto) no tiene componente dedicado en el DS — `Card` es la superficie más
 * cercana, pero fija `bg/surface` sin variante de tono, así que usarla aquí
 * implicaría pisar `.card__surface` desde la pantalla. Se compone a mano con
 * los mismos tokens semánticos (bg/infoMuted, icon/info, containers/radius-200)
 * en vez de forzar un componente que no expone lo que hace falta. Candidato a
 * reporte: un banner de feedback contextual persistente, o una variante de
 * tono en `Card`.
 */

export type AutenticacionClienteProps = {
  onRegresar: () => void;
  onSalir: () => void;
  onEnviar: () => void;
};

export function AutenticacionCliente({ onRegresar, onSalir, onEnviar }: AutenticacionClienteProps) {
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const { abrir: abrirConfirmacion, sheet: confirmarSalida } = useConfirmarSalida(onSalir);

  const puedeEnviar = celular.trim() !== '' && correo.trim() !== '';

  return (
    <div className="autenticacion">
      <div className="autenticacion__scroll">
        <AppBar
          layout="stacked"
          size="sm"
          collapseOnScroll
          headline="Autentiquemos al cliente"
          supporting="Ingresa el número de celular y correo de Sara. Le enviaremos un enlace por WhatsApp para que confirme su identidad."
          aria-label="Autentiquemos al cliente"
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

        <main className="autenticacion__contenido">
          <div className="autenticacion__campos">
            <TextField
              label="Número de celular"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
            />
            <TextField
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="autenticacion__banner" role="note">
            <Information className="autenticacion__banner-icono" aria-hidden="true" />
            <p className="autenticacion__banner-texto">
              Si Sara está contigo, podrás capturar su INE, selfie y firma directo desde esta app.
            </p>
          </div>
        </main>

        <ButtonActions surface="screen" sticky>
          <Button emphasis="primary" size="sm" disabled={!puedeEnviar} onClick={onEnviar}>
            Enviar enlace a Sara
          </Button>
        </ButtonActions>
      </div>

      {confirmarSalida}
    </div>
  );
}
