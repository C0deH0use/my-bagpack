import { useEffect, useRef, useState } from 'react';
import type { ConnectResult, PackingItem } from '../types';
import { getGistId, getToken } from '../lib/gist';
import { IconClose } from './icons';

interface SettingsModalProps {
  open: boolean;
  cloudConnected: boolean;
  items: PackingItem[];
  onClose: () => void;
  onConnect: (token: string, joinGistId: string) => Promise<ConnectResult>;
  onDisconnect: () => void;
  onImport: (items: PackingItem[]) => void;
}

interface Message {
  text: string;
  isError: boolean;
}

export function SettingsModal({
  open,
  cloudConnected,
  items,
  onClose,
  onConnect,
  onDisconnect,
  onImport,
}: SettingsModalProps) {
  const [token, setTokenInput] = useState('');
  const [joinId, setJoinId] = useState('');
  const [gistId, setGistIdState] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTokenInput(getToken());
    setGistIdState(getGistId());
    setJoinId('');
    setMessage(null);
    setBusy(false);
  }, [open]);

  if (!open) return null;

  const handleConnect = async () => {
    setBusy(true);
    setMessage(null);
    const result = await onConnect(token.trim(), cloudConnected ? '' : joinId.trim());
    setBusy(false);
    setMessage({ text: result.message, isError: !result.ok });
    setGistIdState(getGistId());
  };

  const handleDisconnect = () => {
    onDisconnect();
    setGistIdState('');
    setMessage({ text: 'Odłączono. Lista dalej zapisuje się w tej przeglądarce.', isError: false });
  };

  const handleCopyGistId = () => {
    void navigator.clipboard.writeText(gistId).then(() => {
      setMessage({ text: 'Skopiowano ID chmurki 📋', isError: false });
    });
  };

  const handleExport = () => {
    const payload = { app: 'Mój Plecaczek', exportedAt: new Date().toISOString(), items };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'moj-plecaczek-kopia.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as { items?: PackingItem[] };
        if (!Array.isArray(data.items)) throw new Error('zły format pliku');
        onImport(data.items);
        onClose();
      } catch (err) {
        setMessage({
          text: 'Nie udało się wczytać pliku: ' + (err instanceof Error ? err.message : String(err)),
          isError: true,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">☁️ Pamięć i chmura</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 mb-4 text-xs text-indigo-800 leading-relaxed">
          Lista zapisuje się sama w tej przeglądarce. Jeśli połączysz <b>chmurę GitHub (Gist)</b>, lista będzie taka
          sama na telefonie i komputerze, a w zakładce <b>Historia</b> zobaczysz i przywrócisz każdą starszą wersję.
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Token GitHub (z uprawnieniem "gist")
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_..."
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Token zostaje tylko w tej przeglądarce – nie trafia do kodu strony.
            </p>
          </div>

          {gistId && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Twoja chmurka (ID)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={gistId}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono"
                />
                <button
                  onClick={handleCopyGistId}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
                >
                  Kopiuj
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Wpisz to ID na drugim urządzeniu (np. telefonie córki), aby mieć wspólną listę.
              </p>
            </div>
          )}

          {!cloudConnected && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Masz już chmurkę? Wpisz jej ID
              </label>
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="np. 8f3c2a..."
                autoComplete="off"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm font-mono"
              />
            </div>
          )}

          {message && (
            <p className={`text-sm font-semibold ${message.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
              {message.text}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => void handleConnect()}
              disabled={busy}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md transition"
            >
              {busy ? '⏳ Łączenie…' : '💾 Zapisz i połącz'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Odłącz chmurę
            </button>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Kopia zapasowa na dysku</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold rounded-xl text-sm transition"
              >
                ⬇️ Pobierz kopię
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
              >
                ⬆️ Wczytaj kopię
              </button>
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
