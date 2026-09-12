import type { Person } from '../types';

/**
 * "Wszyscy" — to NIE jest osoba, tylko widok sumaryczny: rzeczy
 * każdej osoby naraz. Wyświetlany osobno, przed osobami.
 */
export const ALL_PERSONS_ID = 'wszyscy';

export const ALL_PERSONS: Person = {
  id: ALL_PERSONS_ID,
  name: 'Wszyscy',
  icon: '👥',
  color: 'bg-slate-700 text-white border-slate-700',
};

/**
 * Osoby pakujące się samodzielnie. "Wspólne" = rzeczy wspólne
 * całej rodziny (np. namiot, apteczka) — pakowane raz, dla wszystkich.
 *
 * Tymczasowo (do czasu obrazków AI) rysunki rzeczy danej osoby są lekko
 * zabarwione — dzięki temu np. "Skarpetki" Marka i Ani różnią się na ekranie,
 * choć korzystają z tego samego rysunku. "Wspólne" zostaje w oryginalnych
 * kolorach (brak filtra).
 */
export const PERSONS: Person[] = [
  { id: 'wspolne', name: 'Wspólne', icon: '🧳', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'marek', name: 'Marek', icon: '👨', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', svgFilter: 'hue-rotate(210deg) saturate(1.05)' },
  { id: 'aga', name: 'Aga', icon: '👩', color: 'bg-rose-100 text-rose-800 border-rose-300', svgFilter: 'hue-rotate(300deg) saturate(1.05)' },
  { id: 'ania', name: 'Ania', icon: '👧', color: 'bg-amber-100 text-amber-800 border-amber-300', svgFilter: 'hue-rotate(40deg) saturate(1.05)' },
  { id: 'tymek', name: 'Tymek', icon: '👶', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', svgFilter: 'hue-rotate(140deg) saturate(1.05)' },
];

/** Zwraca osobę po id; nieznane id → "Wspólne" (bezpieczny fallback) */
export function personById(id: string): Person {
  return PERSONS.find((p) => p.id === id) ?? PERSONS[0];
}
