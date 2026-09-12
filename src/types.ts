export interface PackingItem {
  id: string;
  /** właściciel rzeczy (id osoby z PERSONS) — w czyim kontekście ją pakujemy */
  personId: string;
  /** kategorie, do których rzecz jest przypisana (≥1) */
  categoryIds: string[];
  /** ilość wybierana OSOBNO dla każdej kategorii (klucz = id kategorii) */
  quantities: Record<string, number>;
  /** kategorie, w których rzecz jest już spakowana */
  packedIn: string[];
  name: string;
  svgKey: string;
  emoji: string;
  /** obrazek AI (data URL) wygenerowany przez Gemini — pokazywany zamiast SVG/emoji */
  aiImage?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  /** klasy Tailwinda dla aktywnej zakładki */
  color: string;
}

/**
 * Osoba = kontekst pakowania ("kto pakuje"). Każdy członek rodziny
 * pakuje się samodzielnie; "Wspólne" trzyma rzeczy wspólne dla wszystkich.
 */
export interface Person {
  id: string;
  name: string;
  icon: string;
  /** klasy Tailwinda dla aktywnego chipa */
  color: string;
  /** filtr CSS przesuwający kolory rysunku rzeczy tej osoby — tymczasowo, do czasu obrazków AI */
  svgFilter?: string;
}

export type SyncStatus = 'local' | 'saving' | 'saved' | 'loading' | 'error';

/** Wynik próby połączenia z chmurą (do pokazania w ustawieniach) */
export interface ConnectResult {
  ok: boolean;
  message: string;
}
