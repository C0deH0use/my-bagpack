import type { Category } from '../types';

/**
 * Kategorie = rodzaje wyjazdów/wydarzeń, na które pakujemy.
 * Pierwsza grupa to typy z rodzinnego spisu w Notion,
 * druga — "plecaczkowe" wyjścia na co dzień.
 */
export const CATEGORIES: Category[] = [
  // typy wyjazdów z listy w Notion
  { id: 'ogolne', name: 'Ogólne', icon: '🧭', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'turystyczne', name: 'Wyjazdy turystyczne', icon: '🏞️', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'zagranica', name: 'Wyjazdy za granicę', icon: '🌍', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'samolot', name: 'Samolot', icon: '✈️', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { id: 'rowery', name: 'Rowery', icon: '🚲', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { id: 'zima', name: 'Zima', icon: '❄️', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'leki', name: 'Leki', icon: '💊', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'gospodarcze', name: 'Gospodarcze', icon: '🧺', color: 'bg-lime-100 text-lime-800 border-lime-300' },
  // wyjścia na co dzień — z pierwotnego plecaczka
  { id: 'lato', name: 'Wyjazd Lato', icon: '☀️', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'higiena', name: 'Kosmetyczka i Zdrowie', icon: '🪥', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { id: 'basen', name: 'Basen / Woda', icon: '🏊‍♀️', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'zabawa', name: 'Zabawa i Rysowanie', icon: '🎨', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300' },
  { id: 'spacer', name: 'Wyjście na Spacer', icon: '🌲', color: 'bg-green-100 text-green-800 border-green-300' },
  { id: 'wycieczka', name: 'Szkoła / Wycieczka', icon: '🎒', color: 'bg-purple-100 text-purple-800 border-purple-300' },
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
