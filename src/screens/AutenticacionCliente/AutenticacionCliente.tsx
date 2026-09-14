import { useState } from 'react';
import { ArrowLeft, Close } from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { FeedbackBanner } from '../../calipso/components/Banner';
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
 *   FeedbackBanner    aviso contextual (nodo 16:3381, `pattern_app_feedback_banner`)
 *   ButtonActions     CTA sticky, bloqueado hasta llenar los dos campos
 *   useConfirmarSalida  sheet de confirmación al salir (nodo 13:2257),
 *                       compartido con las demás pantallas del flujo
 *
 * El nodo de Figma para este banner solo trae `supporting` (Body/sm), sin
 * headline — pero `FeedbackBanner.headline` es obligatorio en el DS. Se usa
 * "Sugerencia" como headline corto y el texto del nodo pasa a `supporting`.
 *
 * Controlada por App.tsx (`datos` + `onCambiarDatos`): si el usuario regresa
 * a esta pantalla sin enviar, lo que ya había escrito sigue ahí.
 *
 * Valida celular (10 dígitos) y correo (formato básico) antes de habilitar
 * el envío. El error solo se muestra después de que el campo pierde el foco
 * una vez (`tocado`) — así no se regaña al usuario antes de que termine de
 * escribir.
 */

function esCelularValido(v: string): boolean {
  return /^\d{10}$/.test(v.replace(/[\s-]/g, ''));
}

function esCorreoValido(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export type DatosIdentificacion = {
  celular: string;
  correo: string;
};

export const datosIdentificacionVacios: DatosIdentificacion = { celular: '', correo: '' };

export type AutenticacionClienteProps = {
  datos: DatosIdentificacion;
  onCambiarDatos: (parcial: Partial<DatosIdentificacion>) => void;
  onRegresar: () => void;
  onSalir: () => void;
  onEnviar: () => void;
};

export function AutenticacionCliente({
  datos,
  onCambiarDatos,
  onRegresar,
  onSalir,
  onEnviar,
}: AutenticacionClienteProps) {
  const { celular, correo } = datos;
  const { abrir: abrirConfirmacion, sheet: confirmarSalida } = useConfirmarSalida(onSalir);
  const [celularTocado, setCelularTocado] = useState(false);
  const [correoTocado, setCorreoTocado] = useState(false);

  const celularValido = esCelularValido(celular);
  const correoValido = esCorreoValido(correo);
  const puedeEnviar = celularValido && correoValido;

  return (
    <div className="autenticacion">
      <div className="autenticacion__scroll">
        <AppBar
          layout="stacked"
          size="sm"
          collapseOnScroll
          headline="Autentiquemos al cliente"
          supporting="Ingresa el número de celular y correo del cliente. Le enviaremos un enlace por WhatsApp para que confirme su identidad."
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
              onChange={(e) => onCambiarDatos({ celular: e.target.value })}
              onBlur={() => setCelularTocado(true)}
              error={celularTocado && celular !== '' && !celularValido}
              helperText={
                celularTocado && celular !== '' && !celularValido
                  ? 'Ingresa un número a 10 dígitos.'
                  : undefined
              }
            />
            <TextField
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => onCambiarDatos({ correo: e.target.value })}
              onBlur={() => setCorreoTocado(true)}
              error={correoTocado && correo !== '' && !correoValido}
              helperText={
                correoTocado && correo !== '' && !correoValido
                  ? 'Ingresa un correo válido.'
                  : undefined
              }
            />
          </div>

          <FeedbackBanner
            headline="Sugerencia"
            supporting="Si el cliente está contigo, podrás capturar su INE, selfie y firma directo desde esta app."
          />
        </main>

        <ButtonActions surface="screen" sticky>
          <Button emphasis="primary" size="sm" disabled={!puedeEnviar} onClick={onEnviar}>
            Enviar enlace
          </Button>
        </ButtonActions>
      </div>

      {confirmarSalida}
    </div>
  );
}
