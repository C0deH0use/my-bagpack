import type { Category } from '../types';
import { ALL_CATEGORY } from '../data/categories';

interface CategoryTabsProps {
  categories: Category[];
  currentId: string;
  /** kategorie w pełni spakowane — dostają zieloną odznakę ✓ */
  doneIds: ReadonlySet<string>;
  onSwitch: (id: string) => void;
}

export function CategoryTabs({ categories, currentId, doneIds, onSwitch }: CategoryTabsProps) {
  const catalogActive = currentId === ALL_CATEGORY.id;

  return (
    <section className="mb-6 no-print">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
        Wybierz dokąd idziecie:
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isActive = cat.id === currentId;
          const isDone = doneIds.has(cat.id);
          const classes = isActive
            ? `${cat.color} ring-2 ring-indigo-500 scale-105 font-bold shadow-md`
            : isDone
              ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 font-medium';
          return (
            <button
              key={cat.id}
              onClick={() => onSwitch(cat.id)}
              className={`relative px-4 py-2.5 rounded-2xl border text-sm transition-all flex items-center gap-2 ${classes}`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span>{cat.name}</span>
              {isDone && (
                <span className="absolute -top-2 -right-1.5 w-6 h-6 bg-emerald-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md bounce-in">
                  ✓
                </span>
              )}
            </button>
          );
        })}

        {/* baza wszystkich przedmiotów — wygląda inaczej niż kategorie, bo nią nie jest */}
        <span className="w-px self-stretch bg-slate-300 mx-1" aria-hidden="true" />
        <button
          onClick={() => onSwitch(ALL_CATEGORY.id)}
          title="Baza wszystkich stworzonych rzeczy"
          className={`px-4 py-2.5 rounded-2xl text-sm transition-all flex items-center gap-2 border-2 ${
            catalogActive
              ? 'bg-slate-700 text-white border-slate-700 font-bold shadow-md scale-105'
              : 'border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 font-medium'
          }`}
        >
          <span className="text-xl">{ALL_CATEGORY.icon}</span>
          <span>{ALL_CATEGORY.name}</span>
        </button>
      </div>
    </section>
  );
}
