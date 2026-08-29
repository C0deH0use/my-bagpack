import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'lato', name: 'Wyjazd Lato', icon: '☀️', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'zima', name: 'Wyjazd Zima', icon: '❄️', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { id: 'higiena', name: 'Kosmetyczka i Zdrowie', icon: '🪥', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'zabawa', name: 'Zabawa i Rysowanie', icon: '🎨', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'basen', name: 'Basen / Woda', icon: '🏊‍♀️', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { id: 'spacer', name: 'Wyjście na Spacer', icon: '🌲', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
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
