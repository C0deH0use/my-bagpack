import type { Category } from '../types';

interface ProgressCardProps {
  category: Category;
  packedCount: number;
  totalCount: number;
  /** tryb katalogu: bez pakowania, pokazujemy tylko liczbę rzeczy */
  catalogMode?: boolean;
}

export function ProgressCard({ category, packedCount, totalCount, catalogMode = false }: ProgressCardProps) {
  const percentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
  const allDone = percentage === 100 && totalCount > 0;

  return (
    <section className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-slate-200/80 no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 bg-amber-100 rounded-2xl">{category.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{category.name}</h2>
            <p className="text-sm text-slate-500">
              {catalogMode
                ? 'Tu mieszkają wszystkie rzeczy. Wybierz kategorię powyżej, aby pakować! 🎒'
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
                <span className="text-xs text-slate-400 block font-semibold">rzeczy w katalogu</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-indigo-600">
                  {packedCount} / {totalCount}
                </span>
                <span className="text-xs text-slate-400 block font-semibold">spakowanych rzeczy</span>
              </>
            )}
          </div>
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

