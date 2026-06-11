import { useState, useEffect } from 'react';
import type { Filters, AdvancedFilters, ViewMode, SearchInterpretation, SortOption } from '../../types/property';
import type { Property } from '../../types/property';
import { DEFAULT_FILTERS, DEFAULT_ADVANCED_FILTERS } from '../../types/property';
import { ToctocFullHeader } from '../seo/ToctocFullHeader';
import { SeoLinksBlock } from '../seo/SeoLinksBlock';
import { ToctocFooter } from '../seo/ToctocFooter';
import { SeoPageInfo } from '../seo/SeoPageInfo';
import { ResultsHeader } from './ResultsHeader';
import { ListView } from './ListView';
import { MapViewMode } from './MapViewMode';
import { DividedView } from './SplitViewMode';
import { PropertyBottomSheet } from '../property/PropertyBottomSheet';
import { SemanticSearchModal } from '../modals/SemanticSearchModal';
import { FiltersModal } from '../modals/FiltersModal';
import { FiltersDrawer } from '../modals/FiltersDrawer';
import { TweaksPanel } from '../ui/TweaksPanel';
import type { FilterPresentation, SplitLayout } from '../ui/TweaksPanel';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

interface ResultsScreenProps {
  properties: Property[];
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
  filters: Filters;
  onFiltersChange: (f: Partial<Filters>) => void;
  interpretation: SearchInterpretation | null;
  query: string;
  savedSearch: boolean;
  onSaveSearch: () => void;
  savedProperties: Set<string>;
  onSaveProperty: (id: string) => void;
  onGoHome: () => void;
  onSearch: (q: string) => void;
  onViewFullProperty: (id: string) => void;
  onContact: () => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  advancedFilters: AdvancedFilters;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
}

export function ResultsScreen({
  properties, viewMode, onViewChange, filters, onFiltersChange,
  interpretation, query, savedSearch, onSaveSearch,
  savedProperties, onSaveProperty, onGoHome, onSearch,
  onViewFullProperty, onContact, sort, onSortChange,
  advancedFilters, onAdvancedFiltersChange,
}: ResultsScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showSemanticSearch, setShowSemanticSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPresentation, setFilterPresentation] = useState<FilterPresentation>('drawer');
  const [splitLayout, setSplitLayout] = useState<SplitLayout>('2col-wide-map');
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  const isMobile = useIsMobile();

  // On mobile, dividida is not supported — fall back to mapa
  const effectiveView: ViewMode = isMobile && viewMode === 'dividida' ? 'mapa' : viewMode;

  useEffect(() => {
    if (isMobile && viewMode === 'dividida') onViewChange('mapa');
  }, [isMobile]);


  const handleCardSelect = (id: string) => {
    const idx = properties.findIndex(p => p.id === id);
    if (idx >= 0) setMobileActiveIndex(idx);
    setSelectedId(id);
    onViewFullProperty(id);
  };

  // Ninguna vista usa layout fijo — scroll natural en todas
  const isFixedLayout = false;

  return (
    <div
      className="flex flex-col"
      style={{
        height: isFixedLayout ? '100dvh' : undefined,
        minHeight: !isFixedLayout ? '100dvh' : undefined,
        overflow: isFixedLayout ? 'hidden' : undefined,
        background: '#F5F5F5',
      }}
    >
      {/* Full TOCTOC header */}
      <ToctocFullHeader
        onGoHome={onGoHome}
        activeNav={filters.operation === 'arriendo' ? 'Arrendar' : 'Comprar'}
      />

      {/* Breadcrumb + H1 + top banners */}
      <SeoPageInfo filters={filters} resultCount={properties.length} />

      {/* Search bar + filters + view selector */}
      <ResultsHeader
        viewMode={viewMode}
        onViewChange={v => { onViewChange(v); setSelectedId(null); }}
        filters={filters}
        onFiltersChange={onFiltersChange}
        query={query}
        resultCount={properties.length}
        onOpenSemanticSearch={() => setShowSemanticSearch(true)}
        onOpenFilters={() => setShowFilters(true)}
        savedSearch={savedSearch}
        onSaveSearch={onSaveSearch}
        onSearch={onSearch}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={onAdvancedFiltersChange}
      />

      {/* Content */}
      <div className={isFixedLayout ? 'flex-1 overflow-hidden relative' : 'flex-1'}>

        {effectiveView === 'lista' && (
          <ListView
            properties={properties}
            sort={sort}
            onSortChange={onSortChange}
            hoveredId={hoveredId}
            savedProperties={savedProperties}
            onSelect={handleCardSelect}
            onSave={onSaveProperty}
            onHoverCard={setHoveredId}
          />
        )}

        {effectiveView === 'mapa' && (
          <MapViewMode
            properties={properties}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onSelectProperty={id => setSelectedId(id)}
            onHover={setHoveredId}
            onViewList={() => onViewChange('lista')}
            onViewSplit={() => onViewChange('dividida')}
            savedSearch={savedSearch}
            onSaveSearch={onSaveSearch}
            onViewFull={onViewFullProperty}
          />
        )}

        {effectiveView === 'dividida' && (
          <div className="seo-container" style={{ paddingTop: 0, paddingBottom: 40 }}>
          <DividedView
            properties={properties}
            sort={sort}
            onSortChange={onSortChange}
            hoveredId={hoveredId}
            selectedId={selectedId}
            savedProperties={savedProperties}
            onSelect={onViewFullProperty}
            onSave={onSaveProperty}
            onHover={setHoveredId}
            onPinSelect={id => setSelectedId(id)}
            onViewFull={onViewFullProperty}
            splitLayout={splitLayout}
          />
          </div>
        )}

        {/* Bottom sheet: mobile mapa */}
        {effectiveView === 'mapa' && isMobile && properties.length > 0 && (
          <PropertyBottomSheet
            properties={properties}
            activeIndex={mobileActiveIndex}
            onChangeIndex={i => {
              setMobileActiveIndex(i);
              setSelectedId(properties[i]?.id ?? null);
            }}
            onContact={onContact}
            onViewFull={onViewFullProperty}
          />
        )}
      </div>

      {/* SEO page closure — shown in all views */}
      <SeoLinksBlock />
      <ToctocFooter />

      {/* Modals */}
      {showSemanticSearch && (
        <SemanticSearchModal
          onClose={() => setShowSemanticSearch(false)}
          onSearch={q => { onSearch(q); setShowSemanticSearch(false); }}
          currentInterpretation={interpretation}
          currentQuery={query}
        />
      )}
      {filterPresentation === 'drawer' ? (
        <FiltersDrawer
          open={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={onFiltersChange}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={onAdvancedFiltersChange}
          onClear={() => { onFiltersChange({ ...DEFAULT_FILTERS }); onAdvancedFiltersChange({ ...DEFAULT_ADVANCED_FILTERS }); }}
          onApply={() => setShowFilters(false)}
        />
      ) : (
        <FiltersModal
          open={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={onFiltersChange}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={onAdvancedFiltersChange}
          onClear={() => { onFiltersChange({ ...DEFAULT_FILTERS }); onAdvancedFiltersChange({ ...DEFAULT_ADVANCED_FILTERS }); }}
          onApply={() => setShowFilters(false)}
        />
      )}

      <TweaksPanel
        filterPresentation={filterPresentation}
        onFilterPresentationChange={setFilterPresentation}
        splitLayout={splitLayout}
        onSplitLayoutChange={setSplitLayout}
      />
    </div>
  );
}
