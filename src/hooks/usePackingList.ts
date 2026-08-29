import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConnectResult, PackingItem, SyncStatus } from '../types';
import { DEFAULT_ITEMS } from '../data/defaultItems';
import { loadStoredItems, storeItems } from '../lib/storage';
import {
  clearCloudCredentials,
  fetchRevisionItems,
  findExistingGistId,
  getGistId,
  getToken,
  isCloudConnected,
  pullItemsFromCloud,
  pushItemsToCloud,
  setGistId,
  setLocalUpdatedAt,
  setToken,
} from '../lib/gist';

export interface ItemFormValues {
  name: string;
  emoji: string;
  /** klucz rysunku SVG; pusty string = pokazuj emoji zamiast rysunku */
  svgKey: string;
}

const clampQty = (n: number) => Math.min(99, Math.max(1, n));

const CLOUD_SAVE_DELAY_MS = 1200;

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function usePackingList() {
  const [items, setItems] = useState<PackingItem[]>(() => loadStoredItems(DEFAULT_ITEMS));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isCloudConnected() ? 'loading' : 'local');
  const [syncError, setSyncError] = useState('');
  const [cloudConnected, setCloudConnected] = useState(isCloudConnected());

  // itemsRef zawsze trzyma świeżą listę — dzięki temu akcje nie mają "starych" danych
  const itemsRef = useRef(items);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushToCloud = useCallback(async () => {
    if (!getToken()) {
      setSyncStatus('local');
      return;
    }
    setSyncStatus('saving');
    try {
      await pushItemsToCloud(itemsRef.current);
      setSyncError('');
      setSyncStatus('saved');
      setCloudConnected(isCloudConnected());
    } catch (e) {
      setSyncError(errorMessage(e));
      setSyncStatus('error');
    }
  }, []);

  const scheduleCloudSave = useCallback(() => {
    if (!getToken()) {
      setSyncStatus('local');
      return;
    }
    setSyncStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void pushToCloud();
    }, CLOUD_SAVE_DELAY_MS);
  }, [pushToCloud]);

  /**
   * commit = jedyna brama zmian listy: aktualizuje stan, zapisuje
   * w localStorage i (domyślnie) planuje zapis do chmury.
   * Zwraca nową listę, żeby można było od razu zareagować (dźwięk, konfetti).
   */
  const commit = useCallback(
    (next: PackingItem[], options: { cloud?: boolean } = {}): PackingItem[] => {
      itemsRef.current = next;
      setItems(next);
      storeItems(next);
      if (options.cloud !== false) scheduleCloudSave();
      return next;
    },
    [scheduleCloudSave],
  );

  /* ---------- akcje na liście ---------- */

  /** Odhacza rzecz w RAMACH danej kategorii (ta sama rzecz w innej kategorii zostaje nietknięta) */
  const togglePacked = useCallback(
    (id: string, categoryId: string): PackingItem[] =>
      commit(
        itemsRef.current.map((item) => {
          if (item.id !== id) return item;
          const packedIn = item.packedIn.includes(categoryId)
            ? item.packedIn.filter((c) => c !== categoryId)
            : [...item.packedIn, categoryId];
          return { ...item, packedIn };
        }),
      ),
    [commit],
  );

  /** Ilość w RAMACH danej kategorii */
  const changeQuantity = useCallback(
    (id: string, categoryId: string, delta: number): PackingItem[] =>
      commit(
        itemsRef.current.map((item) => {
          if (item.id !== id) return item;
          const current = item.quantities[categoryId] ?? 1;
          return { ...item, quantities: { ...item.quantities, [categoryId]: clampQty(current + delta) } };
        }),
      ),
    [commit],
  );

  /** Nowa rzecz w katalogu (grafika + nazwa). Można ją od razu przypiąć do kategorii. */
  const addItem = useCallback(
    (values: ItemFormValues, initialCategoryId?: string): PackingItem[] => {
      const quantities: Record<string, number> = initialCategoryId ? { [initialCategoryId]: 1 } : {};
      const newItem: PackingItem = {
        id: Date.now().toString(),
        name: values.name,
        emoji: values.emoji,
        svgKey: values.svgKey,
        quantities,
        categoryIds: Object.keys(quantities),
        packedIn: [],
      };
      return commit([...itemsRef.current, newItem]);
    },
    [commit],
  );

  /** Edycja rzeczy = tylko nazwa i grafika (przypisania robi się z poziomu kategorii) */
  const updateItem = useCallback(
    (id: string, values: ItemFormValues): PackingItem[] =>
      commit(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, name: values.name, emoji: values.emoji, svgKey: values.svgKey } : item,
        ),
      ),
    [commit],
  );

  /** Przypina rzecz do kategorii (z ilością 1) albo odpina, gdy już jest */
  const toggleAssignment = useCallback(
    (id: string, categoryId: string): PackingItem[] =>
      commit(
        itemsRef.current.map((item) => {
          if (item.id !== id) return item;
          const quantities = { ...item.quantities };
          let packedIn = item.packedIn;
          if (categoryId in quantities) {
            delete quantities[categoryId];
            packedIn = packedIn.filter((c) => c !== categoryId);
          } else {
            quantities[categoryId] = 1;
          }
          return { ...item, quantities, categoryIds: Object.keys(quantities), packedIn };
        }),
      ),
    [commit],
  );

  /** Usuwa rzecz na zawsze, z całego katalogu */
  const deleteItem = useCallback(
    (id: string): PackingItem[] => commit(itemsRef.current.filter((item) => item.id !== id)),
    [commit],
  );

  /** Odznacza spakowanie w danej kategorii ('all' = wszędzie) */
  const resetCategory = useCallback(
    (categoryId: string): PackingItem[] =>
      commit(
        itemsRef.current.map((item) => ({
          ...item,
          packedIn: categoryId === 'all' ? [] : item.packedIn.filter((c) => c !== categoryId),
        })),
      ),
    [commit],
  );

  /** Podmienia całą listę (import z pliku, przywracanie z historii). */
  const replaceAll = useCallback(
    (next: PackingItem[], options: { cloud?: boolean } = {}): PackingItem[] => commit(next, options),
    [commit],
  );

  /* ---------- chmura ---------- */

  const pullFromCloud = useCallback(async () => {
    if (!isCloudConnected()) return;
    setSyncStatus('loading');
    try {
      const remote = await pullItemsFromCloud();
      if (remote) commit(remote, { cloud: false });
      setSyncError('');
      setSyncStatus('saved');
    } catch (e) {
      setSyncError(errorMessage(e));
      setSyncStatus('error');
    }
  }, [commit]);

  // Na starcie: jeśli chmura jest podłączona, sprawdź czy nie ma nowszej listy
  useEffect(() => {
    void pullFromCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Podłączenie chmurki: wystarczy sam token (PAT).
   * Aplikacja sama szuka istniejącej chmurki na koncie GitHub,
   * a gdy jej nie ma — tworzy nową z bieżącą listą.
   * (Opcjonalnie można podać ID chmurki ręcznie, np. z innego konta.)
   */
  const connectCloud = useCallback(
    async (token: string, joinGistId: string): Promise<ConnectResult> => {
      if (!token) return { ok: false, message: 'Najpierw wklej token GitHub 🙂' };

      const wasConnected = isCloudConnected();
      setToken(token);
      setSyncStatus('loading');

      try {
        // Skąd wziąć chmurkę: ręczne ID > zapamiętane ID > auto-wyszukiwanie na koncie
        let gistId = joinGistId || getGistId();
        let foundAutomatically = false;
        if (!gistId) {
          gistId = await findExistingGistId();
          foundAutomatically = !!gistId;
        }

        if (gistId) {
          // Mamy chmurkę — pobieramy nowszą wersję listy (albo wysyłamy naszą, jeśli nowsza)
          setGistId(gistId);
          const remote = await pullItemsFromCloud();
          if (remote) {
            commit(remote, { cloud: false });
          } else {
            await pushItemsToCloud(itemsRef.current);
          }
          setSyncError('');
          setSyncStatus('saved');
          setCloudConnected(true);
          const message = joinGistId
            ? 'Połączono z podaną chmurką! 🎉'
            : foundAutomatically
              ? 'Znaleźliśmy Waszą chmurkę i połączyliśmy! 🎉'
              : 'Połączono! 🎉';
          return { ok: true, message };
        }

        // Nie ma nigdzie chmurki — tworzymy nową z bieżącą listą
        setSyncStatus('saving');
        await pushItemsToCloud(itemsRef.current);
        setSyncError('');
        setSyncStatus('saved');
        setCloudConnected(true);
        return { ok: true, message: 'Utworzyliśmy Waszą chmurkę! 🎉 Od teraz wystarczy sam token.' };
      } catch (e) {
        // Jeśli to była pierwsza próba połączenia, nie zostawiamy złych danych
        if (!wasConnected) clearCloudCredentials();
        setCloudConnected(isCloudConnected());
        setSyncError(errorMessage(e));
        setSyncStatus('error');
        return { ok: false, message: 'Nie udało się połączyć: ' + errorMessage(e) };
      }
    },
    [commit],
  );

  const disconnectCloud = useCallback(() => {
    clearCloudCredentials();
    setCloudConnected(false);
    setSyncError('');
    setSyncStatus('local');
  }, []);

  /** Przywraca wersję z historii; przywrócenie samo też zapisuje się jako nowa wersja. */
  const restoreRevision = useCallback(
    async (versionSha: string): Promise<void> => {
      const { items: oldItems, updatedAt } = await fetchRevisionItems(versionSha);
      setLocalUpdatedAt(updatedAt);
      commit(oldItems); // cloud: true — historia zachowa też obecną wersję
    },
    [commit],
  );

  return {
    items,
    syncStatus,
    syncError,
    cloudConnected,
    togglePacked,
    changeQuantity,
    addItem,
    updateItem,
    toggleAssignment,
    deleteItem,
    resetCategory,
    replaceAll,
    pullFromCloud,
    connectCloud,
    disconnectCloud,
    restoreRevision,
  };
}
