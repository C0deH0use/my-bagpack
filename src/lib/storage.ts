import type { PackingItem } from '../types';
import { normalizeItems } from './items';

const STORAGE_KEY = 'kids_packing_list_data_v3';

export function loadStoredItems(fallback: PackingItem[]): PackingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return fallback;
    const stored = normalizeItems(JSON.parse(raw)).filter((i) => i.id !== '180' && i.id !== '196');
    const fallbackByName = new Map(fallback.map((f) => [`${f.personId}\u0000${f.name.trim().toLowerCase()}`, f]));
    for (const item of stored) {
      const fb = fallbackByName.get(`${item.personId}\u0000${item.name.trim().toLowerCase()}`);
      if (fb && !item.svgKey && fb.svgKey) {
        item.svgKey = fb.svgKey;
      }
      if (fb && fb.aiImage) {
        item.aiImage = fb.aiImage;
      }
    }
    const storedKeys = new Set(stored.map((i) => `${i.personId}\u0000${i.name.trim().toLowerCase()}`));
    const newItems = fallback.filter(
      (fb) => !storedKeys.has(`${fb.personId}\u0000${fb.name.trim().toLowerCase()}`)
    );
    if (newItems.length > 0) {
      return [...stored, ...newItems];
    }
    return stored;
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
