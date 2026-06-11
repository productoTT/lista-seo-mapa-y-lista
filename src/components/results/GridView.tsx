import { Bed, Bath, Maximize2, Map } from 'lucide-react';
import type { Property, SortOption } from '../../types/property';
import { CommercialBadge } from '../ui/CommercialBadge';
import { formatPriceUF, formatRent } from '../../data/mockProperties';

interface GridViewProps {
  properties: Property[];
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  savedProperties: Set<string>;
  onSelect: (id: string) => void;
  onSave: (id: string) => void;
  onViewMap: () => void;
}

export function GridView({ properties, onSelect, onViewMap }: GridViewProps) {
  return (
    <div className="h-full overflow-y-auto" style={{ background: '#F9F9F9' }}>
      <div className="sticky top-0 flex items-center justify-between px-4 py-2.5 border-b bg-white z-10" style={{ borderColor: '#E5E5E5' }}>
        <p className="text-sm font-semibold" style={{ color: '#343A40' }}>
          {properties.length} propiedades en cuadrícula
        </p>
        <button
          onClick={onViewMap}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: '#EAF2FC', color: '#3200C1' }}
        >
          <Map size={13} />
          Ver en mapa
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {properties.map(p => {
          const priceDisplay = p.operation === 'arriendo' ? formatRent(p.price) : formatPriceUF(p.priceUF);
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="rounded-xl overflow-hidden border text-left transition-all hover:shadow-md group"
              style={{ background: '#FAFAFA', borderColor: '#E5E5E5' }}
            >
              <div className="relative" style={{ height: 140 }}>
                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div className="absolute top-2 left-2">
                  <CommercialBadge status={p.commercialStatus} compact />
                </div>
                {p.isNewProject && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#3200C1', color: '#37FFDB', fontSize: 10 }}>
                      NUEVO
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-base font-extrabold" style={{ color: '#3200C1' }}>{priceDisplay}</p>
                <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: '#343A40' }}>{p.zone}</p>
                <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#666' }}>
                  {p.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed size={11} /> {p.bedrooms}</span>}
                  <span className="flex items-center gap-0.5"><Bath size={11} /> {p.bathrooms}</span>
                  <span className="flex items-center gap-0.5"><Maximize2 size={11} /> {p.sqm}m²</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-bold" style={{ color: '#343A40' }}>Sin resultados</p>
          <p className="text-sm mt-2" style={{ color: '#666' }}>Ajusta los filtros para ver más propiedades.</p>
        </div>
      )}
    </div>
  );
}
