import type { Property } from '../../types/property';
import { PreviewHeader } from './PreviewHeader';
import { PropertyPreviewContent } from './PropertyPreviewContent';
import { PreviewActions } from './PreviewActions';
import type { PropertyPreviewController } from './usePropertyPreview';

interface PreviewDrawerProps {
  property: Property;
  controller: PropertyPreviewController;
  isSaved: boolean;
  onSave: (id: string) => void;
  onViewFull: (id: string) => void;
  allProperties: Property[];
  onSelectSimilar: (id: string) => void;
}

export function PreviewDrawer({ property, controller, isSaved, onSave, onViewFull, allProperties, onSelectSimilar }: PreviewDrawerProps) {
  const width = controller.drawerSize === 'compact' ? 520 : 600;
  const showOverlay = controller.background !== 'interactive';
  const overlayInteractive = controller.background === 'overlay';

  return (
    <>
      {showOverlay && (
        <div
          onClick={overlayInteractive ? controller.close : undefined}
          style={{
            position: 'fixed', inset: 0, zIndex: 1200,
            background: overlayInteractive ? 'rgba(20,10,50,0.32)' : 'transparent',
            backdropFilter: overlayInteractive ? 'blur(1px)' : undefined,
            cursor: overlayInteractive ? 'pointer' : 'default',
          }}
        />
      )}

      <div
        role="dialog"
        aria-label={`Ficha resumida: ${property.title}`}
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width, maxWidth: '100vw',
          background: '#fff', zIndex: 1201, display: 'flex', flexDirection: 'column',
          boxShadow: '-6px 0 32px rgba(34,17,96,0.16)',
          animation: 'slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <PreviewHeader
          onClose={controller.close}
          isSaved={isSaved}
          onSave={() => onSave(property.id)}
          showPrevNext={controller.toggles.prevNext}
          hasPrev={controller.hasPrev}
          hasNext={controller.hasNext}
          onPrev={controller.goPrev}
          onNext={controller.goNext}
        />

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <PropertyPreviewContent
            property={property}
            controller={controller}
            isSaved={isSaved}
            onSave={onSave}
            onViewFull={onViewFull}
            allProperties={allProperties}
            onSelectSimilar={onSelectSimilar}
            galleryHeight={240}
            hideActions
          />
        </div>

        {controller.loadState === 'idle' && (
          <div style={{ padding: 16, borderTop: '1px solid #E5E5E5', flexShrink: 0, background: '#fff', maxHeight: '70vh', overflowY: 'auto' }}>
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
    </>
  );
}
