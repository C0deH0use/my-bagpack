import { CATEGORIES } from '../data/categories';

interface CatalogFilterBarProps {
  /** null = pokaż wszystkie przedmioty */
  filterId: string | null;
  onFilterChange: (id: string | null) => void;
  sortAZ: boolean;
  onToggleSort: () => void;
}

/** Pasek filtrowania i sortowania w widoku „Wszystkie przedmioty” */
export function CatalogFilterBar({ filterId, onFilterChange, sortAZ, onToggleSort }: CatalogFilterBarProps) {
  const chipClasses = (active: boolean) =>
    `px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 no-print">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Filtruj:</span>
      <button onClick={() => onFilterChange(null)} className={chipClasses(filterId === null)}>
        ✨ Wszystkie
      </button>
      {CATEGORIES.map((c) => (
        <button key={c.id} onClick={() => onFilterChange(c.id)} className={chipClasses(filterId === c.id)}>
          <span>{c.icon}</span>
          <span>{c.name}</span>
        </button>
      ))}

      <span className="flex-1" />

      <button onClick={onToggleSort} title="Sortuj alfabetycznie" className={chipClasses(sortAZ)}>
        ⇅ A–Z
      </button>
    </div>
  );
}
