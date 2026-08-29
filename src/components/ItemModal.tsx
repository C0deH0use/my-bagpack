import { useEffect, useState } from 'react';
import type { PackingItem } from '../types';
import type { ItemFormValues } from '../hooks/usePackingList';
import { CATEGORIES } from '../data/categories';
import { EMOJI_LIST } from '../data/emojiList';
import { IconClose } from './icons';

interface ItemModalProps {
  open: boolean;
  editingItem: PackingItem | null;
  defaultCategoryId: string;
  onClose: () => void;
  onSubmit: (values: ItemFormValues, id?: string) => void;
}

export function ItemModal({ open, editingItem, defaultCategoryId, onClose, onSubmit }: ItemModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_LIST[0]);
  const [quantity, setQuantity] = useState(1);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  // Za każdym otwarciem ustawiamy pola od nowa (edycja albo dodawanie)
  useEffect(() => {
    if (!open) return;
    setName(editingItem?.name ?? '');
    setEmoji(editingItem?.emoji || EMOJI_LIST[0]);
    setQuantity(editingItem?.quantity ?? 1);
    setCategoryId(editingItem?.categoryId ?? defaultCategoryId);
    // defaultCategoryId celowo pomijamy — liczy się moment otwarcia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, emoji, quantity, categoryId }, editingItem?.id);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
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
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
              {EMOJI_LIST.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEmoji(option)}
                  className={`text-2xl p-2 rounded-xl hover:bg-indigo-100 transition border flex items-center justify-center ${
                    option === emoji ? 'bg-indigo-100 border-indigo-400' : 'border-transparent'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ilość do zabrania</label>
              <input
                type="number"
                min={1}
                max={99}
                required
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setQuantity(Number.isNaN(value) ? 1 : Math.min(99, Math.max(1, value)));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Kategoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 bg-white font-medium text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
