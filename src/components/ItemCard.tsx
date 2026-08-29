import type { PackingItem } from '../types';
import { SVG_DRAWINGS } from '../data/svgDrawings';
import { IconCheck, IconEdit, IconTrash } from './icons';

interface ItemCardProps {
  item: PackingItem;
  onToggle: (id: string) => void;
  onChangeQuantity: (id: string, delta: number) => void;
  onEdit: (item: PackingItem) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, onToggle, onChangeQuantity, onEdit, onDelete }: ItemCardProps) {
  const isPacked = item.packed;
  const svg = item.svgKey ? SVG_DRAWINGS[item.svgKey] : undefined;

  return (
    <div
      className={`item-card bg-white rounded-3xl p-4 border-2 transition-all duration-300 relative flex flex-col justify-between ${
        isPacked ? 'card-packed border-emerald-400 shadow-sm' : 'border-slate-200/90 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-2 no-print">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
          Do zabrania
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(item)}
            title="Edytuj"
            className="w-7 h-7 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg flex items-center justify-center"
          >
            <IconEdit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            title="Usuń"
            className="w-7 h-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 my-2">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 flex items-center justify-center shrink-0 shadow-inner">
          {svg ? (
            <div
              className="w-20 h-20 flex items-center justify-center p-1"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="text-5xl select-none flex items-center justify-center w-20 h-20">
              {item.emoji || '📦'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3
            className={`text-lg font-bold leading-snug ${
              isPacked ? 'line-through text-slate-500' : 'text-slate-800'
            }`}
          >
            {item.name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Ilość:</span>
            <div className="inline-flex items-center bg-slate-100 rounded-lg border border-slate-200 no-print">
              <button
                onClick={() => onChangeQuantity(item.id, -1)}
                className="w-6 h-6 text-slate-600 font-bold hover:bg-slate-200 rounded-l-lg flex items-center justify-center text-xs"
              >
                -
              </button>
              <span className="px-2 text-xs font-black text-indigo-700">{item.quantity}</span>
              <button
                onClick={() => onChangeQuantity(item.id, 1)}
                className="w-6 h-6 text-slate-600 font-bold hover:bg-slate-200 rounded-r-lg flex items-center justify-center text-xs"
              >
                +
              </button>
            </div>
            <span className="hidden print:inline-block font-bold text-slate-700 text-sm">x{item.quantity}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={() => onToggle(item.id)}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 no-print ${
            isPacked ? 'custom-checkbox-active' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
              isPacked ? 'border-white bg-emerald-600' : 'border-slate-400 bg-white'
            }`}
          >
            {isPacked && <IconCheck className="w-3 h-3 text-white" />}
          </div>
          <span>{isPacked ? 'SPAKOWANE! 🎉' : 'Czy spakowane?'}</span>
        </button>

        <div className="hidden print:flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <div className="w-6 h-6 border-2 border-slate-400 rounded-md" />
        </div>
      </div>
    </div>
  );
}
