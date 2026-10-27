import { CATEGORIES } from '../data/categories';
import { IconReset } from './icons';

export type StatusFilter = 'all' | 'unpacked' | 'packed';

export type SortOption =
  | 'default'
  | 'name-asc'
  | 'name-desc'
  | 'status-unpacked'
  | 'status-packed';

interface ViewFilterBarProps {
  /** Liczba wszystkich rzeczy w bieżącym kontekście widoku */
  totalCount: number;
  /** Liczba rzeczy do spakowania */
  unpackedCount: number;
  /** Liczba rzeczy spakowanych */
  packedCount: number;

  /** Bieżący filtr statusu */
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;

  /** Bieżąca opcja sortowania */
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;

  /** Zapytanie wyszukiwania */
  searchQuery: string;
  onSearchChange: (query: string) => void;

  /** Czy widok to katalog ("Wszystkie przedmioty") */
  isCatalog?: boolean;
  /** Filtr wybranej kategorii w katalogu (null = wszystkie) */
  catalogCategoryFilter?: string | null;
  onCatalogCategoryChange?: (categoryId: string | null) => void;

  /** Czy aktywne są jakiekolwiek niestandardowe filtry lub sortowanie */
  hasActiveFilters: boolean;
  /** Resetowanie filtrów i sortowania do stanu domyślnego */
  onResetFilters: () => void;
  /** Opcjonalne odznaczenie wszystkich spakowanych w bieżącej kategorii */
  onResetCategory?: () => void;
}

export function ViewFilterBar({
  totalCount,
  unpackedCount,
  packedCount,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  isCatalog = false,
  catalogCategoryFilter = null,
  onCatalogCategoryChange,
  hasActiveFilters,
  onResetFilters,
  onResetCategory,
}: ViewFilterBarProps) {
  const handleToggleNameSort = () => {
    if (sortBy === 'name-asc') {
      onSortChange('name-desc');
    } else if (sortBy === 'name-desc') {
      onSortChange('default');
    } else {
      onSortChange('name-asc');
    }
  };

  const handleToggleStatusSort = () => {
    if (sortBy === 'status-unpacked') {
      onSortChange('status-packed');
    } else if (sortBy === 'status-packed') {
      onSortChange('default');
    } else {
      onSortChange('status-unpacked');
    }
  };

  const categoryChipClasses = (active: boolean) =>
    `px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`;

  return (
    <div className="mb-6 space-y-3 no-print">
      {/* W trybie katalogu: pasek wyboru kategorii w bazie */}
      {isCatalog && onCatalogCategoryChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Kategoria:
          </span>
          <button
            onClick={() => onCatalogCategoryChange(null)}
            className={categoryChipClasses(catalogCategoryFilter === null)}
          >
            ✨ Wszystkie
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => onCatalogCategoryChange(c.id)}
              className={categoryChipClasses(catalogCategoryFilter === c.id)}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Główny pasek narzędzi: Filtrowanie po statusie + Wyszukiwanie + Sortowanie */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Grupa 1: Filtr po statusie */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
            Status:
          </span>

          {/* Wszystkie */}
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Wszystkie</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Do spakowania */}
          <button
            onClick={() => onStatusFilterChange('unpacked')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'unpacked'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>⏳ Do spakowania</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'unpacked' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {unpackedCount}
            </span>
          </button>

          {/* Spakowane */}
          <button
            onClick={() => onStatusFilterChange('packed')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'packed'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>✅ Spakowane</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'packed' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {packedCount}
            </span>
          </button>

          {/* Szybki przycisk odznaczenia spakowanych, gdy filtr 'spakowane' jest aktywny */}
          {!isCatalog && packedCount > 0 && onResetCategory && statusFilter === 'packed' && (
            <button
              onClick={onResetCategory}
              title="Odznacz wszystkie spakowane rzeczy w tej kategorii"
              className="px-2.5 py-1.5 rounded-xl text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 ml-1"
            >
              <IconReset className="w-3.5 h-3.5 text-amber-600" />
              <span>Odznacz wszystkie</span>
            </button>
          )}
        </div>

        {/* Grupa 2: Wyszukiwarka + Sortowanie */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Wyszukiwanie po nazwie */}
          <div className="relative flex-1 sm:flex-initial sm:w-44">
            <input
              type="text"
              placeholder="Szukaj rzeczy..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-7 pr-7 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs leading-none">🔍</span>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                title="Wyczyść wyszukiwanie"
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs w-4 h-4 flex items-center justify-center font-bold"
              >
                ×
              </button>
            )}
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-0.5 hidden sm:inline">
            Sortuj:
          </span>

          {/* Szybki przycisk: Sortowanie po nazwie */}
          <button
            onClick={handleToggleNameSort}
            title="Sortuj po nazwie (kliknij: A–Z, Z–A, domyślnie)"
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'name-asc' || sortBy === 'name-desc'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>
              {sortBy === 'name-asc' ? '↓ A–Z' : sortBy === 'name-desc' ? '↑ Z–A' : '⇅ Nazwa'}
            </span>
          </button>

          {/* Szybki przycisk: Sortowanie po statusie */}
          <button
            onClick={handleToggleStatusSort}
            title="Sortuj po statusie (kliknij: do spakowania najpierw, spakowane najpierw, domyślnie)"
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'status-unpacked' || sortBy === 'status-packed'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>
              {sortBy === 'status-unpacked'
                ? '⏳ Do spakowania'
                : sortBy === 'status-packed'
                ? '✅ Spakowane'
                : '⇅ Status'}
            </span>
          </button>

          {/* Menu rozwijane sortowania (dla pełnej kontroli i czytelności) */}
          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sortowanie"
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl pl-2.5 pr-7 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
            >
              <option value="default">⚡ Domyślnie</option>
              <option value="name-asc">🔤 Nazwa: A → Z</option>
              <option value="name-desc">🔤 Nazwa: Z → A</option>
              <option value="status-unpacked">⏳ Status: Do spakowania pierwsze</option>
              <option value="status-packed">✅ Status: Spakowane pierwsze</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Przycisk resetowania filtrów */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Wyczyść sortowanie i filtry"
              className="px-2.5 py-2 rounded-xl text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition text-xs font-bold flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
