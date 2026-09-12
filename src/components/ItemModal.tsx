import { useEffect, useState } from 'react';
import type { PackingItem } from '../types';
import type { ItemFormValues } from '../hooks/usePackingList';
import { ALL_CATEGORY_ID } from '../data/categories';
import { PERSONS } from '../data/persons';
import { EMOJI_LIST } from '../data/emojiList';
import { SVG_DRAWINGS } from '../data/svgDrawings';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import { IconClose } from './icons';
import { AI_FEATURE_ENABLED, isAiConfigured } from '../lib/ai/config';

/** Wybrana grafika: rysunek SVG, emoji albo obrazek AI */
type IconChoice =
  | { kind: 'svg'; key: string }
  | { kind: 'emoji'; value: string }
  | { kind: 'ai'; url: string };

interface ItemModalProps {
  open: boolean;
  editingItem: PackingItem | null;
  defaultCategoryId: string;
  /** domyślny właściciel nowej rzeczy (bieżący kontekst osoby) */
  defaultPersonId: string;
  onClose: () => void;
  onSubmit: (values: ItemFormValues, id?: string) => void;
}

/**
 * Rzecz w katalogu to grafika + nazwa + właściciel + (opcjonalne) kategorie
 * z multi-selecta. Ilość ustawia się przyciskami +/− na karcie na głównym ekranie.
 */
export function ItemModal({ open, editingItem, defaultCategoryId, defaultPersonId, onClose, onSubmit }: ItemModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconChoice>({ kind: 'emoji', value: EMOJI_LIST[0] });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [personId, setPersonId] = useState(defaultPersonId);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiFailure, setAiFailure] = useState('');
  const [aiAvailable, setAiAvailable] = useState(false);

  // Za każdym otwarciem ustawiamy pola od nowa (edycja albo dodawanie)
  useEffect(() => {
    if (!open) return;
    setName(editingItem?.name ?? '');
    setIcon(
      editingItem?.aiImage
        ? { kind: 'ai', url: editingItem.aiImage }
        : editingItem?.svgKey
          ? { kind: 'svg', key: editingItem.svgKey }
          : { kind: 'emoji', value: editingItem?.emoji || EMOJI_LIST[0] },
    );
    setAiAvailable(AI_FEATURE_ENABLED && isAiConfigured());
    setAiBusy(false);
    setAiFailure('');
    // nowa rzecz: bieżąca kategoria jest od razu zaznaczona; w katalogu — nic
    setSelectedCategoryIds(
      editingItem
        ? [...editingItem.categoryIds]
        : defaultCategoryId !== ALL_CATEGORY_ID
          ? [defaultCategoryId]
          : [],
    );
    setPersonId(editingItem?.personId ?? defaultPersonId);
    // defaultCategoryId/defaultPersonId celowo pomijamy — liczy się moment otwarcia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    );
  };

  /** Rysuje obrazek AI dla wpisanej nazwy (przy okazji loguje przez Google). */
  const handleGenerateAi = async () => {
    const trimmed = name.trim();
    if (!AI_FEATURE_ENABLED || !trimmed || aiBusy) return;
    setAiBusy(true);
    setAiFailure('');
    try {
      // LangGraph + klient Gemini ładowane dopiero tutaj — poza głównym pakietem strony
      const { generateItemPicture } = await import('../lib/ai/imageGraph');
      const result = await generateItemPicture(trimmed);
      if (result.image) setIcon({ kind: 'ai', url: result.image });
      else setAiFailure(result.failure || 'nie udało się narysować obrazka');
    } catch (e) {
      setAiFailure(e instanceof Error ? e.message : String(e));
    } finally {
      setAiBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(
      {
        name: trimmed,
        emoji: icon.kind === 'emoji' ? icon.value : editingItem?.emoji || '📦',
        svgKey: icon.kind === 'svg' ? icon.key : '',
        aiImage: icon.kind === 'ai' ? icon.url : '',
        personId,
        categoryIds: selectedCategoryIds,
      },
      editingItem?.id,
    );
  };

  const isSelected = (option: IconChoice) => {
    if (option.kind === 'ai') return icon.kind === 'ai' && icon.url === option.url;
    if (option.kind === 'svg') return icon.kind === 'svg' && icon.key === option.key;
    return icon.kind === 'emoji' && icon.value === option.value;
  };

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

          {/* Obrazek AI: rysuje Gemini po nazwie (logowanie przez Google — bez kluczy).
              Na razie wyłączony — flaga AI_FEATURE_ENABLED w src/lib/ai/config.ts. */}
          {AI_FEATURE_ENABLED && (
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Obrazek AI <span className="normal-case font-medium text-slate-400">(rysuje Gemini — opcjonalnie)</span>
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-3">
              {icon.kind === 'ai' && (
                <img
                  src={icon.url}
                  alt="Obrazek AI"
                  className="w-16 h-16 object-contain rounded-xl bg-white border border-indigo-100 shadow-sm"
                />
              )}
              <button
                type="button"
                onClick={() => void handleGenerateAi()}
                disabled={!name.trim() || aiBusy || !aiAvailable}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md transition"
              >
                {aiBusy ? '🎨 Maluję…' : icon.kind === 'ai' ? '✨ Narysuj jeszcze raz' : '✨ Narysuj z nazwy'}
              </button>
              {icon.kind === 'ai' && (
                <button
                  type="button"
                  onClick={() => setIcon({ kind: 'emoji', value: EMOJI_LIST[0] })}
                  className="ml-auto text-xs font-bold text-slate-400 hover:text-rose-600 transition"
                >
                  usuń obrazek AI
                </button>
              )}
            </div>
            {aiFailure && <p className="text-xs text-rose-600 font-semibold mt-1">Ups: {aiFailure}</p>}
            {!aiAvailable && (
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Obrazki AI działają po jednorazowej konfiguracji Google (logowanie przez Google,
                bez żadnych kluczy API): ⚙️ ustawienia → „Obrazki AI”.
              </p>
            )}
          </div>
          )}

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

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Czyja to rzecz?</label>
            <div className="flex flex-wrap gap-1.5">
              {PERSONS.map((person) => {
                const selected = person.id === personId;
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setPersonId(person.id)}
                    className={`px-3 py-1.5 rounded-xl border text-sm font-bold transition flex items-center gap-1.5 ${
                      selected
                        ? `${person.color} ring-2 ring-indigo-500 shadow-sm`
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{person.icon}</span>
                    <span>{person.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Kategorie <span className="normal-case font-medium text-slate-400">(opcjonalnie, można kilka)</span>
            </label>
            <CategoryMultiSelect selectedIds={selectedCategoryIds} onToggle={toggleCategory} />
            <p className="text-[11px] text-slate-400 mt-1">
              Ilość ustawisz przyciskami +/− na karcie rzeczy.
            </p>
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
