import { List, Columns2, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Property } from '../../types/property';
import { MapView } from '../MapView/MapView';
import { MapPinCard } from '../seo/MapPinCard';

interface MapViewModeProps {
  properties: Property[];
  hoveredId: string | null;
  selectedId: string | null;
  onSelectProperty: (id: string) => void;
  onHover: (id: string | null) => void;
  onViewList: () => void;
  onViewSplit: () => void;
  savedSearch: boolean;
  onSaveSearch: () => void;
  onViewFull?: (id: string) => void;
}

export function MapViewMode({
  properties, hoveredId, selectedId, onSelectProperty, onHover,
  onViewList, onViewSplit, savedSearch, onSaveSearch, onViewFull,
}: MapViewModeProps) {
  const selectedProperty = selectedId ? properties.find(p => p.id === selectedId) ?? null : null;

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
        onMarkerClick={id => onSelectProperty(selectedId === id ? '' : id)}
        onHoverMarker={onHover}
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

      {/* Mini-card on pin select */}
      {selectedProperty && onViewFull && (
        <MapPinCard
          property={selectedProperty}
          onClose={() => onSelectProperty('')}
          onViewFull={onViewFull}
        />
      )}
      </div>
    </div>
  );
}
