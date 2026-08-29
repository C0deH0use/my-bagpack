import type { PackingItem } from '../types';
import { normalizeItems } from './items';

const STORAGE_KEY = 'kids_packing_list_data_v2';

export function loadStoredItems(fallback: PackingItem[]): PackingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return fallback;
    return normalizeItems(JSON.parse(raw));
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
