// Búsqueda única: criterios, reglas de coincidencia y etiquetas.
// Toda superficie que filtra o describe la búsqueda (buscador, filtros, chips, asistente, poder de compra)
// usa estas funciones, para que los conteos y los textos no diverjan entre vistas.

import type { AdvancedFilters, Filters, Property, PropertyType } from '../types/property';
import { DEFAULT_ADVANCED_FILTERS, DEFAULT_FILTERS, PROPERTY_FEATURE_LABELS, PROPERTY_TYPE_LABELS } from '../types/property.ts';
import { bedroomInfo } from '../data/propertyFacts.ts';

/** Estado completo de una búsqueda. Filters y AdvancedFilters no comparten nombres de campo. */
export type SearchCriteria = Filters & AdvancedFilters;

export const DEFAULT_CRITERIA: SearchCriteria = { ...DEFAULT_FILTERS, ...DEFAULT_ADVANCED_FILTERS };

/** Quién puso un criterio. "usuario" no se etiqueta en la interfaz. */
export type CriterionOrigin = 'usuario' | 'asistente' | 'guardada' | 'estimacion' | 'preevaluacion';

/**
 * Clave de un criterio individual. Las listas se descomponen (una clave por comuna, estado o característica)
 * para que cada chip tenga su propio origen y se pueda quitar por separado.
 */
export type CriterionKey = string;

// ── Coincidencia ──────────────────────────────────────────

/**
 * Reglas: entre comunas OR; entre categorías AND; características, todas.
 * Un valor desconocido no coincide con un filtro específico.
 * Barrio, tour virtual y video se ignoran: están ocultos en esta rama por falta de datos.
 */
export function matchesCriteria(p: Property, c: SearchCriteria): boolean {
  if (c.operation && p.operation !== c.operation) return false;
  if (c.propertyType && p.type !== c.propertyType) return false;
  if (c.comunas.length > 0 && !c.comunas.includes(p.zone)) return false;

  if (c.bedrooms !== null) {
    // Studio = estudio declarado; "n+" = n o más dormitorios informados. Oficinas y datos desconocidos no coinciden.
    const b = bedroomInfo(p);
    if (c.bedrooms === 0 ? b.kind !== 'studio' : !(b.kind === 'count' && b.n >= c.bedrooms)) return false;
  }

  if (c.bathroomsMin !== null && p.bathrooms < c.bathroomsMin) return false;
  if (c.bathroomsMax !== null && p.bathrooms > c.bathroomsMax) return false;

  if (p.priceUF < c.priceMinUF || p.priceUF > c.priceMaxUF) return false;
  // El tope de poder de compra solo aplica a compra (se activa en el bloque de financiamiento).
  if (c.budgetCap && c.operation === 'venta' && p.priceUF > c.budgetCap.valueUF) return false;

  if (c.status.length === 1) {
    if (c.status[0] === 'nueva' && !p.isNewProject) return false;
    if (c.status[0] === 'usada' && p.isNewProject) return false;
  }

  if (c.sqmMin !== null && p.sqm < c.sqmMin) return false;
  if (c.sqmMax !== null && p.sqm > c.sqmMax) return false;

  if (c.metroMaxMin !== null && (p.metroWalkMin === undefined || p.metroWalkMin > c.metroMaxMin)) return false;

  if (c.features.length > 0) {
    if (!p.features) return false;
    if (!c.features.every(f => p.features!.includes(f))) return false;
  }

  return true;
}

export function filterProperties(list: Property[], c: SearchCriteria): Property[] {
  return list.filter(p => matchesCriteria(p, c));
}

// ── Claves y valores (para origen y diferencias) ─────────

export function criterionKeys(c: SearchCriteria): CriterionKey[] {
  const k: CriterionKey[] = [];
  if (c.operation) k.push('operation');
  if (c.propertyType) k.push('propertyType');
  c.comunas.forEach(x => k.push(`comuna:${x}`));
  if (c.bedrooms !== null) k.push('bedrooms');
  if (c.bathroomsMin !== null || c.bathroomsMax !== null) k.push('bathrooms');
  if (c.priceMinUF !== DEFAULT_CRITERIA.priceMinUF || c.priceMaxUF !== DEFAULT_CRITERIA.priceMaxUF) k.push('price');
  if (c.budgetCap) k.push('budget');
  c.status.forEach(s => k.push(`status:${s}`));
  if (c.sqmMin !== null || c.sqmMax !== null) k.push('sqm');
  if (c.metroMaxMin !== null) k.push('metro');
  c.features.forEach(f => k.push(`feature:${f}`));
  return k;
}

function criterionValue(c: SearchCriteria, key: CriterionKey): string {
  if (key.includes(':')) return 'on';
  switch (key) {
    case 'operation': return String(c.operation);
    case 'propertyType': return String(c.propertyType);
    case 'bedrooms': return String(c.bedrooms);
    case 'bathrooms': return `${c.bathroomsMin}-${c.bathroomsMax}`;
    case 'price': return `${c.priceMinUF}-${c.priceMaxUF}`;
    case 'budget': return `${c.budgetCap?.kind}-${c.budgetCap?.valueUF}`;
    case 'sqm': return `${c.sqmMin}-${c.sqmMax}`;
    case 'metro': return String(c.metroMaxMin);
    default: return '';
  }
}

export interface CriterionChange {
  key: CriterionKey;
  kind: 'add' | 'remove' | 'replace';
}

/** Qué agrega, quita o cambia `next` respecto de `prev`. Base del origen de criterios y del "Criterios de esta búsqueda". */
export function diffCriteria(prev: SearchCriteria, next: SearchCriteria): CriterionChange[] {
  const a = new Set(criterionKeys(prev));
  const b = new Set(criterionKeys(next));
  const out: CriterionChange[] = [];
  b.forEach(key => {
    if (!a.has(key)) out.push({ key, kind: 'add' });
    else if (criterionValue(prev, key) !== criterionValue(next, key)) out.push({ key, kind: 'replace' });
  });
  a.forEach(key => { if (!b.has(key)) out.push({ key, kind: 'remove' }); });
  return out;
}

/**
 * Separa un cambio en su parte de Filters y de AdvancedFilters, para los componentes que reciben
 * ambos manejadores por separado. Los dos escriben en la misma búsqueda aplicada.
 */
export function splitPatch(patch: Partial<SearchCriteria>): { filters: Partial<Filters>; advanced: Partial<AdvancedFilters> } {
  const filters: Record<string, unknown> = {};
  const advanced: Record<string, unknown> = {};
  Object.entries(patch).forEach(([k, v]) => {
    if (k in DEFAULT_FILTERS) filters[k] = v; else advanced[k] = v;
  });
  return { filters: filters as Partial<Filters>, advanced: advanced as Partial<AdvancedFilters> };
}

/** Cambio parcial que quita un criterio. */
export function removalPatch(c: SearchCriteria, key: CriterionKey): Partial<SearchCriteria> {
  if (key.startsWith('comuna:')) return { comunas: c.comunas.filter(x => x !== key.slice(7)) };
  if (key.startsWith('status:')) return { status: c.status.filter(x => x !== key.slice(7)) };
  if (key.startsWith('feature:')) return { features: c.features.filter(x => x !== key.slice(8)) };
  switch (key) {
    case 'operation': return { operation: null };
    case 'propertyType': return { propertyType: null };
    case 'bedrooms': return { bedrooms: null };
    case 'bathrooms': return { bathroomsMin: null, bathroomsMax: null };
    case 'price': return { priceMinUF: DEFAULT_CRITERIA.priceMinUF, priceMaxUF: DEFAULT_CRITERIA.priceMaxUF };
    case 'budget': return { budgetCap: null };
    case 'sqm': return { sqmMin: null, sqmMax: null };
    case 'metro': return { metroMaxMin: null };
    default: return {};
  }
}

// ── Etiquetas ─────────────────────────────────────────────

const PLURAL_TYPE: Partial<Record<PropertyType, string>> = {
  departamento: 'Departamentos', casa: 'Casas', oficina: 'Oficinas',
};

export function propertyTypePlural(t: PropertyType | null): string {
  if (!t) return 'Todos los tipos';
  return PLURAL_TYPE[t] ?? PROPERTY_TYPE_LABELS[t];
}

export function bedroomsLabel(n: number): string {
  return n === 0 ? 'Studio' : `${n}+ dorm.`;
}

const fmt = (n: number) => n.toLocaleString('es-CL');

function rangeLabel(min: number | null, max: number | null, unit: string, prefix = ''): string {
  if (min !== null && max !== null) return `${prefix}${fmt(min)}–${fmt(max)} ${unit}`.trim();
  if (min !== null) return `Desde ${prefix}${fmt(min)} ${unit}`.trim();
  return `Hasta ${prefix}${fmt(max ?? 0)} ${unit}`.trim();
}

export function criterionLabel(c: SearchCriteria, key: CriterionKey): string {
  if (key.startsWith('comuna:')) return key.slice(7);
  if (key.startsWith('status:')) return key.slice(7) === 'nueva' ? 'Nueva' : 'Usada';
  if (key.startsWith('feature:')) return PROPERTY_FEATURE_LABELS[key.slice(8) as keyof typeof PROPERTY_FEATURE_LABELS];
  switch (key) {
    case 'operation': return c.operation === 'arriendo' ? 'Arrendar' : 'Comprar';
    case 'propertyType': return propertyTypePlural(c.propertyType);
    case 'bedrooms': return bedroomsLabel(c.bedrooms ?? 0);
    case 'bathrooms':
      if (c.bathroomsMax === null) return `${c.bathroomsMin}+ baños`;
      return `${c.bathroomsMin ?? 0}–${c.bathroomsMax} baños`;
    case 'price': {
      const min = c.priceMinUF > DEFAULT_CRITERIA.priceMinUF ? c.priceMinUF : null;
      const max = c.priceMaxUF < DEFAULT_CRITERIA.priceMaxUF ? c.priceMaxUF : null;
      return rangeLabel(min, max, '', 'UF ');
    }
    case 'budget':
      return `Hasta UF ${fmt(c.budgetCap?.valueUF ?? 0)}`;
    case 'sqm': {
      const max = c.sqmMax !== null && c.sqmMax < 9999 ? c.sqmMax : null;
      return rangeLabel(c.sqmMin && c.sqmMin > 0 ? c.sqmMin : null, max, 'm²');
    }
    case 'metro': return `Metro a ${c.metroMaxMin} min o menos`;
    default: return key;
  }
}

export interface ActiveCriterion {
  key: CriterionKey;
  label: string;
}

/** Criterios activos en orden de lectura, con su etiqueta. */
export function activeCriteria(c: SearchCriteria, opts: { exclude?: CriterionKey[] } = {}): ActiveCriterion[] {
  const ex = new Set(opts.exclude ?? []);
  return criterionKeys(c)
    .filter(k => !ex.has(k))
    .map(key => ({ key, label: criterionLabel(c, key) }));
}

const normText = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Nombre oficial de una comuna escrita a mano ("nunoa" → "Ñuñoa"). Si no la reconoce, devuelve el texto tal cual. */
export function canonicalComuna(text: string, known: string[]): string {
  return known.find(k => normText(k) === normText(text)) ?? text.trim();
}

/** Frase para títulos y migas: "Departamentos en venta en Ñuñoa y Macul". */
export function comunasPhrase(comunas: string[]): string {
  if (comunas.length === 0) return '';
  if (comunas.length === 1) return comunas[0];
  return `${comunas.slice(0, -1).join(', ')} y ${comunas[comunas.length - 1]}`;
}
