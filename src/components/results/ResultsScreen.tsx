import { useState, useEffect } from 'react';
import type { Filters, AdvancedFilters, ViewMode, SearchInterpretation, SortOption } from '../../types/property';
import type { Property } from '../../types/property';
import { DEFAULT_FILTERS, DEFAULT_ADVANCED_FILTERS } from '../../types/property';
import { MobileResultsView } from '../mobile/MobileResultsView';
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
import { usePropertyPreview } from '../preview/usePropertyPreview';
import { PreviewDrawer } from '../preview/PreviewDrawer';
import { PreviewModal } from '../preview/PreviewModal';
import { PreviewTweaksPanel } from '../preview/PreviewTweaksPanel';

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

  // ── Ficha resumida de propiedad (sin salir de Lista/Mapa) ──
  const preview = usePropertyPreview(properties.map(p => p.id));
  const previewProperty = preview.propertyId ? properties.find(p => p.id === preview.propertyId) ?? null : null;
  const isSavedPreview = previewProperty ? savedProperties.has(previewProperty.id) : false;

  const openFromCard = (id: string) => {
    const idx = properties.findIndex(p => p.id === id);
    if (idx >= 0) setMobileActiveIndex(idx);
    preview.open(id, 'card');
  };
  const openFromViewMore = (id: string) => preview.open(id, 'ver-mas');
  const openFromQuote = (id: string) => preview.open(id, 'card', { stage: 'contact' });
  const openFromMarker = (id: string) => {
    if (preview.propertyId === id) preview.close();
    else preview.open(id, 'marker');
  };
  const selectSimilar = (id: string) => preview.open(id, 'card');

  // Cuando la selección viene de un marcador, lleva la vista al card correspondiente sin saltos bruscos
  useEffect(() => {
    if (preview.origin === 'marker' && preview.propertyId && effectiveView === 'dividida') {
      document.getElementById(`prop-card-${preview.propertyId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [preview.propertyId, preview.origin, effectiveView]);

  const mapVariantActive = preview.variant === 'map-panel' || preview.variant === 'map-replace';
  const mapIsVisible = effectiveView === 'mapa' || effectiveView === 'dividida';
  // Si la variante elegida vive "sobre el mapa" pero no hay mapa en pantalla (vista lista),
  // se recurre al drawer para que la ficha nunca desaparezca silenciosamente.
  const showRootDrawer = !!previewProperty && (preview.variant === 'drawer' || (mapVariantActive && !mapIsVisible));
  const showRootModal = !!previewProperty && preview.variant === 'modal';

  // ── Mobile: render experiencia de mapa + bottom sheet ──
  if (isMobile) {
    return (
      <MobileResultsView
        properties={properties}
        filters={filters}
        onFiltersChange={onFiltersChange}
        query={query}
        savedProperties={savedProperties}
        onSaveProperty={onSaveProperty}
        onGoHome={onGoHome}
        onViewFullProperty={onViewFullProperty}
        sort={sort}
        onSortChange={onSortChange}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={onAdvancedFiltersChange}
        onSearch={onSearch}
        interpretation={interpretation}
      />
    );
  }

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
        onViewChange={v => { onViewChange(v); preview.close(); }}
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
            selectedId={preview.propertyId}
            savedProperties={savedProperties}
            onSelect={openFromCard}
            onQuote={openFromQuote}
            onViewMore={openFromViewMore}
            onSave={onSaveProperty}
            onHoverCard={setHoveredId}
          />
        )}

        {effectiveView === 'mapa' && (
          <MapViewMode
            properties={properties}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onViewList={() => onViewChange('lista')}
            onViewSplit={() => onViewChange('dividida')}
            savedSearch={savedSearch}
            onSaveSearch={onSaveSearch}
            preview={preview}
            savedProperties={savedProperties}
            onSaveProperty={onSaveProperty}
            onViewFullProperty={onViewFullProperty}
            onMarkerClick={openFromMarker}
            onSelectSimilar={selectSimilar}
          />
        )}

        {effectiveView === 'dividida' && (
          <div className="seo-container" style={{ paddingTop: 0, paddingBottom: 40 }}>
          <DividedView
            properties={properties}
            sort={sort}
            onSortChange={onSortChange}
            hoveredId={hoveredId}
            savedProperties={savedProperties}
            onSelect={openFromCard}
            onQuote={openFromQuote}
            onViewMore={openFromViewMore}
            onSave={onSaveProperty}
            onHover={setHoveredId}
            onMarkerClick={openFromMarker}
            onViewFull={onViewFullProperty}
            onSelectSimilar={selectSimilar}
            splitLayout={splitLayout}
            preview={preview}
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
              const id = properties[i]?.id;
              if (id) preview.open(id, 'card'); else preview.close();
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

      {/* Ficha resumida de propiedad — drawer/modal viven a nivel de página; panel-sobre-mapa vive dentro de cada vista de mapa */}
      {showRootDrawer && previewProperty && (
        <PreviewDrawer
          property={previewProperty}
          controller={preview}
          isSaved={isSavedPreview}
          onSave={onSaveProperty}
          onViewFull={onViewFullProperty}
          allProperties={properties}
          onSelectSimilar={selectSimilar}
        />
      )}
      {showRootModal && previewProperty && (
        <PreviewModal
          property={previewProperty}
          controller={preview}
          isSaved={isSavedPreview}
          onSave={onSaveProperty}
          onViewFull={onViewFullProperty}
          allProperties={properties}
          onSelectSimilar={selectSimilar}
        />
      )}

      <PreviewTweaksPanel controller={preview} properties={properties} />
    </div>
  );
}
