import type { Property } from '../../types/property';
import { PreviewMapPanel } from './PreviewMapPanel';
import { PreviewMapReplace } from './PreviewMapReplace';
import type { PropertyPreviewController } from './usePropertyPreview';

interface MapPreviewOverlayProps {
  property: Property | null;
  controller: PropertyPreviewController;
  isSaved: boolean;
  onSave: (id: string) => void;
  onViewFull: (id: string) => void;
  allProperties: Property[];
  onSelectSimilar: (id: string) => void;
}

export function MapPreviewOverlay({ property, controller, ...rest }: MapPreviewOverlayProps) {
  if (!property) return null;
  if (controller.variant === 'map-panel') return <PreviewMapPanel property={property} controller={controller} {...rest} />;
  if (controller.variant === 'map-replace') return <PreviewMapReplace property={property} controller={controller} {...rest} />;
  return null;
}
