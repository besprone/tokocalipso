import { createContext } from 'react';
import type { QuickActionScheme, QuickActionSize } from './QuickAction';

/**
 * `QuickActionGroup` publica `size`/`scheme` para que las `QuickAction` hijas
 * no tengan que repetirlos — un `QuickAction` con su propio `size`/`scheme`
 * explícito lo sobreescribe.
 */
export const QuickActionContext = createContext<{
  size?: QuickActionSize;
  scheme?: QuickActionScheme;
} | null>(null);
