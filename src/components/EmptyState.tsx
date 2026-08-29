interface EmptyStateProps {
  /** pusta kategoria: komponujemy ją z katalogu */
  onPickFromCatalog?: () => void;
  /** stworzenie zupełnie nowej rzeczy */
  onAdd: () => void;
}

export function EmptyState({ onPickFromCatalog, onAdd }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
      <div className="text-5xl mb-3">📦</div>
      <h3 className="text-lg font-bold text-slate-700">Tu jeszcze nic nie ma</h3>
      <p className="text-sm text-slate-500 mb-4">Wybierz rzeczy z katalogu albo stwórz zupełnie nową.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {onPickFromCatalog && (
          <button
            onClick={onPickFromCatalog}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition"
          >
            📦 Dodaj z katalogu
          </button>
        )}
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-200 transition"
        >
          + Stwórz nową rzecz
        </button>
      </div>
    </div>
  );
}
