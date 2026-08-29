import { useEffect, useState } from 'react';
import { fetchCloudHistory, type GistRevision } from '../lib/gist';
import { IconClose } from './icons';

interface HistoryModalProps {
  open: boolean;
  connected: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onRestore: (versionSha: string) => Promise<void>;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export function HistoryModal({ open, connected, onClose, onOpenSettings, onRestore }: HistoryModalProps) {
  const [state, setState] = useState<LoadState>('idle');
  const [revisions, setRevisions] = useState<GistRevision[]>([]);
  const [error, setError] = useState('');
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!open || !connected) return;
    let cancelled = false;
    setState('loading');
    fetchCloudHistory()
      .then((list) => {
        if (cancelled) return;
        setRevisions(list);
        setState('ready');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [open, connected]);

  if (!open) return null;

  const handleRestore = async (sha: string) => {
    if (!window.confirm('Przywrócić listę z tego dnia? Obecna wersja też zostanie zapamiętana w historii.')) return;
    setRestoring(true);
    try {
      await onRestore(sha);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState('error');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">🕰️ Historia listy</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto -mx-1 px-1">
          {!connected && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">☁️</div>
              <p className="text-sm text-slate-600 font-medium mb-1">
                Historia pojawi się po podłączeniu chmurki GitHub.
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Chmurka zapamiętuje każdą wersję listy – można wrócić do każdej z nich.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition"
              >
                Połącz chmurkę
              </button>
            </div>
          )}

          {connected && state === 'loading' && (
            <p className="text-center text-slate-400 py-8 text-sm font-semibold">⏳ Wczytuję historię…</p>
          )}

          {connected && state === 'error' && (
            <p className="text-center text-rose-500 py-8 text-sm font-semibold">
              Nie udało się wczytać historii: {error}
            </p>
          )}

          {connected && state === 'ready' && revisions.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">Historia jest jeszcze pusta.</p>
          )}

          {connected && state === 'ready' && revisions.length > 0 && (
            <ul className="space-y-2">
              {revisions.map((rev, idx) => {
                const isLatest = idx === 0;
                const when = new Date(rev.committed_at).toLocaleString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <li
                    key={rev.version}
                    className={`flex items-center justify-between gap-3 bg-slate-50 border rounded-2xl px-4 py-3 ${
                      isLatest ? 'border-emerald-300' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {when}
                        {isLatest && <span className="text-emerald-600 text-xs font-black"> • najnowsza</span>}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        zmienionych pól: {rev.change_status?.total ?? 0}
                      </p>
                    </div>
                    {isLatest ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <button
                        onClick={() => void handleRestore(rev.version)}
                        disabled={restoring}
                        className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
                      >
                        Przywróć
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {restoring && <p className="text-center text-slate-400 py-2 text-sm font-semibold">⏳ Przywracam…</p>}
        </div>
      </div>
    </div>
  );
}
