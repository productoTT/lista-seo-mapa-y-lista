import { X } from 'lucide-react';
import type { Property } from '../../types/property';
import { PropertyPreviewContent } from './PropertyPreviewContent';
import type { PropertyPreviewController } from './usePropertyPreview';

interface PreviewMapPanelProps {
  property: Property;
  controller: PropertyPreviewController;
  isSaved: boolean;
  onSave: (id: string) => void;
  onViewFull: (id: string) => void;
  allProperties: Property[];
  onSelectSimilar: (id: string) => void;
}

export function PreviewMapPanel({ property, controller, isSaved, onSave, onViewFull, allProperties, onSelectSimilar }: PreviewMapPanelProps) {
  const width = controller.mapPanelSize === 'compact' ? 300 : 380;
  const maxHeight = controller.mapPanelSize === 'compact' ? '58%' : '78%';
  const showScrim = controller.background === 'blocked';

  return (
    <>
      {showScrim && <div style={{ position: 'absolute', inset: 0, zIndex: 899 }} />}
      <div
        role="dialog"
        aria-label={`Vista rápida sobre el mapa: ${property.title}`}
        style={{
          position: 'absolute', top: 16, left: 16, width, maxHeight,
          background: '#fff', borderRadius: 14, zIndex: 900,
          boxShadow: '0 10px 40px rgba(34,17,96,0.28)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeScaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <button
          onClick={controller.close}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 1,
            width: 26, height: 26, borderRadius: '50%', background: '#fff', border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          <X size={13} color="#343A40" />
        </button>

        <div style={{ overflowY: 'auto' }}>
          <PropertyPreviewContent
            property={property}
            controller={controller}
            isSaved={isSaved}
            onSave={onSave}
            onViewFull={onViewFull}
            allProperties={allProperties}
            onSelectSimilar={onSelectSimilar}
            compact
            galleryHeight={controller.mapPanelSize === 'compact' ? 130 : 170}
          />
        </div>
      </div>
    </>
  );
}
