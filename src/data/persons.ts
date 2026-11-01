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

export const SHARED_PERSON_ID = 'wspolne';

export const SHARED_PERSON: Person = {
  id: SHARED_PERSON_ID,
  name: 'Wspólne',
  icon: '🧳',
  color: 'bg-slate-100 text-slate-700 border-slate-300',
};

/**
 * Członkowie rodziny pakujący się samodzielnie.
 */
export const FAMILY_MEMBERS: Person[] = [
  { id: 'marek', name: 'Marek', icon: '👨', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', svgFilter: 'hue-rotate(210deg) saturate(1.05)' },
  { id: 'aga', name: 'Aga', icon: '👩', color: 'bg-rose-100 text-rose-800 border-rose-300', svgFilter: 'hue-rotate(300deg) saturate(1.05)' },
  { id: 'ania', name: 'Ania', icon: '👧', color: 'bg-amber-100 text-amber-800 border-amber-300', svgFilter: 'hue-rotate(40deg) saturate(1.05)' },
  { id: 'tymek', name: 'Tymek', icon: '👶', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', svgFilter: 'hue-rotate(140deg) saturate(1.05)' },
];

/**
 * Pełna lista osób (z "Wspólne" na początku dla kompatybilności wstecznej).
 */
export const PERSONS: Person[] = [SHARED_PERSON, ...FAMILY_MEMBERS];

/** Zwraca osobę po id; nieznane id → "Wspólne" (bezpieczny fallback) */
export function personById(id: string): Person {
  return PERSONS.find((p) => p.id === id) ?? PERSONS[0];
}
