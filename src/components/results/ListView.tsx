import type { Property, SortOption } from '../../types/property';
import { PropertyResultCard } from './PropertyResultCard';
import { Paginator } from '../seo/Paginator';
import { ContextualBanner, insertBanners } from './ContextualBanner';

interface ListViewProps {
  properties: Property[];
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  hoveredId: string | null;
  savedProperties: Set<string>;
  onSelect: (id: string) => void;
  onSave: (id: string) => void;
  onHoverCard: (id: string | null) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Más relevantes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'sqm_desc', label: 'Mayor m²' },
];

export function ListView({
  properties, sort, onSortChange, hoveredId, savedProperties, onSelect, onSave, onHoverCard,
}: ListViewProps) {
  const items = insertBanners(properties);

  return (
    <div style={{ background: '#F5F5F5' }}>
      {/* Sort bar */}
      <div className="seo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 0 }}>
        <p className="text-sm font-semibold" style={{ color: '#343A40' }}>
          {properties.length} propiedades encontradas
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs hidden sm:inline" style={{ color: '#666' }}>Ordenar por:</span>
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value as SortOption)}
            className="text-xs font-bold border rounded-lg px-2 py-1.5 outline-none cursor-pointer"
            style={{ borderColor: '#E5E5E5', color: '#343A40', background: '#fff' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="seo-container" style={{ paddingTop: 16, paddingBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 305px))', gap: 16, alignItems: 'start' }}>
          {items.map((item, i) => {
            if ('__banner' in item) {
              return <ContextualBanner key={`banner-${i}`} variant={item.variant} />;
            }
            const p = item as Property;
            return (
              <PropertyResultCard
                key={p.id}
                property={p}
                layout="vertical"
                isHighlighted={hoveredId === p.id}
                isSaved={savedProperties.has(p.id)}
                onSelect={onSelect}
                onSave={onSave}
                onHoverEnter={id => onHoverCard(id)}
                onHoverLeave={() => onHoverCard(null)}
              />
            );
          })}

          {properties.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-lg font-bold" style={{ color: '#343A40' }}>Sin resultados</p>
              <p className="text-sm mt-2" style={{ color: '#666' }}>
                Intenta ajustar los filtros para ver más propiedades.
              </p>
            </div>
          )}
        </div>
        <Paginator />
      </div>
    </div>
  );
}
