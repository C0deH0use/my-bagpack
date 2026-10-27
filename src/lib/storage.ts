import type { PackingItem } from '../types';
import { normalizeItems } from './items';

const STORAGE_KEY = 'kids_packing_list_data_v3';

/**
 * Wzbogaca listę rzeczy (z localStorage lub z chmury Gist) o aktualne dane z katalogu domyślnego:
 * 1. Dopasowuje po `id`, a pomocniczo po `personId` + `name`.
 * 2. Przypisuje `aiImage` z domyślnych, jeśli w zapisie brakowało lub plik uległ aktualizacji.
 * 3. Synchronizuje kanoniczną nazwę po ID (np. "Lampka - czołówka" -> "Lampka").
 * 4. Uzupełnia brakujący `svgKey` oraz emoji jeśli w zapisie było zastępcze '📦'.
 * 5. Dołącza nowo dodane pozycje z katalogu domyślnego (np. szlafrok, termos obiadowy).
 */
export function enrichWithDefaults(items: PackingItem[], fallback: PackingItem[]): PackingItem[] {
  const fallbackById = new Map(fallback.map((f) => [f.id, f]));
  const fallbackByName = new Map(fallback.map((f) => [`${f.personId}\u0000${f.name.trim().toLowerCase()}`, f]));

  for (const item of items) {
    const fb =
      fallbackById.get(item.id) ??
      fallbackByName.get(`${item.personId}\u0000${item.name.trim().toLowerCase()}`);

    if (fb) {
      // Jeśli domyślna rzecz ma aiImage, upewnij się że zapisany element również go posiada
      if (fb.aiImage && (!item.aiImage || item.aiImage.startsWith('/items/'))) {
        item.aiImage = fb.aiImage;
      }
      if (fb.svgKey && !item.svgKey) {
        item.svgKey = fb.svgKey;
      }
      // Aktualizacja starych nazw dla domyślnych wpisów dopasowanych po ID
      if (fb.id === item.id && fb.name !== item.name) {
        if (item.name === 'Lampka - czołówka') {
          item.name = fb.name;
        }
      }
      if (fb.emoji && (!item.emoji || item.emoji === '📦')) {
        item.emoji = fb.emoji;
      }
    }
  }

  const storedIds = new Set(items.map((i) => i.id));
  const storedKeys = new Set(items.map((i) => `${i.personId}\u0000${i.name.trim().toLowerCase()}`));
  const newItems = fallback.filter(
    (fb) => !storedIds.has(fb.id) && !storedKeys.has(`${fb.personId}\u0000${fb.name.trim().toLowerCase()}`)
  );

  return newItems.length > 0 ? [...items, ...newItems] : items;
}

export function loadStoredItems(fallback: PackingItem[]): PackingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return fallback;
    const stored = normalizeItems(JSON.parse(raw));
    return enrichWithDefaults(stored, fallback);
  } catch {
    return fallback;
  }
}

export function storeItems(items: PackingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // np. tryb prywatny — lista dalej działa w pamięci
  }
}
