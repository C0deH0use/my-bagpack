interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
      <div className="text-5xl mb-3">📦</div>
      <h3 className="text-lg font-bold text-slate-700">Brak rzeczy w tej kategorii</h3>
      <p className="text-sm text-slate-500 mb-4">Kliknij poniższy przycisk, aby dodać pierwszą rzecz do tej listy.</p>
      <button
        onClick={onAdd}
        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition"
      >
        + Dodaj przedmiot
      </button>
    </div>
  );
}
