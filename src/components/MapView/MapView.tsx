import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Property, MapBounds } from '../../types/property';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Zoom threshold: below → dot, at or above → price label
const PRICE_ZOOM = 14;

// ── Icon factories ────────────────────────────────────────

function createDotIcon(state: 'default' | 'highlighted' | 'active') {
  const size = state === 'active' ? 18 : state === 'highlighted' ? 16 : 12;
  const bg = state === 'active' ? '#37FFDB' : '#3200C1';
  const border = state === 'active' ? '2.5px solid #3200C1' : '2px solid #fff';
  const shadow = state !== 'default' ? '0 0 0 3px rgba(50,0,193,0.18)' : '0 1px 4px rgba(50,0,193,0.25)';
  const half = size / 2;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${bg};
      border:${border};
      box-shadow:${shadow};
      transition:all 0.12s;
    "></div>`,
    iconAnchor: [half, half],
    iconSize: [size, size],
  });
}

function createPriceIcon(priceUF: number, state: 'default' | 'highlighted' | 'active') {
  const cls = state === 'default' ? 'price-marker' : state === 'highlighted' ? 'price-marker highlighted' : 'price-marker active';
  return L.divIcon({
    className: '',
    html: `<div class="${cls}">UF ${priceUF.toLocaleString('es-CL')}</div>`,
    iconAnchor: [35, 15],
    iconSize: [70, 28],
    popupAnchor: [0, -20],
  });
}

// ── Internal components ───────────────────────────────────

interface MapEventsProps {
  onMove: (bounds: MapBounds) => void;
  onZoomChange: (z: number) => void;
}

function MapEvents({ onMove, onZoomChange }: MapEventsProps) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onMove({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  return null;
}

// ── Main ─────────────────────────────────────────────────

export interface MapViewProps {
  properties: Property[];
  hoveredId: string | null;
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
  onHoverMarker: (id: string | null) => void;
  onMapMove?: (bounds: MapBounds) => void;
}

export function MapView({ properties, hoveredId, selectedId, onMarkerClick, onHoverMarker, onMapMove }: MapViewProps) {
  const [zoom, setZoom] = useState(12);

  const handleZoom = (z: number) => setZoom(z);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[-33.4489, -70.6200]}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onMapMove
          ? <MapEvents onMove={b => onMapMove(b)} onZoomChange={handleZoom} />
          : <ZoomTracker onZoomChange={handleZoom} />
        }

        {properties.map(p => {
          const state = selectedId === p.id ? 'active' : hoveredId === p.id ? 'highlighted' : 'default';
          const icon = zoom >= PRICE_ZOOM
            ? createPriceIcon(p.priceUF, state)
            : createDotIcon(state);
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onMarkerClick(p.id),
                mouseover: () => onHoverMarker(p.id),
                mouseout: () => onHoverMarker(null),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
