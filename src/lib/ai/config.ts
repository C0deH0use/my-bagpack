/**
 * Konfiguracja „Obrazków AI” — logowanie przez Google (OAuth), bez kluczy API.
 *
 * Client ID OAuth i ID projektu Google Cloud z natury NIE są sekretami
 * (publiczne w aplikacjach przeglądarkowych), więc spokojnie trzymamy je
 * w localStorage. Sam token dostępu żyje tylko w pamięci strony —
 * patrz googleOAuth.ts.
 */

/**
 * Wyłącznik „Obrazków AI”: false = funkcja ukryta w całości (kod zostaje,
 * nic się nie ładuje). Włączenie = zmiana tej jednej linijki na true.
 */
export const AI_FEATURE_ENABLED = false;

const STORAGE_KEY = 'mpc_ai_google';

/** modele Gemini — łatwo podmienić, gdy wyjdą nowe */
export const GEMINI_TEXT_MODEL = 'gemini-3.8-flash';
export const GEMINI_IMAGE_MODEL = 'gemini-3.1-flash-image';

export interface AiGoogleConfig {
  clientId: string;
  projectId: string;
}

function fromEnv(): AiGoogleConfig {
  return {
    clientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ?? '',
    projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID ?? '',
  };
}

/** localStorage > zmienne środowiskowe z budowania (vite .env) */
export function readAiConfig(): AiGoogleConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AiGoogleConfig>;
      return {
        clientId: typeof saved.clientId === 'string' ? saved.clientId : '',
        projectId: typeof saved.projectId === 'string' ? saved.projectId : '',
      };
    }
  } catch {
    // zepsuty zapis — użyj env (albo pustego)
  }
  return fromEnv();
}

export function saveAiConfig(config: AiGoogleConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function isAiConfigured(): boolean {
  return !!readAiConfig().clientId;
}
