/**
 * Cache obrazków AI po nazwie rzeczy — ta sama „bluza” nie woła Gemini
 * za każdym razem, tylko zwraca obrazek z pamięci przeglądarki.
 */

const STORAGE_KEY = 'mpc_ai_image_cache_v1';

function cacheKey(name: string): string {
  return name.trim().toLowerCase();
}

function readAll(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function getCachedImage(name: string): string {
  return readAll()[cacheKey(name)] ?? '';
}

export function cacheImage(name: string, dataUrl: string): void {
  const all = readAll();
  all[cacheKey(name)] = dataUrl;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // brak miejsca — porzućmy starszą pamięć i zapiszmy od nowa
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ [cacheKey(name)]: dataUrl }));
    } catch {
      // trudno — obrazek zostanie tylko w samej rzeczy
    }
  }
}
