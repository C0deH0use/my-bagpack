import type { PackingItem } from '../types';
import { PERSONS } from '../data/persons';

/** Stare formaty danych (z localStorage / starszych wersji chmurki) */
interface LegacyItem {
  id?: unknown;
  personId?: unknown;
  categoryId?: unknown;
  categoryIds?: unknown;
  quantities?: unknown;
  packedIn?: unknown;
  packed?: unknown;
  name?: unknown;
  svgKey?: unknown;
  emoji?: unknown;
  quantity?: unknown;
  aiImage?: unknown;
}

const clampQty = (n: number) => Math.min(99, Math.max(1, Math.round(n)));

/**
 * Ujednolica dane do aktualnego formatu:
 * - brak `personId` (starsze wersje) → rzecz wspólna ("wspolne"),
 * - stary `categoryId` (string) → kategorie,
 * - stara `quantity` + `packed` → ilości i spakowanie PRZYPISANE do kategorii,
 * - scala duplikaty o tej samej nazwie I właścicielu w jedną rzecz
 *   (ta sama nazwa u różnych osób to osobne rzeczy).
 */
export function normalizeItems(raw: unknown): PackingItem[] {
  if (!Array.isArray(raw)) return [];

  const items: PackingItem[] = [];
  raw.forEach((entry, index) => {
    const legacy = entry as LegacyItem;
    if (!legacy || typeof legacy.name !== 'string' || !legacy.name.trim()) return;

    const categoryIds = readCategoryIds(legacy);
    const quantities = readQuantities(legacy, categoryIds);

    items.push({
      id: typeof legacy.id === 'string' ? legacy.id : `${Date.now()}-${index}`,
      personId: readPersonId(legacy),
      categoryIds: Object.keys(quantities),
      quantities,
      packedIn: readPackedIn(legacy, categoryIds),
      name: legacy.name,
      svgKey: typeof legacy.svgKey === 'string' ? legacy.svgKey : '',
      emoji: typeof legacy.emoji === 'string' ? legacy.emoji : '📦',
      ...(typeof legacy.aiImage === 'string' && legacy.aiImage ? { aiImage: legacy.aiImage } : {}),
    });
  });

  return mergeSameNameItems(items);
}

function readPersonId(legacy: LegacyItem): string {
  if (typeof legacy.personId === 'string' && PERSONS.some((p) => p.id === legacy.personId)) {
    return legacy.personId;
  }
  return 'wspolne';
}

function readCategoryIds(legacy: LegacyItem): string[] {
  if (Array.isArray(legacy.categoryIds)) {
    return legacy.categoryIds.filter((c): c is string => typeof c === 'string');
  }
  if (typeof legacy.categoryId === 'string' && legacy.categoryId) {
    return [legacy.categoryId];
  }
  return [];
}

function readQuantities(legacy: LegacyItem, categoryIds: string[]): Record<string, number> {
  const result: Record<string, number> = {};

  if (legacy.quantities && typeof legacy.quantities === 'object') {
    for (const [key, value] of Object.entries(legacy.quantities)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[key] = clampQty(value);
      }
    }
  }

  const fallback = typeof legacy.quantity === 'number' ? clampQty(legacy.quantity) : 1;
  for (const categoryId of categoryIds) {
    if (!(categoryId in result)) result[categoryId] = fallback;
  }
  return result;
}

function readPackedIn(legacy: LegacyItem, categoryIds: string[]): string[] {
  if (Array.isArray(legacy.packedIn)) {
    return legacy.packedIn.filter((c): c is string => typeof c === 'string' && categoryIds.includes(c));
  }
  // bardzo stary format: packed=true dotyczyło wszystkich kategorii rzeczy
  if (legacy.packed === true) return [...categoryIds];
  return [];
}

/** Scala wpisy o identycznej nazwie i właścicielu: łączy kategorie, ilości (max) i spakowanie. */
function mergeSameNameItems(items: PackingItem[]): PackingItem[] {
  const byName = new Map<string, PackingItem>();

  for (const item of items) {
    const key = `${item.personId}\u0000${item.name.trim().toLowerCase()}`;
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, item);
      continue;
    }

    for (const [categoryId, qty] of Object.entries(item.quantities)) {
      existing.quantities[categoryId] = Math.max(existing.quantities[categoryId] ?? 0, qty);
    }
    existing.categoryIds = Object.keys(existing.quantities);
    existing.packedIn = [...new Set([...existing.packedIn, ...item.packedIn])];
    if (!existing.svgKey && item.svgKey) existing.svgKey = item.svgKey;
    if (existing.emoji === '📦' && item.emoji !== '📦') existing.emoji = item.emoji;
    if (!existing.aiImage && item.aiImage) existing.aiImage = item.aiImage;
  }

  return [...byName.values()];
}
