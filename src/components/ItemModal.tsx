import { useEffect, useState } from 'react';
import type { PackingItem } from '../types';
import type { ItemFormValues } from '../hooks/usePackingList';
import { ALL_CATEGORY_ID, CATEGORIES } from '../data/categories';
import { EMOJI_LIST } from '../data/emojiList';
import { SVG_DRAWINGS } from '../data/svgDrawings';
import { IconClose } from './icons';

/** Wybrana ikonka: albo rysunek SVG, albo emoji */
type IconChoice = { kind: 'svg'; key: string } | { kind: 'emoji'; value: string };

interface ItemModalProps {
  open: boolean;
  editingItem: PackingItem | null;
  defaultCategoryId: string;
  onClose: () => void;
  onSubmit: (values: ItemFormValues, id?: string) => void;
}

/**
 * Rzecz w katalogu to tylko grafika + nazwa.
 * Przypisanie do kategorii robimy z poziomu kategorii ("Dodaj z katalogu"),
 * a ilość — przyciskami +/− na karcie na głównym ekranie.
 */
export function ItemModal({ open, editingItem, defaultCategoryId, onClose, onSubmit }: ItemModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconChoice>({ kind: 'emoji', value: EMOJI_LIST[0] });

  // Za każdym otwarciem ustawiamy pola od nowa (edycja albo dodawanie)
  useEffect(() => {
    if (!open) return;
    setName(editingItem?.name ?? '');
    setIcon(
      editingItem?.svgKey
        ? { kind: 'svg', key: editingItem.svgKey }
        : { kind: 'emoji', value: editingItem?.emoji || EMOJI_LIST[0] },
    );
    // defaultCategoryId celowo pomijamy — liczy się moment otwarcia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const targetCategory =
    !editingItem && defaultCategoryId !== ALL_CATEGORY_ID
      ? CATEGORIES.find((c) => c.id === defaultCategoryId)
      : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(
      {
        name: trimmed,
        emoji: icon.kind === 'emoji' ? icon.value : editingItem?.emoji || '📦',
        svgKey: icon.kind === 'svg' ? icon.key : '',
      },
      editingItem?.id,
    );
  };

  const isSelected = (option: IconChoice) =>
    option.kind === 'svg'
      ? icon.kind === 'svg' && icon.key === option.key
      : icon.kind === 'emoji' && icon.value === option.value;

  const optionClasses = (selected: boolean) =>
    `rounded-xl hover:bg-indigo-100 transition border flex items-center justify-center ${
      selected ? 'bg-indigo-100 border-indigo-400' : 'border-transparent'
    }`;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            {editingItem ? 'Edytuj rzecz' : 'Dodaj nową rzecz'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nazwa rzeczy</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Spodnie długie, Maskotka..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Wybierz rysunek / ikonkę</label>
            <div className="max-h-52 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <div className="grid grid-cols-5 gap-1.5">
                {Object.entries(SVG_DRAWINGS).map(([key, svg]) => (
                  <button
                    key={key}
                    type="button"
                    title={key}
                    onClick={() => setIcon({ kind: 'svg', key })}
                    className={`h-12 p-1.5 ${optionClasses(isSelected({ kind: 'svg', key }))}`}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon({ kind: 'emoji', value: emoji })}
                    className={`text-2xl p-2 ${optionClasses(isSelected({ kind: 'emoji', value: emoji }))}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {targetCategory && (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              Nowa rzecz trafi do katalogu i od razu do kategorii{' '}
              <b>
                {targetCategory.icon} {targetCategory.name}
              </b>
              . Ilość ustawisz przyciskami +/− na jej karcie.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
            >
              Zapisz rzecz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
