import type { PackingItem } from '../types';

/**
 * Pamięć w chmurze = tajny GitHub Gist z plikiem `moj-plecaczek.json`.
 * Gist automatycznie zapamiętuje WSZYSTKIE swoje wersje,
 * więc dostajemy historię listy za darmo.
 *
 * Token trzymamy tylko w localStorage tej przeglądarki —
 * nigdy nie trafia do kodu strony.
 */

const GIST_FILENAME = 'moj-plecaczek.json';
const TOKEN_KEY = 'mpc_gh_token';
const GIST_ID_KEY = 'mpc_gist_id';
const UPDATED_KEY = 'mpc_updated_at';

const API = 'https://api.github.com';

export interface GistRevision {
  version: string;
  committed_at: string;
  change_status?: { total?: number; additions?: number; deletions?: number };
}

interface CloudPayload {
  app: string;
  updatedAt: string;
  items: PackingItem[];
}

interface GistFile {
  content?: string;
}

interface GistResponse {
  id: string;
  files?: Record<string, GistFile>;
  history?: GistRevision[];
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getGistId(): string {
  return localStorage.getItem(GIST_ID_KEY) ?? '';
}

export function setGistId(id: string): void {
  localStorage.setItem(GIST_ID_KEY, id);
}

export function clearCloudCredentials(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(GIST_ID_KEY);
}

export function isCloudConnected(): boolean {
  return !!(getToken() && getGistId());
}

export function getLocalUpdatedAt(): string {
  return localStorage.getItem(UPDATED_KEY) ?? '';
}

export function setLocalUpdatedAt(value: string): void {
  localStorage.setItem(UPDATED_KEY, value);
}

async function ghFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('zły token (401)');
    if (res.status === 404) throw new Error('nie znaleziono chmurki (404)');
    throw new Error(`GitHub odpowiedział: ${res.status}`);
  }
  return (await res.json()) as T;
}

function buildPayload(items: PackingItem[]): string {
  const updatedAt = new Date().toISOString();
  setLocalUpdatedAt(updatedAt);
  const payload: CloudPayload = { app: 'Mój Plecaczek', updatedAt, items };
  return JSON.stringify(payload, null, 2);
}

/** Zapisuje listę w chmurze; przy pierwszym zapisie tworzy nową chmurkę. */
export async function pushItemsToCloud(items: PackingItem[]): Promise<void> {
  const content = buildPayload(items);
  const gistId = getGistId();

  if (!gistId) {
    const gist = await ghFetch<GistResponse>('/gists', {
      method: 'POST',
      body: JSON.stringify({
        description: 'Mój Plecaczek – dane aplikacji (nie usuwaj!)',
        public: false,
        files: { [GIST_FILENAME]: { content } },
      }),
    });
    setGistId(gist.id);
    return;
  }

  await ghFetch<GistResponse>(`/gists/${gistId}`, {
    method: 'PATCH',
    body: JSON.stringify({ files: { [GIST_FILENAME]: { content } } }),
  });
}

/**
 * Pobiera listę z chmury, ale tylko jeśli jest NOWSZA niż lokalna.
 * Zwraca null, gdy lokalna wersja jest aktualniejsza lub chmurka jest pusta.
 */
export async function pullItemsFromCloud(): Promise<PackingItem[] | null> {
  const gist = await ghFetch<GistResponse>(`/gists/${getGistId()}`);
  const file = gist.files?.[GIST_FILENAME];
  if (!file?.content) return null;

  const data = JSON.parse(file.content) as Partial<CloudPayload>;
  if (!Array.isArray(data.items)) return null;

  const remoteAt = data.updatedAt ?? '';
  if (remoteAt && remoteAt > getLocalUpdatedAt()) {
    setLocalUpdatedAt(remoteAt);
    return data.items;
  }
  return null;
}

/** Historia wersji chmurki (najnowsza pierwsza). */
export async function fetchCloudHistory(): Promise<GistRevision[]> {
  const gist = await ghFetch<GistResponse>(`/gists/${getGistId()}`);
  return gist.history ?? [];
}

/** Pobiera rzeczy z konkretnej wersji chmurki. */
export async function fetchRevisionItems(versionSha: string): Promise<{ items: PackingItem[]; updatedAt: string }> {
  const rev = await ghFetch<GistResponse>(`/gists/${getGistId()}/${versionSha}`);
  const file = rev.files?.[GIST_FILENAME];
  if (!file?.content) throw new Error('brak danych w tej wersji');

  const data = JSON.parse(file.content) as Partial<CloudPayload>;
  if (!Array.isArray(data.items)) throw new Error('brak danych w tej wersji');

  return { items: data.items, updatedAt: data.updatedAt ?? new Date().toISOString() };
}
