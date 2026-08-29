export interface PackingItem {
  id: string;
  categoryId: string;
  name: string;
  svgKey: string;
  emoji: string;
  quantity: number;
  packed: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  /** klasy Tailwinda dla aktywnej zakładki */
  color: string;
}

export type SyncStatus = 'local' | 'saving' | 'saved' | 'loading' | 'error';

/** Wynik próby połączenia z chmurą (do pokazania w ustawieniach) */
export interface ConnectResult {
  ok: boolean;
  message: string;
}
