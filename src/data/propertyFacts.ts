// Lectura de atributos de una propiedad que no se pueden inferir de un solo número.
import type { Property, PropertyType } from '../types/property';

/** Tipos que tienen dormitorios. En el resto (oficinas, locales, etc.) el dato no aplica. */
export const RESIDENTIAL_TYPES: PropertyType[] = ['departamento', 'casa', 'vacacional'];

export type BedroomInfo =
  | { kind: 'studio' }
  | { kind: 'count'; n: number }
  /** El tipo de propiedad no tiene dormitorios (oficina, local…). */
  | { kind: 'not-applicable' }
  /** Residencial sin estudio declarado ni dormitorios informados. */
  | { kind: 'unknown' };

/**
 * Un estudio se declara explícitamente (`isStudio`). "0 dormitorios" por sí solo no basta:
 * en una oficina significa "no aplica" y en una vivienda sin declarar significa "dato desconocido".
 */
export function bedroomInfo(p: Property): BedroomInfo {
  if (!RESIDENTIAL_TYPES.includes(p.type)) return { kind: 'not-applicable' };
  if (p.isStudio) return { kind: 'studio' };
  if (p.bedrooms > 0) return { kind: 'count', n: p.bedrooms };
  return { kind: 'unknown' };
}

/** Texto para las tarjetas: "Studio", el número de dormitorios o null si no se muestra. */
export function bedroomsText(p: Property, withUnit = false): string | null {
  const b = bedroomInfo(p);
  if (b.kind === 'studio') return 'Studio';
  if (b.kind === 'count') return withUnit ? `${b.n} dorm.` : String(b.n);
  return null;
}
