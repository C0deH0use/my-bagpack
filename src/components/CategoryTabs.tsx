import type { Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  currentId: string;
  onSwitch: (id: string) => void;
}

export function CategoryTabs({ categories, currentId, onSwitch }: CategoryTabsProps) {
  return (
    <section className="mb-6 no-print">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
        Wybierz dokąd idziecie:
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = cat.id === currentId;
          const classes = isActive
            ? `${cat.color} ring-2 ring-indigo-500 scale-105 font-bold shadow-md`
            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 font-medium';
          return (
            <button
              key={cat.id}
              onClick={() => onSwitch(cat.id)}
              className={`px-4 py-2.5 rounded-2xl border text-sm transition-all flex items-center gap-2 ${classes}`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
