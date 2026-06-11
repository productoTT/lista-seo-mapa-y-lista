import { X } from 'lucide-react';
import type { Filters, PropertyType } from '../../types/property';

interface MoreFiltersPanelProps {
  open: boolean;
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  onClose: () => void;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'oficina', label: 'Oficina' },
];

export function MoreFiltersPanel({ open, filters, onChange, onClose }: MoreFiltersPanelProps) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-[1100]" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white z-[1200] shadow-2xl transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Más filtros</h2>
          <button onClick={onClose}><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Precio máximo (UF)</label>
            <input
              type="number"
              value={filters.priceMaxUF < 25000 ? filters.priceMaxUF : ''}
              onChange={e => onChange({ priceMaxUF: Number(e.target.value) || 25000 })}
              placeholder="Sin límite"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de propiedad</label>
            <div className="space-y-2">
              <button onClick={() => onChange({ propertyType: null })} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${!filters.propertyType ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                Todos los tipos
              </button>
              {propertyTypes.map(t => (
                <button key={t.value} onClick={() => onChange({ propertyType: t.value })} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${filters.propertyType === t.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Dormitorios</label>
            <div className="flex gap-2">
              {[null, 1, 2, 3, 4].map(n => (
                <button key={String(n)} onClick={() => onChange({ bedrooms: n })} className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${filters.bedrooms === n ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                  {n === null ? 'Todos' : n === 4 ? '4+' : n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100">
          <button onClick={() => { onChange({ priceMinUF: 0, priceMaxUF: 25000, propertyType: null, bedrooms: null }); onClose(); }} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">
            Limpiar filtros
          </button>
        </div>
      </div>
    </>
  );
}
