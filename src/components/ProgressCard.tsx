import type { Category, Person } from '../types';
import { IconReset } from './icons';

interface ProgressCardProps {
  category: Category;
  /** kontekst osoby (null = "Wszyscy") — czyje rzeczy właśnie pakujemy */
  person?: Person | null;
  packedCount: number;
  totalCount: number;
  /** tryb katalogu: bez pakowania, pokazujemy tylko liczbę rzeczy */
  catalogMode?: boolean;
  /** akcja odznaczenia wszystkich spakowanych w tej kategorii */
  onResetCategory?: () => void;
}

export function ProgressCard({
  category,
  person,
  packedCount,
  totalCount,
  catalogMode = false,
  onResetCategory,
}: ProgressCardProps) {
  const percentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
  const allDone = percentage === 100 && totalCount > 0;

  return (
    <section className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-slate-200/80 no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 bg-amber-100 rounded-2xl">{category.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 flex-wrap">
              {category.name}
              {person && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${person.color}`}>
                  {person.icon} {person.name}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500">
              {catalogMode
                ? 'To baza wszystkich przedmiotów. Wybierz kategorię powyżej, aby pakować! 🎒'
                : allDone
                  ? ' Super! Wszystko jest spakowane! 🎉'
                  : `Zostało jeszcze ${totalCount - packedCount} rzeczy do spakowania.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            {catalogMode ? (
              <>
                <span className="text-2xl font-black text-indigo-600">{totalCount}</span>
                <span className="text-xs text-slate-400 block font-semibold">przedmiotów w bazie</span>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-2xl font-black text-indigo-600">
                    {packedCount} / {totalCount}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">({percentage}%)</span>
                </div>
                <span className="text-xs text-slate-400 block font-semibold">spakowanych rzeczy</span>
              </>
            )}
          </div>

          {!catalogMode && packedCount > 0 && onResetCategory && (
            <button
              onClick={onResetCategory}
              title={`Odznacz wszystkie (${packedCount}) spakowane rzeczy w kategorii ${category.name}`}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-2xl transition flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 shrink-0"
            >
              <IconReset className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Odznacz spakowane</span>
              <span className="sm:hidden">Odznacz</span>
            </button>
          )}
        </div>
      </div>

      {!catalogMode && (
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </section>
  );
}

