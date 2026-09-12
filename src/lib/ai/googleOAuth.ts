/**
 * Logowanie do Google (Identity Services) dla Obrazków AI.
 *
 * Dostajemy KRÓTKOTRWAŁY token dostępu (~1 h) i trzymamy go WYŁĄCZNIE
 * w pamięci strony — nigdy w localStorage ani w danych aplikacji.
 * Po odświeżeniu strony logowanie trzeba powtórzyć; póki żyje sesja
 * Google, odnowienie zwykle dzieje się bez pytania.
 */

import { readAiConfig } from './config';

// minimalne typy GIS (Google Identity Services) — bez paczki @types
interface GsiTokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
}

interface GsiError {
  type?: string;
  message?: string;
}

interface GsiTokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void;
}

interface GsiOauth2 {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: GsiTokenResponse) => void;
    error_callback?: (error: GsiError) => void;
  }): GsiTokenClient;
  revoke(token: string, done?: () => void): void;
}

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GsiOauth2 } };
  }
}

/** dokładnie ten zestaw uprawnień co w quickstart OAuth Gemini API */
export const GEMINI_OAUTH_SCOPE =
  'https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/generative-language.retriever';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
/** odświeżamy token minutę przed jego wygaśnięciem */
const SAFETY_MARGIN_MS = 60_000;

let memory: { token: string; expiresAt: number } | null = null;
let gsiPromise: Promise<GsiOauth2> | null = null;

function loadGsi(): Promise<GsiOauth2> {
  const oauth2 = window.google?.accounts?.oauth2;
  if (oauth2) return Promise.resolve(oauth2);
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => {
      const loaded = window.google?.accounts?.oauth2;
      if (loaded) resolve(loaded);
      else reject(new Error('Google Identity Services nie wystartowały'));
    };
    script.onerror = () => reject(new Error('nie udało się wczytać logowania Google'));
    document.head.appendChild(script);
  });
  return gsiPromise;
}

export function hasFreshToken(): boolean {
  return !!memory && memory.expiresAt > Date.now() + SAFETY_MARGIN_MS;
}

export function minutesLeft(): number {
  return memory ? Math.max(0, Math.round((memory.expiresAt - Date.now()) / 60_000)) : 0;
}

/**
 * Loguje się i zwraca świeży token. Popup Google pokazuje się tylko
 * za pierwszym razem (albo po wygaśnięciu sesji) — potem zgoda odnawia
 * się po cichu.
 */
export async function signInWithGoogle(): Promise<string> {
  const oauth2 = await loadGsi();
  const clientId = readAiConfig().clientId;
  if (!clientId) throw new Error('najpierw podaj Client ID OAuth w ustawieniach');

  return new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: GEMINI_OAUTH_SCOPE,
      callback: (response) => {
        memory = {
          token: response.access_token,
          expiresAt: Date.now() + response.expires_in * 1000,
        };
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(new Error(error.message || `logowanie przerwane (${error.type ?? '?'})`));
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}

/** Token „na już”: świeży z pamięci albo świeżo pobrany. */
export async function getAccessToken(): Promise<string> {
  if (hasFreshToken() && memory) return memory.token;
  return signInWithGoogle();
}

/** Zapomina token i cofa zgodę w Google. */
export function signOutFromGoogle(): void {
  if (memory) {
    window.google?.accounts?.oauth2?.revoke(memory.token);
    memory = null;
  }
}
