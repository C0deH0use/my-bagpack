import type { Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  currentId: string;
  /** kategorie w pełni spakowane — dostają zieloną odznakę ✓ */
  doneIds: ReadonlySet<string>;
  onSwitch: (id: string) => void;
}

export function CategoryTabs({ categories, currentId, doneIds, onSwitch }: CategoryTabsProps) {
  return (
    <section className="mb-6 no-print">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
        Wybierz dokąd idziecie:
      </h2>
      <div className="flex flex-wrap gap-2">
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
      </div>
    </section>
  );
}
