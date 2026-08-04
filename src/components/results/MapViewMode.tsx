import { useRef } from 'react';
import { List, Columns2, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Property } from '../../types/property';
import { MapView } from '../MapView/MapView';
import { MapPinCard } from '../seo/MapPinCard';
import { MapPreviewOverlay } from '../preview/MapPreviewOverlay';
import type { PropertyPreviewController } from '../preview/usePropertyPreview';

interface MapViewModeProps {
  properties: Property[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onViewList: () => void;
  onViewSplit: () => void;
  savedSearch: boolean;
  onSaveSearch: () => void;
  preview: PropertyPreviewController;
  savedProperties: Set<string>;
  onSaveProperty: (id: string) => void;
  onViewFullProperty: (id: string) => void;
  onMarkerClick: (id: string) => void;
  onSelectSimilar: (id: string) => void;
}

export function MapViewMode({
  properties, hoveredId, onHover, onViewList, onViewSplit, savedSearch, onSaveSearch,
  preview, savedProperties, onSaveProperty, onViewFullProperty, onMarkerClick, onSelectSimilar,
}: MapViewModeProps) {
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

  return (
    // Outer: seo-container margins so map aligns with the rest of the page
    <div className="seo-container" style={{ paddingTop: 16, paddingBottom: 40 }}>
      {/* Map wrapper: explicit tall height so it's protagonic, not a leftover slice */}
      <div
        className="relative w-full"
        style={{ height: 'calc(100vh - 120px)', minHeight: 640, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(50,0,193,0.10)' }}
      >
      <MapView
        properties={properties}
        hoveredId={hoveredId}
        selectedId={selectedId}
        onMarkerClick={onMarkerClick}
        onHoverMarker={handleMarkerHover}
      />

      {/* Counter */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg pointer-events-none"
        style={{ background: 'rgba(34,17,96,0.88)', color: '#fff', backdropFilter: 'blur(4px)', zIndex: 800 }}
      >
        {properties.length} propiedades en esta área
      </div>

      {/* Bottom-left: switch view buttons */}
      <div className="absolute bottom-6 left-3 flex flex-col gap-2" style={{ zIndex: 800 }}>
        <button
          onClick={onViewList}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: '#fff', color: '#3200C1' }}
        >
          <List size={15} />
          Lista
        </button>
        <button
          onClick={onViewSplit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: '#fff', color: '#3200C1' }}
        >
          <Columns2 size={15} />
          Dividida
        </button>
      </div>

      {/* Save search */}
      <button
        onClick={onSaveSearch}
        className="absolute bottom-6 right-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all"
        style={savedSearch
          ? { background: '#3200C1', color: '#37FFDB', zIndex: 800 }
          : { background: '#fff', color: '#343A40', zIndex: 800 }
        }
      >
        {savedSearch ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        {savedSearch ? 'Guardada' : 'Guardar búsqueda'}
      </button>

      {/* Hint */}
      {!selectedProperty && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.92)', color: '#343A40', zIndex: 800 }}
        >
          Haz clic en un pin para ver el detalle
        </div>
      )}

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

      {/* Ficha resumida sobre el mapa (variantes "panel sobre mapa" / "reemplaza el mapa") */}
      <MapPreviewOverlay
        property={selectedProperty}
        controller={preview}
        isSaved={selectedProperty ? savedProperties.has(selectedProperty.id) : false}
        onSave={onSaveProperty}
        onViewFull={onViewFullProperty}
        allProperties={properties}
        onSelectSimilar={onSelectSimilar}
      />
      </div>
    </div>
  );
}
