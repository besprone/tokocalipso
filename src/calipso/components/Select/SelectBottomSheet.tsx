import { useState } from 'react';
import type { ReactNode } from 'react';
import { Checkmark, ChevronDown } from '@carbon/icons-react';
import { TextField } from '../TextField/TextField';
import { BottomSheet } from '../Overlays/BottomSheet';
import { List } from '../List/List';
import { ListItem } from '../List/ListItem';
import './Select.css';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectBottomSheetProps = {
  label: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** Título del bottom sheet — si se omite usa `label`. */
  sheetLabel?: ReactNode;
  placeholder?: string;
  className?: string;
};

/**
 * SelectBottomSheet — selector para mobile/app: visualmente un
 * `TextField`, funcionalmente un disparador de `BottomSheet` con un
 * `List` de opciones. Figma: `pattern_select_bottom_sheet`.
 *
 * No permite escritura ni abre teclado (el `input` es `readOnly`) — el
 * click que abre el sheet vive en un `<div>` que envuelve SOLO el
 * `TextField` (cubre todo el campo, sin zonas muertas al clickear el
 * label o el chevron). `BottomSheet` no usa portal — renderiza inline en
 * el árbol de React — así que ese `onClick` NO puede envolver también al
 * `BottomSheet`: un click en una opción de la lista burbujearía hasta ahí
 * y reabriría el sheet justo después de que `handleSelect` lo cierra
 * (bug real encontrado y corregido — mismo motivo por el que tampoco se
 * usa `onFocus` como disparador: `BottomSheet` restaura el foco al
 * trigger al cerrarse, lo que reabriría en loop si el trigger abriera
 * "on focus").
 */
export function SelectBottomSheet({
  label,
  helperText,
  error,
  disabled,
  options,
  value,
  onChange,
  sheetLabel,
  placeholder = 'Selecciona una opción',
  className,
}: SelectBottomSheetProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const selected = options.find((o) => o.value === value);

  const openSheet = () => {
    if (disabled) return;
    setMounted(true);
    setOpen(true);
  };
  const closeSheet = () => setOpen(false);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    closeSheet();
  };

  return (
    <div className={['select-bottom-sheet', className].filter(Boolean).join(' ')}>
      <div className="select-bottom-sheet__trigger" onClick={openSheet}>
        <TextField
          label={label}
          helperText={helperText}
          error={error}
          disabled={disabled}
          showTrailing
          trailingIcon={<ChevronDown className="select-bottom-sheet__chevron" />}
          readOnly
          value={selected?.label ?? ''}
          placeholder={placeholder}
          aria-haspopup="dialog"
          aria-expanded={open}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openSheet();
            }
          }}
        />
      </div>
      {mounted && (
        <BottomSheet
          open={open}
          onClose={closeSheet}
          onExited={() => setMounted(false)}
          label={sheetLabel ?? label}
          showHandle
        >
          <List type="segmented">
            {options.map((option) => (
              <ListItem
                key={option.value}
                label={option.label}
                selected={option.value === value}
                disabled={option.disabled}
                trailing={
                  option.value === value ? (
                    <Checkmark className="select-bottom-sheet__check" aria-hidden="true" />
                  ) : undefined
                }
                interactive
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
              />
            ))}
          </List>
        </BottomSheet>
      )}
    </div>
  );
}
