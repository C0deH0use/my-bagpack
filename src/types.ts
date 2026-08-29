export interface PackingItem {
  id: string;
  /** kategorie, do których rzecz jest przypisana (≥1) */
  categoryIds: string[];
  /** ilość wybierana OSOBNO dla każdej kategorii (klucz = id kategorii) */
  quantities: Record<string, number>;
  /** kategorie, w których rzecz jest już spakowana */
  packedIn: string[];
  name: string;
  svgKey: string;
  emoji: string;
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
