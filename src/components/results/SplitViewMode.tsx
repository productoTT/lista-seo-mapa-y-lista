import { useRef } from 'react';
import type { Property, SortOption } from '../../types/property';
import type { SplitLayout } from '../ui/TweaksPanel';
import { MapView } from '../MapView/MapView';
import { PropertyResultCard } from './PropertyResultCard';
import { Paginator } from '../seo/Paginator';
import { MapPinCard } from '../seo/MapPinCard';
import { MapPreviewOverlay } from '../preview/MapPreviewOverlay';
import type { PropertyPreviewController } from '../preview/usePropertyPreview';
import { ContextualBanner, insertBanners } from './ContextualBanner';

interface DividedViewProps {
  properties: Property[];
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  hoveredId: string | null;
  savedProperties: Set<string>;
  onSelect: (id: string) => void;
  onQuote?: (id: string) => void;
  onViewMore?: (id: string) => void;
  onSave: (id: string) => void;
  onHover: (id: string | null) => void;
  onMarkerClick: (id: string) => void;
  onViewFull: (id: string) => void;
  onSelectSimilar: (id: string) => void;
  splitLayout: SplitLayout;
  preview: PropertyPreviewController;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Más relevantes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'sqm_desc', label: 'Mayor m²' },
];

export function DividedView({
  properties, sort, onSortChange, hoveredId, savedProperties,
  onSelect, onQuote, onViewMore, onSave, onHover, onMarkerClick, onViewFull, onSelectSimilar, splitLayout, preview,
}: DividedViewProps) {
  const selectedId = preview.propertyId;
  const selectedProperty = selectedId ? properties.find(p => p.id === selectedId) ?? null : null;

  // Hover-intent: mantiene la mini-card visible al pasar el mouse del pin a la card (delay antes de ocultar)
  const hideTimer = useRef<number | null>(null);
  const handleMarkerHover = (id: string | null) => {
    if (hideTimer.current !== null) { window.clearTimeout(hideTimer.current); hideTimer.current = null; }
    if (id) onHover(id);
    else hideTimer.current = window.setTimeout(() => onHover(null), 180);
  };
  const hoverCardProperty = hoveredId && hoveredId !== selectedId ? properties.find(p => p.id === hoveredId) ?? null : null;

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
                onSelect={onSelect}
                onQuote={onQuote}
                onViewMore={onViewMore}
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
          onMarkerClick={onMarkerClick}
          onHoverMarker={handleMarkerHover}
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

        {/* Mini-card al pasar el mouse sobre un pin — clic en ella (o en el pin) abre la ficha resumida */}
        {hoverCardProperty && (
          <div onMouseEnter={() => handleMarkerHover(hoverCardProperty.id)} onMouseLeave={() => handleMarkerHover(null)}>
            <MapPinCard
              property={hoverCardProperty}
              onClose={() => onHover(null)}
              onViewFull={onMarkerClick}
            />
          </div>
        )}

        <MapPreviewOverlay
          property={selectedProperty}
          controller={preview}
          isSaved={selectedProperty ? savedProperties.has(selectedProperty.id) : false}
          onSave={onSave}
          onViewFull={onViewFull}
          allProperties={properties}
          onSelectSimilar={onSelectSimilar}
        />
      </div>
    </div>
  );
}
