import { createRoot } from "react-dom/client";

import "./calipso/styles/tokens.css";
import "./app.css";
import { HomeSolicitudes } from "./screens/HomeSolicitudes/HomeSolicitudes";

/**
 * Sin <StrictMode> a propósito, temporalmente.
 *
 * Los overlays del DS (BottomSheet, Dialog, SideDrawer) se quedan fuera de
 * pantalla con la doble invocación de efectos de StrictMode: el cleanup del
 * efecto que cancela el muelle al desmontar mata el muelle de entrada, y el
 * efecto que lo arrancó ya no lo reinicia porque su guarda `prevOpen` cree que
 * el trabajo está hecho. Ver BottomSheet.tsx, Dialog.tsx:136, SideDrawer.tsx:123.
 *
 * Solo pasa en dev; en producción React no duplica los efectos. Se restaura en
 * cuanto el DS lo arregle.
 */
createRoot(document.getElementById("root")!).render(<HomeSolicitudes />);
