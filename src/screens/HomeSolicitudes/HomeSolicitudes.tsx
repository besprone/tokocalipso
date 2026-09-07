import { useState } from 'react';
import {
  Add,
  ArrowRight,
  Help,
  ListBulleted,
  Notification,
  Search,
} from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { Button } from '../../calipso/components/Button/Button';
import { Card } from '../../calipso/components/Card/Card';
import { Carousel } from '../../calipso/components/Carousel/Carousel';
import { IconButton } from '../../calipso/components/IconButton/IconButton';
import { ItemContent } from '../../calipso/components/ItemBlocks';
import { ItemTrailing } from '../../calipso/components/ItemBlocks/ItemTrailing';
import { Link } from '../../calipso/components/Link/Link';
import { NavigationBar } from '../../calipso/components/Navigation';
import './HomeSolicitudes.css';

/**
 * Home de solicitudes — interpretación de la pantalla de referencia con
 * componentes y tokens del Calipso Design System. No se define ningún estilo
 * fuera del sistema: la hoja `.css` de la pantalla solo compone layout
 * (grid / stack / safe-area) usando tokens de spacing, radius y color.
 *
 * Mapa de la pantalla → sistema:
 *   AppBar (stacked, home)   fila de acciones (IconButton + Button) + saludo
 *   ItemContent (horizontal) encabezado de sección + Link "ver todas"
 *   Card + ItemContent       contadores de solicitudes (grid 2×2 del mobile grid)
 *   Carousel + Card          promociones y campañas
 *   NavigationBar            navegación principal anclada al borde inferior
 */

type Contador = {
  value: string;
  label: string;
};

const contadores: Contador[] = [
  { value: '12', label: 'Totales' },
  { value: '3', label: 'Guardadas' },
  { value: '1', label: 'Regularizar' },
  { value: '12', label: 'Aprobadas' },
];

type Promo = {
  id: string;
  title: string;
  body: string;
};

const promociones: Promo[] = [
  {
    id: 'navidad',
    title: 'Promoción navidad',
    body: 'Consigue más de 4 solicitudes este mes y recibirás 1,000 MXN por cada solicitud extra.',
  },
  {
    id: 'referidos',
    title: 'Promoción referidos',
    body: 'Invita a un asesor y ambos reciben 500 MXN al aprobarse su primera solicitud.',
  },
  {
    id: 'anticipo',
    title: 'Campaña anticipo',
    body: 'Liquida antes del día 20 y adelantamos la dispersión de tus comisiones.',
  },
];

export function HomeSolicitudes() {
  const [seccion, setSeccion] = useState('tramites');

  return (
    <div className="home">
      <AppBar
        configuration="home"
        layout="stacked"
        size="sm"
        headline="Hola, Gerardo!"
        aria-label="Inicio"
        leading={
          <IconButton
            emphasis="ghost"
            scheme="neutral"
            size="lg"
            icon={<Help />}
            aria-label="Ayuda"
          />
        }
        trailing={
          <Button emphasis="primary" size="sm" icon={<Add />}>
            Nuevo
          </Button>
        }
      />

      <main className="home__content">
        <section className="home__section" aria-labelledby="home-solicitudes">
          <ItemContent
            id="home-solicitudes"
            className="home__section-header"
            layout="horizontal"
            label="Tus solicitudes"
            action={<Link href="#solicitudes">ver todas</Link>}
          />

          <div className="home__grid">
            {contadores.map((contador) => (
              <Card
                key={contador.label}
                interactive
                elevation="flat"
                aria-label={`${contador.value} solicitudes ${contador.label.toLowerCase()}`}
                onClick={() => undefined}
              >
                <div className="home__tile">
                  <div className="home__tile-top">
                    <span className="home__tile-value">{contador.value}</span>
                    <ItemTrailing type="icon" icon={<ArrowRight />} />
                  </div>
                  <ItemContent size="md" label={contador.label} />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="home__section" aria-labelledby="home-promos">
          <ItemContent
            id="home-promos"
            className="home__section-header"
            layout="horizontal"
            label="Promociones y campañas"
            action={<Link href="#promociones">ver todas</Link>}
          />

          <Carousel aria-label="Promociones y campañas" itemsPerView={1} loop>
            {promociones.map((promo) => (
              <Card key={promo.id} elevation="flat">
                <span className="home__promo-media" aria-hidden="true" />
                <div className="home__promo-body">
                  <ItemContent label={promo.title} supporting={promo.body} />
                  <Button emphasis="secondary" size="sm">
                    ver más
                  </Button>
                </div>
              </Card>
            ))}
          </Carousel>
        </section>
      </main>

      <div className="home__nav">
        <NavigationBar
          items={[
            { value: 'buscar', label: 'Buscar', icon: <Search /> },
            { value: 'tramites', label: 'Trámites', icon: <ListBulleted /> },
            { value: 'alertas', label: 'Alertas', icon: <Notification /> },
            { value: 'ayuda', label: 'Ayuda', icon: <Help /> },
            {
              value: 'perfil',
              label: 'Perfil',
              type: 'avatar',
              avatarProps: { type: 'initials', label: 'GM' },
            },
          ]}
          value={seccion}
          onChange={setSeccion}
          aria-label="Navegación principal"
        />
      </div>
    </div>
  );
}
