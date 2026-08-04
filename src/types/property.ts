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

export interface Filters {
  priceMinUF: number;
  priceMaxUF: number;
  bedrooms: number | null;
  propertyType: PropertyType | null;
  zone: string;
  operation: OperationType | null;
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
  zone: '',
  operation: null,
};

export interface AdvancedFilters {
  status: ('nueva' | 'usada')[];
  region: string;
  barrio: string;
  bathroomsMin: number | null;
  bathroomsMax: number | null;
  sqmMin: number | null;
  sqmMax: number | null;
  tourVirtual: boolean;
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
