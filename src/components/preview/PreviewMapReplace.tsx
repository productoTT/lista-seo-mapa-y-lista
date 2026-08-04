import { Map as MapIcon, LayoutList, ImageOff } from 'lucide-react';
import type { Property } from '../../types/property';
import { PropertyPreviewContent } from './PropertyPreviewContent';
import { PreviewActions } from './PreviewActions';
import type { PropertyPreviewController } from './usePropertyPreview';

const INDIGO = '#3200C1';
const DIVIDER = '#E5E5E5';

interface PreviewMapReplaceProps {
  property: Property;
  controller: PropertyPreviewController;
  isSaved: boolean;
  onSave: (id: string) => void;
  onViewFull: (id: string) => void;
  allProperties: Property[];
  onSelectSimilar: (id: string) => void;
}

export function PreviewMapReplace({ property, controller, isSaved, onSave, onViewFull, allProperties, onSelectSimilar }: PreviewMapReplaceProps) {
  const isFicha = controller.mapReplaceView === 'ficha';

  if (!isFicha) {
    return (
      <button
        onClick={() => controller.setMapReplaceView('ficha')}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 900,
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999,
          background: '#fff', border: 0, cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,17,96,0.25)',
          fontSize: 13, fontWeight: 700, color: INDIGO, fontFamily: 'inherit',
        }}
      >
        <ImageOff size={15} /> Ver ficha de {property.title.split(' ').slice(0, 2).join(' ')}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={`Ficha resumida: ${property.title}`}
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '92%',
        background: '#fff', zIndex: 900, display: 'flex', flexDirection: 'column',
        boxShadow: '-6px 0 28px rgba(34,17,96,0.18)',
        animation: 'slideInRight 0.24s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Tab control: Ficha / Mapa */}
      <div style={{ display: 'flex', gap: 0, padding: 10, borderBottom: `1px solid ${DIVIDER}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', flex: 1, border: `1px solid ${DIVIDER}`, borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => controller.setMapReplaceView('ficha')}
            style={tabStyle(true)}
          >
            <LayoutList size={13} /> Ficha
          </button>
          <button
            onClick={() => controller.setMapReplaceView('mapa')}
            style={tabStyle(false)}
          >
            <MapIcon size={13} /> Mapa
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <PropertyPreviewContent
          property={property}
          controller={controller}
          isSaved={isSaved}
          onSave={onSave}
          onViewFull={onViewFull}
          allProperties={allProperties}
          onSelectSimilar={onSelectSimilar}
          galleryHeight={200}
          hideActions
        />
      </div>

      {controller.loadState === 'idle' && (
        <div style={{ padding: 14, borderTop: `1px solid ${DIVIDER}`, flexShrink: 0, background: '#fff' }}>
          <PreviewActions
            propertyId={property.id}
            propertyTitle={property.title}
            controller={controller}
            isSaved={isSaved}
            onSave={onSave}
            onViewFull={onViewFull}
          />
        </div>
      )}
    </div>
  );
}

function tabStyle(active: boolean) {
  return {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '8px 10px', border: 0, fontSize: 12, fontWeight: 700, cursor: 'pointer' as const,
    fontFamily: 'inherit', transition: 'all 120ms',
    background: active ? INDIGO : '#fff',
    color: active ? '#fff' : '#666',
  };
}
