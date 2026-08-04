export type PreviewVariant = 'drawer' | 'modal' | 'map-panel' | 'map-replace';
export type PreviewOrigin = 'card' | 'ver-mas' | 'marker' | 'map-preview';
export type PreviewStage = 'preview' | 'contact' | 'contact-sent';
export type PreviewLoadState = 'idle' | 'loading' | 'error';
export type DrawerSize = 'compact' | 'amplio';
export type ModalColumns = 1 | 2;
export type MapPanelSize = 'compact' | 'expanded';
export type MapReplaceView = 'ficha' | 'mapa';
export type BackgroundMode = 'interactive' | 'blocked' | 'overlay';

export interface PreviewToggles {
  similar: boolean;
  descriptionExpanded: boolean;
  clpEquivalent: boolean;
  prevNext: boolean;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const VARIANT_LABELS: Record<PreviewVariant, string> = {
  drawer: 'Drawer lateral',
  modal: 'Modal amplio',
  'map-panel': 'Panel sobre mapa',
  'map-replace': 'Panel que reemplaza el mapa',
};

export const ORIGIN_LABELS: Record<PreviewOrigin, string> = {
  card: 'Card del listado',
  'ver-mas': 'Botón "Ver más"',
  marker: 'Marcador del mapa',
  'map-preview': 'Preview del mapa',
};
