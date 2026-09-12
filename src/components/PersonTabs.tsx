import type { Person } from '../types';
import { ALL_PERSONS } from '../data/persons';

interface PersonTabsProps {
  persons: Person[];
  currentId: string;
  /** osoby, których rzeczy w BIEŻĄCEJ kategorii są już spakowane — zielona odznaka ✓ */
  doneIds: ReadonlySet<string>;
  onSwitch: (id: string) => void;
}

/**
 * Kontekst osoby: "kto pakuje". Każdy członek rodziny pakuje się
 * samodzielnie — wybór osoby filtruje rzeczy w kategorii i katalogu.
 */
export function PersonTabs({ persons, currentId, doneIds, onSwitch }: PersonTabsProps) {
  const allActive = currentId === ALL_PERSONS.id;

  return (
    <section className="mb-6 no-print">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
        Kto pakuje:
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {/* "Wszyscy" — widok sumaryczny, nie osoba */}
        <button
          onClick={() => onSwitch(ALL_PERSONS.id)}
          title="Rzeczy wszystkich naraz"
          className={`px-4 py-2 rounded-2xl border text-sm transition-all flex items-center gap-2 ${
            allActive
              ? 'bg-slate-700 text-white border-slate-700 ring-2 ring-indigo-500 scale-105 font-bold shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 font-medium'
          }`}
        >
          <span className="text-xl">{ALL_PERSONS.icon}</span>
          <span>{ALL_PERSONS.name}</span>
        </button>

        <span className="w-px self-stretch bg-slate-300 mx-1" aria-hidden="true" />

        {persons.map((person) => {
          const isActive = person.id === currentId;
          const isDone = doneIds.has(person.id);
          const classes = isActive
            ? `${person.color} ring-2 ring-indigo-500 scale-105 font-bold shadow-md`
            : isDone
              ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 font-medium';
          return (
            <button
              key={person.id}
              onClick={() => onSwitch(person.id)}
              className={`relative px-4 py-2 rounded-2xl border text-sm transition-all flex items-center gap-2 ${classes}`}
            >
              <span className="text-xl">{person.icon}</span>
              <span>{person.name}</span>
              {isDone && (
                <span className="absolute -top-2 -right-1.5 w-6 h-6 bg-emerald-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md bounce-in">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
