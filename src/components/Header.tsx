import type { SyncStatus } from '../types';
import { IconHistory, IconPlus, IconPrint, IconReset } from './icons';

const SYNC_META: Record<SyncStatus, { dot: string; label: string; pulse: boolean }> = {
  local: { dot: 'bg-slate-400', label: 'Tylko to urządzenie', pulse: false },
  saving: { dot: 'bg-amber-400', label: 'Zapisywanie…', pulse: true },
  loading: { dot: 'bg-sky-400', label: 'Łączenie z chmurą…', pulse: true },
  saved: { dot: 'bg-emerald-500', label: 'Zapisano w chmurze', pulse: false },
  error: { dot: 'bg-rose-500', label: 'Błąd chmury', pulse: false },
};

interface HeaderProps {
  syncStatus: SyncStatus;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  onAdd: () => void;
}

export function Header({ syncStatus, onOpenSettings, onOpenHistory, onReset, onAdd }: HeaderProps) {
  const sync = SYNC_META[syncStatus];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-2xl shadow-md -rotate-3">
            🎒
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">Mój Plecaczek</h1>
            <p className="text-xs text-slate-500 font-medium">Spakujmy się razem na wycieczkę!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            title="Ustawienia pamięci i chmury"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            <span className={`sync-dot ${sync.dot} ${sync.pulse ? 'sync-pulse' : ''}`} />
            <span>{sync.label}</span>
          </button>
          <button
            onClick={onOpenHistory}
            className="px-3 py-2 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <IconHistory className="w-4 h-4" />
            <span className="hidden sm:inline">Historia</span>
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <IconReset className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Odśwież checklistę</span>
          </button>
          <button
            onClick={onAdd}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <IconPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Dodaj rzecz</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <IconPrint className="w-4 h-4" />
            <span className="hidden sm:inline">Drukuj</span>
          </button>
        </div>
      </div>
    </header>
  );
}
