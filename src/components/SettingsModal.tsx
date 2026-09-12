import { useEffect, useRef, useState } from 'react';
import type { ConnectResult, PackingItem } from '../types';
import { getGistId, getToken } from '../lib/gist';
import { AI_FEATURE_ENABLED, isAiConfigured, readAiConfig, saveAiConfig } from '../lib/ai/config';
import { hasFreshToken, minutesLeft, signInWithGoogle, signOutFromGoogle } from '../lib/ai/googleOAuth';
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

  // Obrazki AI: konfiguracja Google (Client ID + Project ID — publiczne, nie sekrety)
  const [aiClientId, setAiClientId] = useState('');
  const [aiProjectId, setAiProjectId] = useState('');
  const [aiSignedIn, setAiSignedIn] = useState(false);
  const [aiMinutes, setAiMinutes] = useState(0);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMessage, setAiMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!open) return;
    setTokenInput(getToken());
    setGistIdState(getGistId());
    setJoinId('');
    setMessage(null);
    setBusy(false);
    const aiConfig = readAiConfig();
    setAiClientId(aiConfig.clientId);
    setAiProjectId(aiConfig.projectId);
    setAiSignedIn(hasFreshToken());
    setAiMinutes(minutesLeft());
    setAiMessage(null);
    setAiBusy(false);
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

  /* ---------- Obrazki AI ---------- */

  const handleSaveAi = () => {
    saveAiConfig({ clientId: aiClientId.trim(), projectId: aiProjectId.trim() });
    setAiMessage({ text: 'Zapisano ✅ — teraz kliknij „Zaloguj przez Google”.', isError: false });
  };

  const handleAiSignIn = async () => {
    if (aiBusy) return;
    setAiBusy(true);
    setAiMessage(null);
    try {
      await signInWithGoogle();
      setAiSignedIn(true);
      setAiMinutes(minutesLeft());
      setAiMessage({ text: 'Zalogowano ✅ — token trzymamy tylko w pamięci przeglądarki.', isError: false });
    } catch (e) {
      setAiMessage({
        text: 'Logowanie nie udało się: ' + (e instanceof Error ? e.message : String(e)),
        isError: true,
      });
    } finally {
      setAiBusy(false);
    }
  };

  const handleAiSignOut = () => {
    signOutFromGoogle();
    setAiSignedIn(false);
    setAiMinutes(0);
    setAiMessage({ text: 'Wylogowano i cofnięto zgodę — token usunięty z pamięci.', isError: false });
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
          Lista zapisuje się sama w tej przeglądarce. Po wklejeniu <b>tokenu GitHub</b> aplikacja{' '}
          <b>sama znajdzie albo utworzy</b> Waszą chmurkę — lista będzie taka sama na telefonie i komputerze, a w
          zakładce <b>Historia</b> przywrócisz każdą starszą wersję. Na drugim urządzeniu wystarczy wkleić{' '}
          <b>ten sam token</b>.
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Token GitHub (PAT)</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_... albo github_pat_..."
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Token zostaje tylko w tej przeglądarce – nie trafia do kodu strony. Utworzysz go tu:{' '}
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline"
              >
                github.com/settings/tokens/new
              </a>{' '}
              (token typu <b>classic</b>, zaznacz tylko uprawnienie <b>gist</b>).
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
            </div>
          )}

          {!cloudConnected && (
            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer font-semibold hover:text-slate-700">
                Zaawansowane: mam ID chmurki z innego konta
              </summary>
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="ID chmurki (zwykle zostaw puste)"
                autoComplete="off"
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm font-mono"
              />
            </details>
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
              {busy ? '⏳ Łączenie…' : '☁️ Połącz chmurkę'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Odłącz chmurę
            </button>
          </div>

          {/* Obrazki AI — na razie wyłączone: flaga AI_FEATURE_ENABLED w src/lib/ai/config.ts */}
          {AI_FEATURE_ENABLED && (
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">✨ Obrazki AI (Google Gemini)</label>
            <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-2xl p-3 mb-3 text-xs text-fuchsia-800 leading-relaxed">
              Przy dodawaniu rzeczy Gemini może sam narysować obrazek. Logujesz się{' '}
              <b>przez Google (OAuth)</b> — <b>bez żadnego klucza API</b>. Token dostępu trzymamy{' '}
              <b>tylko w pamięci</b> strony (wygasa po ~1 h) i nic nie zapisujemy. Client ID i ID
              projektu to wartości publiczne, nie sekrety.
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={aiClientId}
                onChange={(e) => setAiClientId(e.target.value)}
                placeholder="Client ID OAuth (…apps.googleusercontent.com)"
                autoComplete="off"
                spellCheck={false}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm font-mono"
              />
              <input
                type="text"
                value={aiProjectId}
                onChange={(e) => setAiProjectId(e.target.value)}
                placeholder="ID projektu Google Cloud (opcjonalnie)"
                autoComplete="off"
                spellCheck={false}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Skąd wziąć te dwie wartości — instrukcja krok po kroku w README („Obrazki AI”). W
              skrócie:{' '}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline"
              >
                console.cloud.google.com
              </a>{' '}
              → włącz <b>Generative Language API</b> → utwórz <b>OAuth client ID</b> (typ Web
              application, origin tej strony) → wklej powyżej.
            </p>
            {aiMessage && (
              <p className={`text-sm font-semibold mt-2 ${aiMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                {aiMessage.text}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                onClick={handleSaveAi}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
              >
                💾 Zapisz konfigurację
              </button>
              <button
                onClick={() => void handleAiSignIn()}
                disabled={aiBusy || (!aiClientId.trim() && !isAiConfigured())}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md transition"
              >
                {aiBusy ? '⏳ Loguję…' : '🔐 Zaloguj przez Google'}
              </button>
              {aiSignedIn && (
                <>
                  <span className="text-xs font-bold text-emerald-600">
                    ✅ Zalogowano (token jeszcze ~{aiMinutes} min)
                  </span>
                  <button
                    onClick={handleAiSignOut}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                  >
                    Wyloguj i cofnij zgodę
                  </button>
                </>
              )}
            </div>
          </div>
          )}

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
