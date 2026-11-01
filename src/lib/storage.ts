import type { PackingItem } from '../types';
import { normalizeItems } from './items';

const STORAGE_KEY = 'kids_packing_list_data_v3';

const OBSOLETE_IDS = new Set([
  '18',  // Pieprz (scalony z 27 Sól, pieprz i przyprawy)
  '173', // Koc turystyczny (zastąpiony przez Koc czarny 7)
  '195', // Pieluszka wielorazowa
  '182', // Pasta truskawkowa (zbędny stary wariant katalogowy)
  '176', // Szczoteczka elektryczna katalogowa (scalona z 144)
  '177', // Szczoteczka dziecięca katalogowa
  '212', // Kubek ze szczoteczkami (zbędny wariant katalogowy)
]);

/**
 * Wzbogaca listę rzeczy (z localStorage lub z chmury Gist) o aktualne dane z katalogu domyślnego:
 * 1. Dopasowuje po `id`, a pomocniczo po `personId` + `name`.
 * 2. Przypisuje `aiImage` z domyślnych, jeśli w zapisie brakowało lub plik uległ aktualizacji.
 * 3. Synchronizuje kanoniczną nazwę po ID (np. "Lampka - czołówka" -> "Lampka").
 * 4. Uzupełnia brakujący `svgKey` oraz emoji jeśli w zapisie było zastępcze '📦'.
 * 5. Dołącza nowo dodane pozycje z katalogu domyślnego (np. szlafrok, termos obiadowy).
 */
export function enrichWithDefaults(items: PackingItem[], fallback: PackingItem[]): PackingItem[] {
  // Usuwamy pozycje wycofane lub scalone ze starych wersji lokalnych
  const cleanedItems = items.filter(
    (item) => !OBSOLETE_IDS.has(item.id) && item.name.trim().toLowerCase() !== 'pieprz'
  );

  const fallbackById = new Map(fallback.map((f) => [f.id, f]));
  const fallbackByName = new Map(fallback.map((f) => [`${f.personId}\u0000${f.name.trim().toLowerCase()}`, f]));

  for (const item of cleanedItems) {
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
      // Aktualizacja kanonicznych nazw dla domyślnych wpisów dopasowanych po ID
      if (fb.id === item.id && fb.name !== item.name) {
        item.name = fb.name;
      }
      if (fb.emoji && (!item.emoji || item.emoji === '📦')) {
        item.emoji = fb.emoji;
      }
      // Jeśli rzecz zyskała nowe precyzyjne kategorie w katalogu (np. narty, wycieczka_szkolna)
      // lub miała tylko generyczną kategorię 'wyjazd' z dawnego Notion:
      const onlyGenericWyjazd = item.categoryIds.length === 1 && item.categoryIds[0] === 'wyjazd';
      if ((onlyGenericWyjazd || item.categoryIds.length === 0) && fb.categoryIds.length > 0) {
        item.categoryIds = [...fb.categoryIds];
        item.quantities = { ...fb.quantities };
      } else {
        for (const catId of fb.categoryIds) {
          if (!item.categoryIds.includes(catId) && (catId === 'narty' || catId === 'wycieczka_szkolna')) {
            item.categoryIds.push(catId);
            item.quantities[catId] = fb.quantities[catId] ?? 1;
          }
        }
      }
    }
  }

  const storedIds = new Set(cleanedItems.map((i) => i.id));
  const storedKeys = new Set(cleanedItems.map((i) => `${i.personId}\u0000${i.name.trim().toLowerCase()}`));
  const newItems = fallback.filter(
    (fb) => !storedIds.has(fb.id) && !storedKeys.has(`${fb.personId}\u0000${fb.name.trim().toLowerCase()}`)
  );

  return newItems.length > 0 ? [...cleanedItems, ...newItems] : cleanedItems;
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
