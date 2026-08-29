import { useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { IconCheck } from './icons';

interface CategoryMultiSelectProps {
  selectedIds: string[];
  onToggle: (categoryId: string) => void;
}

/**
 * Dropdown z multi-selectem: klik rozwija listę kategorii,
 * każda pozycja to checkbox. Zero zaznaczeń = rzecz zostaje tylko w katalogu.
 */
export function CategoryMultiSelect({ selectedIds, onToggle }: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = CATEGORIES.filter((c) => selectedIds.includes(c.id));

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-left"
      >
        <span className="flex flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-sm text-slate-400 font-medium">Tylko w katalogu (bez kategorii)</span>
          ) : (
            selected.map((c) => (
              <span
                key={c.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-bold ${c.color}`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </span>
            ))
          )}
        </span>
        <span className={`text-slate-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="mt-1.5 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
          {CATEGORIES.map((c) => {
            const checked = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onToggle(c.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition ${
                  checked ? 'bg-indigo-50/60 font-bold text-slate-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                    checked ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {checked && <IconCheck className="w-3 h-3" />}
                </span>
                <span className="text-lg">{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
