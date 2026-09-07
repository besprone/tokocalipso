# tokocalipso

Producto **toko** construido sobre el **Calipso Design System**.

## Estructura

```
src/
  calipso/     copia del design system — NO se edita aquí
  screens/     pantallas del producto, compuestas solo con Calipso
  main.tsx     entrada de la preview (frame móvil de 390×844)
```

`src/calipso/` es una copia literal de `src/{components,lib,styles,tokens}` de
[besprone/pruebaca](https://github.com/besprone/pruebaca) en el commit
`29af4bf`. Cualquier cambio al sistema se hace en ese repo y se vuelve a copiar
aquí; los archivos de `src/calipso/` no se modifican en este proyecto.

## Pantallas

### Home de solicitudes (`src/screens/HomeSolicitudes`)

| Bloque | Componente Calipso |
| --- | --- |
| Acciones + saludo | `AppBar layout="stacked" configuration="home"` con `IconButton` y `Button` |
| Encabezado de sección | `ItemContent layout="horizontal"` + `Link` en el slot `action` |
| Contadores de solicitudes | `Card interactive` + `ItemContent` + `ItemTrailing` en grid 2×2 del mobile grid |
| Promociones y campañas | `Carousel` + `Card` (media + `ItemContent` + `Button secondary`) |
| Navegación principal | `NavigationBar` (5 items, perfil como `type="avatar"`) |

`HomeSolicitudes.css` solo compone layout (grid, stack, padding) con tokens
generados desde Figma — sin colores, sombras ni tipografías propias.

## Desarrollo

```bash
npm install
npm run dev
```
