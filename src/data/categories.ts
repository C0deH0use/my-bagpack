import type { Category } from '../types';

/**
 * Kategorie = rodzaje wyjazdów/wydarzeń, na które pakujemy.
 * Pierwsza grupa to typy z rodzinnego spisu w Notion,
 * druga — "plecaczkowe" wyjścia na co dzień.
 */
export const CATEGORIES: Category[] = [
  // Wyjazdy z noclegiem (duży bagaż)
  { id: 'wyjazd', name: 'Wyjazd', icon: '🧳', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'lato', name: 'Lato', icon: '☀️', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'zima', name: 'Zima', icon: '❄️', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'narty', name: 'Narty', icon: '⛷️', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  // Wyjścia i aktywności (plecak / podręczne)
  { id: 'rower', name: 'Rower', icon: '🚲', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { id: 'basen', name: 'Basen', icon: '🏊‍♀️', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'wycieczka_szkolna', name: 'Wycieczka szkolna', icon: '🎒', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'spacer', name: 'Spacer', icon: '🌳', color: 'bg-lime-100 text-lime-800 border-lime-300' },
];

/**
 * "Wszystkie przedmioty" — to NIE jest kategoria, tylko baza/przestrzeń
 * ze wszystkimi stworzonymi rzeczami. Wyświetlana osobno, obok kategorii.
 */
export const ALL_CATEGORY_ID = 'all';

export const ALL_CATEGORY: Category = {
  id: ALL_CATEGORY_ID,
  name: 'Wszystkie przedmioty',
  icon: '🗄️',
  color: 'bg-slate-700 text-white border-slate-700',
};
