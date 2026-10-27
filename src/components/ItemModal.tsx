import { useEffect, useMemo, useState } from 'react';
import type { PackingItem } from '../types';
import type { ItemFormValues } from '../hooks/usePackingList';
import { ALL_CATEGORY_ID } from '../data/categories';
import { PERSONS } from '../data/persons';
import { EMOJI_LIST } from '../data/emojiList';
import { SVG_DRAWINGS } from '../data/svgDrawings';
import { GALLERY_IMAGES } from '../data/galleryImages';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import { IconCheck, IconClose } from './icons';
import { AI_FEATURE_ENABLED, isAiConfigured } from '../lib/ai/config';
import { getItemImageUrl } from '../lib/imageUrl';

/** Wybrana grafika: rysunek SVG, emoji albo ilustracja 2D Cartoon */
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
  const [activeGraphicTab, setActiveGraphicTab] = useState<'ai' | 'svg' | 'emoji'>('ai');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<string>('all');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [personId, setPersonId] = useState(defaultPersonId);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiFailure, setAiFailure] = useState('');
  const [aiAvailable, setAiAvailable] = useState(false);

  // Za każdym otwarciem ustawiamy pola od nowa (edycja albo dodawanie)
  useEffect(() => {
    if (!open) return;
    setName(editingItem?.name ?? '');
    const initialIcon: IconChoice = editingItem?.aiImage
      ? { kind: 'ai', url: editingItem.aiImage }
      : editingItem?.svgKey
        ? { kind: 'svg', key: editingItem.svgKey }
        : { kind: 'emoji', value: editingItem?.emoji || EMOJI_LIST[0] };
    setIcon(initialIcon);
    setActiveGraphicTab(initialIcon.kind === 'ai' ? 'ai' : initialIcon.kind === 'svg' ? 'svg' : 'ai');
    setGallerySearch('');
    setGalleryCategory('all');
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

  const galleryCategories = useMemo(() => {
    const cats = Array.from(new Set(GALLERY_IMAGES.map((img) => img.category)));
    return ['all', ...cats];
  }, []);

  const filteredGalleryImages = useMemo(() => {
    const q = gallerySearch.trim().toLowerCase();
    return GALLERY_IMAGES.filter((img) => {
      const matchesCategory = galleryCategory === 'all' || img.category === galleryCategory;
      const matchesSearch =
        !q ||
        img.name.toLowerCase().includes(q) ||
        img.category.toLowerCase().includes(q) ||
        img.id.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [gallerySearch, galleryCategory]);

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
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            {editingItem ? 'Edytuj rzecz' : 'Dodaj nową rzecz'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
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

          {/* Wybór grafiki / ikonki */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Grafika rzeczy
            </label>

            {/* Podgląd aktualnie wybranej grafiki */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-3">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-xs overflow-hidden">
                {icon.kind === 'ai' ? (
                  <img src={getItemImageUrl(icon.url)} alt="Wybrana grafika" className="w-full h-full object-contain" />
                ) : icon.kind === 'svg' ? (
                  <div
                    className="w-full h-full p-0.5"
                    dangerouslySetInnerHTML={{ __html: SVG_DRAWINGS[icon.key] || '' }}
                  />
                ) : (
                  <span className="text-3xl select-none">{icon.value}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {icon.kind === 'ai'
                    ? '🌟 Ilustracja 2D Cartoon'
                    : icon.kind === 'svg'
                    ? '✏️ Rysunek wektorowy'
                    : '😀 Emotka'}
                </div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {icon.kind === 'ai'
                    ? GALLERY_IMAGES.find((g) => g.url === icon.url)?.name ?? 'Ilustracja 2D'
                    : icon.kind === 'svg'
                    ? `Wektor: ${icon.key}`
                    : `Emoji: ${icon.value}`}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {icon.kind === 'ai'
                    ? GALLERY_IMAGES.find((g) => g.url === icon.url)?.category ?? 'Katalog grafik'
                    : 'Kliknij poniżej, aby wybrać inną'}
                </div>
              </div>
              {icon.kind !== 'emoji' && (
                <button
                  type="button"
                  onClick={() => setIcon({ kind: 'emoji', value: EMOJI_LIST[0] })}
                  className="text-xs text-slate-400 hover:text-rose-600 font-semibold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition shrink-0 cursor-pointer"
                  title="Przywróć standardowe emoji"
                >
                  Usuń grafikę
                </button>
              )}
            </div>

            {/* Przełącznik zakładek */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-2.5">
              <button
                type="button"
                onClick={() => setActiveGraphicTab('ai')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeGraphicTab === 'ai'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🌟 Ilustracje 2D</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
                  {GALLERY_IMAGES.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveGraphicTab('svg')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeGraphicTab === 'svg'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✏️ Wektorowe</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                  {Object.keys(SVG_DRAWINGS).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveGraphicTab('emoji')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeGraphicTab === 'emoji'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>😀 Emoji</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                  {EMOJI_LIST.length}
                </span>
              </button>
            </div>

            {/* Zawartość zakładki: Ilustracje 2D */}
            {activeGraphicTab === 'ai' && (
              <div className="space-y-2 p-2.5 border border-slate-200 rounded-2xl bg-slate-50">
                {/* Wyszukiwarka */}
                <div className="relative">
                  <input
                    type="text"
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    placeholder="🔍 Szukaj ilustracji (np. termos, czepek, kurtka, szlafrok...)"
                    className="w-full text-xs px-3 py-2 pr-7 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                  {gallerySearch && (
                    <button
                      type="button"
                      onClick={() => setGallerySearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtry kategorii */}
                <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {galleryCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGalleryCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                        galleryCategory === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'all' ? 'Wszystkie' : cat}
                    </button>
                  ))}
                </div>

                {/* Siatka ilustracji */}
                <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredGalleryImages.map((img) => {
                    const selected = isSelected({ kind: 'ai', url: img.url });
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setIcon({ kind: 'ai', url: img.url })}
                        className={`relative flex flex-col items-center justify-between p-2 rounded-xl transition bg-white border text-left group cursor-pointer ${
                          selected
                            ? 'border-indigo-600 ring-2 ring-indigo-400 bg-indigo-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs z-10">
                            <IconCheck className="w-2.5 h-2.5" />
                          </span>
                        )}
                        <div className="w-14 h-14 flex items-center justify-center p-0.5 mb-1 shrink-0">
                          <img
                            src={getItemImageUrl(img.url)}
                            alt={img.name}
                            className="w-full h-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 text-center line-clamp-2 leading-tight w-full">
                          {img.name}
                        </span>
                      </button>
                    );
                  })}
                  {filteredGalleryImages.length === 0 && (
                    <div className="col-span-4 py-8 text-center text-xs text-slate-400">
                      Brak ilustracji pasujących do „{gallerySearch}”
                    </div>
                  )}
                </div>

                {AI_FEATURE_ENABLED && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                    <button
                      type="button"
                      onClick={() => void handleGenerateAi()}
                      disabled={!name.trim() || aiBusy || !aiAvailable}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition cursor-pointer"
                    >
                      {aiBusy ? '🎨 Maluję…' : '✨ Wygeneruj nowy obrazek z nazwy'}
                    </button>
                    {aiFailure && <p className="text-[11px] text-rose-600 font-semibold">{aiFailure}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Zawartość zakładki: Rysunki wektorowe */}
            {activeGraphicTab === 'svg' && (
              <div className="max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50">
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.entries(SVG_DRAWINGS).map(([key, svg]) => (
                    <button
                      key={key}
                      type="button"
                      title={key}
                      onClick={() => setIcon({ kind: 'svg', key })}
                      className={`h-12 p-1.5 cursor-pointer ${optionClasses(isSelected({ kind: 'svg', key }))}`}
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Zawartość zakładki: Emoji */}
            {activeGraphicTab === 'emoji' && (
              <div className="max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50">
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon({ kind: 'emoji', value: emoji })}
                      className={`text-2xl p-2 cursor-pointer ${optionClasses(
                        isSelected({ kind: 'emoji', value: emoji }),
                      )}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                    className={`px-3 py-1.5 rounded-xl border text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
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
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition cursor-pointer"
            >
              Zapisz rzecz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
