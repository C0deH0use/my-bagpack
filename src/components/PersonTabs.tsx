import { ALL_PERSONS, FAMILY_MEMBERS, SHARED_PERSON, SHARED_PERSON_ID } from '../data/persons';

interface PersonTabsProps {
  currentPersonId: string; // 'wszyscy' | 'marek' | 'aga' | 'ania' | 'tymek' | 'none'
  includeShared: boolean;
  doneIds: ReadonlySet<string>;
  onSelectPerson: (id: string) => void;
  onToggleShared: () => void;
}

/**
 * Kontekst osoby: "kto pakuje". Każdy członek rodziny pakuje się
 * samodzielnie, a rzeczy "Wspólne" są wybierane oddzielnie i niezależnie (jako multiselect).
 */
export function PersonTabs({
  currentPersonId,
  includeShared,
  doneIds,
  onSelectPerson,
  onToggleShared,
}: PersonTabsProps) {
  const allActive = currentPersonId === ALL_PERSONS.id;
  const isSharedDone = doneIds.has(SHARED_PERSON_ID);
  const onlySharedActive = currentPersonId === 'none' && includeShared;

  return (
    <section className="mb-6 no-print">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Kto pakuje:
        </h2>
        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          💡 Rzeczy wspólne możesz łączyć z dowolną osobą (multiselect)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* "Wszyscy" — widok wszystkich osób naraz */}
        <button
          onClick={() => onSelectPerson(ALL_PERSONS.id)}
          title="Pokaż rzeczy wszystkich członków rodziny"
          className={`px-4 py-2.5 rounded-2xl border text-sm transition-all flex items-center gap-2 ${
            allActive
              ? 'bg-slate-700 text-white border-slate-700 ring-2 ring-indigo-500 scale-105 font-bold shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 font-medium'
          }`}
        >
          <span className="text-xl">{ALL_PERSONS.icon}</span>
          <span>{ALL_PERSONS.name}</span>
        </button>

        <span className="w-px self-stretch bg-slate-300 mx-1" aria-hidden="true" />

        {/* Członkowie rodziny: Marek, Aga, Ania, Tymek */}
        {FAMILY_MEMBERS.map((person) => {
          const isActive = person.id === currentPersonId;
          const isDone = doneIds.has(person.id);
          const classes = isActive
            ? `${person.color} ring-2 ring-indigo-500 scale-105 font-bold shadow-md`
            : isDone
              ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 font-medium';
          return (
            <button
              key={person.id}
              onClick={() => onSelectPerson(person.id)}
              className={`relative px-4 py-2.5 rounded-2xl border text-sm transition-all flex items-center gap-2 ${classes}`}
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

        <span className="w-px self-stretch bg-slate-300 mx-1" aria-hidden="true" />

        {/* Rzeczy wspólne — wybierane oddzielnie i niezależnie jako multi-select */}
        <button
          onClick={onToggleShared}
          title={
            includeShared
              ? 'Rzeczy wspólne są dołączone do widoku (kliknij, aby odłączyć)'
              : 'Kliknij, aby dołączyć rzeczy wspólne'
          }
          className={`relative px-4 py-2.5 rounded-2xl border text-sm transition-all flex items-center gap-2 ${
            onlySharedActive
              ? 'bg-slate-800 text-white border-slate-800 ring-2 ring-indigo-500 scale-105 font-bold shadow-md'
              : includeShared
                ? 'bg-indigo-50 text-indigo-900 border-indigo-300 ring-2 ring-indigo-400 font-bold shadow-sm'
                : 'bg-white text-slate-400 border-dashed border-slate-300 hover:border-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <span className="text-xl">{SHARED_PERSON.icon}</span>
          <span>{SHARED_PERSON.name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold transition flex items-center gap-1 ${
              onlySharedActive
                ? 'bg-indigo-500 text-white'
                : includeShared
                  ? 'bg-indigo-200 text-indigo-800'
                  : 'bg-slate-100 text-slate-400'
            }`}
          >
            {onlySharedActive ? 'Tylko wspólne' : includeShared ? '✓ dołączone' : '+ dodaj'}
          </span>
          {isSharedDone && (
            <span className="absolute -top-2 -right-1.5 w-6 h-6 bg-emerald-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md bounce-in">
              ✓
            </span>
          )}
        </button>
      </div>
    </section>
  );
}
