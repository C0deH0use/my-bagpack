import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConnectResult, PackingItem, SyncStatus } from '../types';
import { DEFAULT_ITEMS } from '../data/defaultItems';
import { loadStoredItems, storeItems } from '../lib/storage';
import {
  clearCloudCredentials,
  fetchRevisionItems,
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
  quantity: number;
  categoryId: string;
}

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

  const togglePacked = useCallback(
    (id: string): PackingItem[] =>
      commit(itemsRef.current.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item))),
    [commit],
  );

  const changeQuantity = useCallback(
    (id: string, delta: number): PackingItem[] =>
      commit(
        itemsRef.current.map((item) => {
          if (item.id !== id) return item;
          const quantity = Math.min(99, Math.max(1, item.quantity + delta));
          return { ...item, quantity };
        }),
      ),
    [commit],
  );

  const addItem = useCallback(
    (values: ItemFormValues): PackingItem[] => {
      const newItem: PackingItem = {
        id: Date.now().toString(),
        svgKey: '',
        packed: false,
        ...values,
      };
      return commit([...itemsRef.current, newItem]);
    },
    [commit],
  );

  const updateItem = useCallback(
    (id: string, values: ItemFormValues): PackingItem[] =>
      commit(itemsRef.current.map((item) => (item.id === id ? { ...item, ...values } : item))),
    [commit],
  );

  const deleteItem = useCallback(
    (id: string): PackingItem[] => commit(itemsRef.current.filter((item) => item.id !== id)),
    [commit],
  );

  const resetCategory = useCallback(
    (categoryId: string): PackingItem[] =>
      commit(itemsRef.current.map((item) => (item.categoryId === categoryId ? { ...item, packed: false } : item))),
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

  /** Podłączenie chmurki z poziomu ustawień. Zwraca wynik do pokazania użytkownikowi. */
  const connectCloud = useCallback(
    async (token: string, joinGistId: string): Promise<ConnectResult> => {
      if (!token) return { ok: false, message: 'Najpierw wklej token GitHub 🙂' };

      setToken(token);

      if (joinGistId) {
        // Podłączamy to urządzenie do chmurki z innego urządzenia
        setGistId(joinGistId);
        setSyncStatus('loading');
        try {
          const remote = await pullItemsFromCloud();
          if (remote) commit(remote, { cloud: false });
          setSyncError('');
          setSyncStatus('saved');
          setCloudConnected(true);
          return { ok: true, message: 'Połączono z istniejącą chmurką! 🎉' };
        } catch (e) {
          clearCloudCredentials();
          setCloudConnected(false);
          setSyncError(errorMessage(e));
          setSyncStatus('error');
          return { ok: false, message: 'Nie udało się połączyć: ' + errorMessage(e) };
        }
      }

      // Brak ID: tworzymy nową chmurkę z bieżącą listą (albo zapisujemy do istniejącej)
      setSyncStatus('saving');
      try {
        await pushItemsToCloud(itemsRef.current);
        setSyncError('');
        setSyncStatus('saved');
        setCloudConnected(true);
        return {
          ok: true,
          message: joinGistId
            ? 'Połączono! 🎉'
            : 'Utworzyliśmy Waszą chmurkę! 🎉 Skopiuj jej ID na drugie urządzenie.',
        };
      } catch (e) {
        setSyncError(errorMessage(e));
        setSyncStatus('error');
        return { ok: false, message: 'Nie udało się zapisać: ' + errorMessage(e) };
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
    deleteItem,
    resetCategory,
    replaceAll,
    pullFromCloud,
    connectCloud,
    disconnectCloud,
    restoreRevision,
  };
}
