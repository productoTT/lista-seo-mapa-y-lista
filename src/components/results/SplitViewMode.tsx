import type { Property, SortOption } from '../../types/property';
import type { SplitLayout } from '../ui/TweaksPanel';
import { MapView } from '../MapView/MapView';
import { PropertyResultCard } from './PropertyResultCard';
import { Paginator } from '../seo/Paginator';
import { MapPinCard } from '../seo/MapPinCard';
import { ContextualBanner, insertBanners } from './ContextualBanner';

interface DividedViewProps {
  properties: Property[];
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  hoveredId: string | null;
  selectedId: string | null;
  savedProperties: Set<string>;
  onSelect: (id: string) => void;
  onSave: (id: string) => void;
  onHover: (id: string | null) => void;
  onPinSelect: (id: string | null) => void;
  onViewFull: (id: string) => void;
  splitLayout: SplitLayout;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Más relevantes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'sqm_desc', label: 'Mayor m²' },
];

export function DividedView({
  properties, sort, onSortChange, hoveredId, selectedId, savedProperties,
  onSelect, onSave, onHover, onPinSelect, onViewFull, splitLayout,
}: DividedViewProps) {
  const selectedProperty = selectedId ? properties.find(p => p.id === selectedId) ?? null : null;

  const is3col = splitLayout === '3col';
  const leftColStyle = is3col
    ? { width: '66%', flexShrink: 0 as const, borderRight: '1px solid #E5E5E5' }
    : { width: 'fit-content', flexShrink: 0 as const, borderRight: '1px solid #E5E5E5', maxWidth: 'calc(305px * 2 + 24px + 24px)' };
  const gridCols = is3col ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 305px))';

  const items = insertBanners(properties);

  return (
    // align-items: flex-start es imprescindible para que position:sticky funcione en la columna derecha
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>

      {/* ── Left: list — scroll natural del documento ── */}
      <div style={leftColStyle}>

        {/* Sort bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 0px 0px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#343A40', margin: 0 }}>
            {properties.length} propiedades
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>Ordenar:</span>
            <select
              value={sort}
              onChange={e => onSortChange(e.target.value as SortOption)}
              style={{
                fontSize: 12, fontWeight: 700,
                border: '1px solid #E5E5E5', borderRadius: 6,
                padding: '4px 8px', outline: 'none', cursor: 'pointer',
                color: '#343A40', background: '#fff', fontFamily: 'inherit',
              }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{
          paddingLeft: 0, paddingRight: 24, paddingTop: 12, paddingBottom: 12,
          display: 'grid', gridTemplateColumns: gridCols, gap: 20,
          background: '#F5F5F5', alignItems: 'start',
        }}>
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
                isHighlighted={hoveredId === p.id || selectedId === p.id}
                isSaved={savedProperties.has(p.id)}
                onSelect={id => { onSelect(id); onPinSelect(id); }}
                onSave={onSave}
                onHoverEnter={onHover}
                onHoverLeave={() => onHover(null)}
              />
            );
          })}

          {properties.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', gridColumn: 'span 2' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#343A40' }}>Sin resultados</p>
              <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Ajusta los filtros para ver más propiedades.</p>
            </div>
          )}
        </div>

        <Paginator />
      </div>

      {/* ── Right: map sticky — acompaña el scroll del documento ── */}
      <div style={{ flex: 1, position: 'sticky', top: 16, height: 'calc(100vh - 32px)' }}>
        <MapView
          properties={properties}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onMarkerClick={id => onPinSelect(selectedId === id ? null : id)}
          onHoverMarker={onHover}
        />

        {/* Count badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: 'rgba(34,17,96,0.85)', color: '#fff',
          pointerEvents: 'none', zIndex: 800,
        }}>
          {properties.length} en área
        </div>

        {selectedProperty && (
          <MapPinCard
            property={selectedProperty}
            onClose={() => onPinSelect(null)}
            onViewFull={onViewFull}
          />
        )}
      </div>
    </div>
  );
}
