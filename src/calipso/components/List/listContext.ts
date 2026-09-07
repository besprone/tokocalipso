import { createContext } from 'react';

export type ListItemLayout = 'stacked' | 'horizontal';

/**
 * `List` publica el `layout` derivado de su `size` (sm → stacked, md →
 * horizontal). `ListItem` lo consume salvo que reciba un `layout` explícito.
 */
export const ListContext = createContext<{ layout: ListItemLayout } | null>(null);
