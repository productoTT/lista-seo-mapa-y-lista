export type PropertyType =
  | 'departamento' | 'casa' | 'oficina' | 'local_comercial' | 'bodega'
  | 'estacionamiento' | 'parcela' | 'terreno' | 'campo_agricola'
  | 'industrial' | 'vacacional';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  oficina: 'Oficina',
  local_comercial: 'Local comercial',
  bodega: 'Bodega',
  estacionamiento: 'Estacionamiento',
  parcela: 'Parcela',
  terreno: 'Terreno',
  campo_agricola: 'Campo agrícola',
  industrial: 'Industrial',
  vacacional: 'Vacacional',
};
export type BadgeType = 'new' | 'price_drop' | 'opportunity';
export type SortOption = 'relevant' | 'price_asc' | 'price_desc' | 'newest' | 'sqm_desc';
export type OperationType = 'venta' | 'arriendo';
export type CommercialStatus = 'organic' | 'featured' | 'sponsored' | 'ai_recommended';
export type ViewMode = 'lista' | 'mapa' | 'dividida';
export type Screen = 'home' | 'interpreting' | 'results' | 'property-full';

export interface Property {
  id: string;
  title: string;
  price: number;
  priceUF: number;
  address: string;
  zone: string;
  lat: number;
  lng: number;
  bedrooms: number;
  /** Estudio declarado. "0 dormitorios" no basta: ver data/propertyFacts.ts. */
  isStudio?: boolean;
  bathrooms: number;
  sqm: number;
  sqmTotal: number;
  type: PropertyType;
  operation: OperationType;
  badges: BadgeType[];
  commercialStatus: CommercialStatus;
  isNewProject: boolean;
  description: string;
  imageUrl: string;
  images?: string[];
  parkingSpots?: number;
  storageUnits?: number;
  /** Minutos caminando a la estación de metro más cercana. `undefined` = dato desconocido. */
  metroWalkMin?: number;
  /** Características declaradas. `undefined` = dato desconocido (no coincide con ningún filtro de características). */
  features?: PropertyFeature[];
  listedAt: number;
  relevanceScore: number;
}

export interface SearchInterpretation {
  query: string;
  operation?: string;
  propertyType?: string;
  zone?: string;
  bedrooms?: string;
  maxPrice?: string;
}

export type PropertyFeature = 'terraza' | 'estacionamiento' | 'mascotas' | 'patio' | 'bodega';

export const PROPERTY_FEATURE_LABELS: Record<PropertyFeature, string> = {
  terraza: 'Terraza',
  estacionamiento: 'Estacionamiento',
  mascotas: 'Acepta mascotas',
  patio: 'Patio',
  bodega: 'Bodega',
};

/** Tope de poder de compra (estimación o pre-evaluación). Se prepara aquí; se activa en un bloque posterior. */
export interface BudgetCap {
  valueUF: number;
  kind: 'estimacion' | 'preevaluacion';
}

export interface Filters {
  priceMinUF: number;
  priceMaxUF: number;
  /**
   * Dormitorios. `null` = cualquiera · `0` = solo estudios · `n ≥ 1` = n o más (excluye estudios).
   * No aplica a tipos sin dormitorios (oficinas, locales, etc.): esas propiedades no coinciden si hay filtro.
   */
  bedrooms: number | null;
  /** `null` = todos los tipos. */
  propertyType: PropertyType | null;
  /** Comunas seleccionadas. Vacío = todas. Entre comunas aplica OR. */
  comunas: string[];
  operation: OperationType | null;
  /** Máximo de minutos caminando al metro. */
  metroMaxMin: number | null;
  /** Características requeridas: deben cumplirse todas. */
  features: PropertyFeature[];
  budgetCap: BudgetCap | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const DEFAULT_FILTERS: Filters = {
  priceMinUF: 0,
  priceMaxUF: 25000,
  bedrooms: null,
  propertyType: null,
  comunas: [],
  operation: null,
  metroMaxMin: null,
  features: [],
  budgetCap: null,
};

export interface AdvancedFilters {
  status: ('nueva' | 'usada')[];
  region: string;
  /** Oculto en esta rama: no hay datos de barrio. Se conserva el campo para no romper la forma del estado. */
  barrio: string;
  bathroomsMin: number | null;
  bathroomsMax: number | null;
  sqmMin: number | null;
  sqmMax: number | null;
  /** Oculto en esta rama: no hay datos de tour virtual. */
  tourVirtual: boolean;
  /** Oculto en esta rama: no hay datos de video. */
  video: boolean;
  priceCurrency: 'UF' | 'CLP';
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  status: [],
  region: '',
  barrio: '',
  bathroomsMin: null,
  bathroomsMax: null,
  sqmMin: null,
  sqmMax: null,
  tourVirtual: false,
  video: false,
  priceCurrency: 'UF',
};
