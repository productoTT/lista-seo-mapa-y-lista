import type { Property } from '../../types/property';
import { PreviewHeader } from './PreviewHeader';
import { PropertyGallery } from './PropertyGallery';
import { PropertyPreviewContent } from './PropertyPreviewContent';
import { PreviewActions } from './PreviewActions';
import type { PropertyPreviewController } from './usePropertyPreview';

interface PreviewModalProps {
  property: Property;
  controller: PropertyPreviewController;
  isSaved: boolean;
  onSave: (id: string) => void;
  onViewFull: (id: string) => void;
  allProperties: Property[];
  onSelectSimilar: (id: string) => void;
}

export function PreviewModal({ property, controller, isSaved, onSave, onViewFull, allProperties, onSelectSimilar }: PreviewModalProps) {
  const images = property.images && property.images.length > 0 ? property.images : [property.imageUrl];
  const overlayInteractive = controller.background === 'overlay';
  const showOverlay = controller.background !== 'interactive';
  const isTwoCol = controller.modalColumns === 2 && controller.loadState === 'idle';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {showOverlay && (
        <div
          onClick={overlayInteractive ? controller.close : undefined}
          style={{
            position: 'absolute', inset: 0,
            background: overlayInteractive ? 'rgba(20,10,50,0.45)' : 'transparent',
            backdropFilter: overlayInteractive ? 'blur(2px)' : undefined,
            cursor: overlayInteractive ? 'pointer' : 'default',
          }}
        />
      )}

      <div
        role="dialog"
        aria-label={`Vista rápida: ${property.title}`}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', zIndex: 1,
          width: 'min(980px, 94vw)', maxHeight: '90vh',
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(20,10,50,0.35)',
          animation: 'fadeScaleIn 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <PreviewHeader
          onClose={controller.close}
          isSaved={isSaved}
          onSave={() => onSave(property.id)}
          showBackLabel={false}
          showPrevNext={controller.toggles.prevNext}
          hasPrev={controller.hasPrev}
          hasNext={controller.hasNext}
          onPrev={controller.goPrev}
          onNext={controller.goNext}
        />

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {isTwoCol ? (
            <div style={{ display: 'grid', gridTemplateColumns: '44% 56%' }}>
              <div style={{ padding: 20 }}>
                <PropertyGallery
                  images={images}
                  title={property.title}
                  index={controller.galleryIndex}
                  onIndexChange={controller.setGalleryIndex}
                  expanded={false}
                  onToggleExpanded={() => controller.setGalleryExpanded(true)}
                  height={420}
                />
              </div>
              <div style={{ borderLeft: '1px solid #E5E5E5' }}>
                <PropertyPreviewContent
                  property={property}
                  controller={controller}
                  isSaved={isSaved}
                  onSave={onSave}
                  onViewFull={onViewFull}
                  allProperties={allProperties}
                  onSelectSimilar={onSelectSimilar}
                  hideGallery
                  hideActions
                />
              </div>
            </div>
          ) : (
            <PropertyPreviewContent
              property={property}
              controller={controller}
              isSaved={isSaved}
              onSave={onSave}
              onViewFull={onViewFull}
              allProperties={allProperties}
              onSelectSimilar={onSelectSimilar}
              galleryHeight={340}
              hideActions
            />
          )}
        </div>

        {controller.loadState === 'idle' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #E5E5E5', flexShrink: 0, background: '#fff' }}>
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
    </div>
  );
}
