import type { Category, PackingItem } from '../types';
import { SVG_DRAWINGS } from '../data/svgDrawings';
import { IconCheck, IconClose, IconPlus } from './icons';

interface CatalogPickerModalProps {
  open: boolean;
  /** kategoria, którą właśnie komponujemy */
  category: Category;
  items: PackingItem[];
  onToggleAssignment: (itemId: string, categoryId: string) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

/**
 * Komponowanie kategorii: zaznaczamy rzeczy z katalogu,
 * które mają się w niej znaleźć. Zmiany zapisują się od razu.
 */
export function CatalogPickerModal({
  open,
  category,
  items,
  onToggleAssignment,
  onCreateNew,
  onClose,
}: CatalogPickerModalProps) {
  if (!open) return null;

  const assignedCount = items.filter((i) => i.categoryIds.includes(category.id)).length;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xl font-bold text-slate-800">
            {category.icon} {category.name}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Zaznacz rzeczy z katalogu, które pakujecie w tej kategorii. Ilość ustawisz później przyciskami +/− na
          karcie. <b>Wybrano: {assignedCount}</b>
        </p>

        <div className="overflow-y-auto -mx-1 px-1 space-y-1.5 flex-1">
          {items.map((item) => {
            const assigned = item.categoryIds.includes(category.id);
            const svg = item.svgKey ? SVG_DRAWINGS[item.svgKey] : undefined;
            return (
              <button
                key={item.id}
                onClick={() => onToggleAssignment(item.id, category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl border-2 text-left transition ${
                  assigned
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl p-1 flex items-center justify-center shrink-0">
                  {svg ? (
                    <span className="w-full h-full block" dangerouslySetInnerHTML={{ __html: svg }} />
                  ) : (
                    <span className="text-2xl">{item.emoji || '📦'}</span>
                  )}
                </span>
                <span className={`flex-1 text-sm font-bold ${assigned ? 'text-emerald-900' : 'text-slate-700'}`}>
                  {item.name}
                </span>
                <span
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition ${
                    assigned ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {assigned && <IconCheck className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}

          <button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition text-sm font-bold"
          >
            <IconPlus className="w-4 h-4" />
            Stwórz nową rzecz
          </button>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
}
