import { useState, useEffect } from 'react';
import type { Filters, AdvancedFilters, Property, SortOption } from '../../types/property';
import { DEFAULT_FILTERS, DEFAULT_ADVANCED_FILTERS } from '../../types/property';
import { MapView } from '../MapView/MapView';
import { MobileHeader, MOBILE_HEADER_HEIGHT } from './MobileHeader';
import { MobileMapCard } from './MobileMapCard';
import type { SheetState } from './MobileBottomSheet';
import { MobileBottomSheet, SHEET_PEEK_HEIGHT } from './MobileBottomSheet';
import { FiltersDrawer } from '../modals/FiltersDrawer';

// Group threshold: ~200m radius
const LOCATION_THRESHOLD = 0.002;

function getPropertiesAtLocation(all: Property[], lat: number, lng: number): Property[] {
  const nearby = all.filter(p =>
    Math.abs(p.lat - lat) < LOCATION_THRESHOLD &&
    Math.abs(p.lng - lng) < LOCATION_THRESHOLD
  );
  return nearby.length > 0 ? nearby : [];
}

interface MobileResultsViewProps {
  properties: Property[];
  filters: Filters;
  onFiltersChange: (f: Partial<Filters>) => void;
  query: string;
  savedProperties: Set<string>;
  onSaveProperty: (id: string) => void;
  onGoHome: () => void;
  onViewFullProperty: (id: string) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  advancedFilters: AdvancedFilters;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
}

export function MobileResultsView({
  properties, filters, onFiltersChange, query,
  savedProperties, onSaveProperty, onGoHome, onViewFullProperty,
  sort, onSortChange, advancedFilters, onAdvancedFiltersChange,
}: MobileResultsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [showFilters, setShowFilters] = useState(false);
  const [cardProperties, setCardProperties] = useState<Property[]>([]);

  // Intercept back button
  useEffect(() => {
    window.history.pushState({ mobile: true }, '');
    const handler = () => {
      if (selectedId) {
        setSelectedId(null);
        setCardProperties([]);
        window.history.pushState({ mobile: true }, '');
      } else if (sheetState === 'expanded') {
        setSheetState('collapsed');
        window.history.pushState({ mobile: true }, '');
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [selectedId, sheetState]);

  const closeCard = () => {
    setSelectedId(null);
    setCardProperties([]);
  };

  const handleMarkerClick = (id: string) => {
    if (selectedId === id) {
      closeCard();
      return;
    }
    const prop = properties.find(p => p.id === id);
    if (!prop) return;
    const nearby = getPropertiesAtLocation(properties, prop.lat, prop.lng);
    setSelectedId(id);
    setCardProperties(nearby.length > 0 ? nearby : [prop]);
    // Bring map into view when selecting a pin
    if (sheetState === 'expanded') setSheetState('half');
  };

  // Tapping the map background closes the card
  const handleMapAreaClick = () => {
    if (selectedId) closeCard();
  };

  // Card is positioned above the collapsed peek
  const cardBottom = SHEET_PEEK_HEIGHT + 12;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#1a1a2e',
        // Ensure iOS safe area is respected
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ── Header ────────────────────────────────────── */}
      <MobileHeader
        filters={filters}
        query={query}
        resultCount={properties.length}
        onGoBack={onGoHome}
        onOpenFilters={() => setShowFilters(true)}
      />

      {/* ── Map — fills viewport below header ─────────── */}
      <div
        style={{
          position: 'fixed',
          top: MOBILE_HEADER_HEIGHT,
          left: 0, right: 0, bottom: 0,
          zIndex: 1,
        }}
        onClick={handleMapAreaClick}
      >
        <MapView
          properties={properties}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onMarkerClick={handleMarkerClick}
          onHoverMarker={setHoveredId}
        />
      </div>

      {/* ── Contextual card (pin selected) ────────────── */}
      {selectedId && cardProperties.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: 0, right: 0,
            bottom: cardBottom,
            zIndex: 120,
            animation: 'slideUp 0.22s ease',
          }}
          onClick={e => e.stopPropagation()}
        >
          <MobileMapCard
            properties={cardProperties}
            savedProperties={savedProperties}
            onClose={closeCard}
            onSave={onSaveProperty}
            onViewFull={onViewFullProperty}
          />
        </div>
      )}

      {/* ── Bottom sheet ──────────────────────────────── */}
      <MobileBottomSheet
        properties={properties}
        savedProperties={savedProperties}
        sort={sort}
        onSortChange={onSortChange}
        onSelect={onViewFullProperty}
        onSave={onSaveProperty}
        sheetState={sheetState}
        onSheetStateChange={setSheetState}
      />

      {/* ── Filters drawer ────────────────────────────── */}
      <FiltersDrawer
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={onAdvancedFiltersChange}
        onClear={() => {
          onFiltersChange({ ...DEFAULT_FILTERS });
          onAdvancedFiltersChange({ ...DEFAULT_ADVANCED_FILTERS });
        }}
        onApply={() => setShowFilters(false)}
      />
    </div>
  );
}
