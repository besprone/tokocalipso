import { useState } from 'react';
import {
  Add,
  Help,
  Image as ImageIcon,
  ListBulleted,
  Notification,
  Search,
} from '@carbon/icons-react';

import { AppBar } from '../../calipso/components/AppBar/AppBar';
import { Button } from '../../calipso/components/Button/Button';
import { Card } from '../../calipso/components/Card/Card';
import { Carousel } from '../../calipso/components/Carousel/Carousel';
import { IconButton } from '../../calipso/components/IconButton/IconButton';
import { ImgSlot } from '../../calipso/components/ImgSlot';
import { ItemContent } from '../../calipso/components/ItemBlocks';
import { ItemTrailing } from '../../calipso/components/ItemBlocks/ItemTrailing';
import { List } from '../../calipso/components/List';
import { ListItem } from '../../calipso/components/List/ListItem';
import { NavigationBar } from '../../calipso/components/Navigation';
import { BottomSheet } from '../../calipso/components/Overlays';
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
 *
 * Shell: la pantalla ocupa todo el alto disponible y se topa en una columna
 * de ancho móvil centrada. Solo el bloque de contenido scrollea — el AppBar
 * queda sticky arriba y la NavigationBar fija abajo, fuera del scroll.
 *
 * El colapso del AppBar al scrollear lo resuelve el propio componente con
 * `collapseOnScroll`.
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

/**
 * Arte de las promos. Por ahora la misma en las tres tarjetas; cuando cada
 * campaña tenga la suya, pasa a ser un campo de `Promo`. Vacío = `ImgSlot`
 * pinta su placeholder.
 */
const IMAGEN_PROMO = '/promos/promo.webp';

/** Opciones del sheet de "Nuevo". Solo la de crédito lleva a algún lado. */
const nuevasOpciones = [
  { id: 'credito', label: 'Nueva solicitud de crédito' },
  { id: 'capacidad', label: 'Nueva consulta de capacidad' },
  { id: 'cotizacion', label: 'Nueva cotización' },
];

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

export type HomeSolicitudesProps = {
  onNuevaSolicitud: () => void;
};

export function HomeSolicitudes({ onNuevaSolicitud }: HomeSolicitudesProps) {
  const [seccion, setSeccion] = useState('tramites');
  // el sheet se desmonta al terminar su animación de salida (`onExited`)
  const [sheetMontado, setSheetMontado] = useState(false);
  const [sheetAbierto, setSheetAbierto] = useState(false);

  const abrirSheet = () => {
    setSheetMontado(true);
    setSheetAbierto(true);
  };
  const ayuda = (
    <IconButton emphasis="ghost" scheme="neutral" size="lg" icon={<Help />} aria-label="Ayuda" />
  );
  const nuevo = (
    <Button emphasis="primary" size="sm" icon={<Add />} onClick={abrirSheet}>
      Nuevo
    </Button>
  );

  return (
    <div className="home">
      <div className="home__scroll">
        <AppBar
          configuration="home"
          size="sm"
          layout="stacked"
          collapseOnScroll
          headline="Hola, Gerardo!"
          aria-label="Inicio"
          leading={ayuda}
          trailing={nuevo}
        />

        <main className="home__content">
          <section className="home__section" aria-labelledby="home-solicitudes">
            <div className="home__section-header">
              <ItemContent id="home-solicitudes" label="Tus solicitudes" />
              <Button emphasis="secondary" size="sm">
                Ver
              </Button>
            </div>

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
                      <ItemTrailing type="icon" />
                    </div>
                    <ItemContent size="md" label={contador.label} />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="home__section" aria-labelledby="home-promos">
            <div className="home__section-header">
              <ItemContent id="home-promos" label="Promociones y campañas" />
              <Button emphasis="secondary" size="sm">
                Ver
              </Button>
            </div>

            <Carousel aria-label="Promociones y campañas" itemsPerView={1} loop>
              {promociones.map((promo) => (
                <Card key={promo.id} elevation="flat">
                  <ImgSlot size="lg" icon={<ImageIcon />}>
                    {IMAGEN_PROMO ? <img src={IMAGEN_PROMO} alt="" /> : undefined}
                  </ImgSlot>
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
      </div>

      {sheetMontado && (
        <BottomSheet
          open={sheetAbierto}
          onClose={() => setSheetAbierto(false)}
          onExited={() => setSheetMontado(false)}
          label="¿Qué quieres crear?"
        >
          <List type="segmented">
            {nuevasOpciones.map((opcion) => (
              <ListItem
                key={opcion.id}
                interactive
                label={opcion.label}
                trailing={<ItemTrailing type="icon" icon={<Add />} />}
                onClick={() => {
                  setSheetAbierto(false);
                  if (opcion.id === 'credito') onNuevaSolicitud();
                }}
              />
            ))}
          </List>
        </BottomSheet>
      )}

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
