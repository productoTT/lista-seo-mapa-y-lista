// Shared IA search loader logic — única fuente de verdad para todos los puntos de
// entrada que muestran el loader de búsqueda (home desktop/mobile, resultados desktop/mobile).
// El loader es intencionalmente genérico: no debe repetirse aquí ningún criterio
// específico del usuario (comuna, tipo de propiedad, dormitorios, precio, etc).

export const LOADING_STEPS = [
  'Interpretando tu búsqueda...',
  'Buscando propiedades que coincidan con tu criterio...',
  'Ordenando resultados relevantes...',
  'Preparando tu lista de propiedades...',
];

// Step transition timestamps (ms from search start)
export const STEP_TIMESTAMPS = [0, 2000, 4000, 6000];
// Total duration before closing
export const SEARCH_TOTAL_MS = 8000;

// extractChipsSEO se usa únicamente para el preview de interpretación que se muestra
// ANTES de buscar (mientras el usuario escribe), no dentro del loader.
const ZONES_MAP: Record<string, string> = {
  'ñuñoa': 'Ñuñoa', 'providencia': 'Providencia', 'las condes': 'Las Condes',
  'vitacura': 'Vitacura', 'santiago centro': 'Santiago Centro', 'santiago': 'Santiago',
  'miraflores': 'Miraflores', 'la florida': 'La Florida', 'peñalolén': 'Peñalolén', 'la reina': 'La Reina',
};

export function extractChipsSEO(q: string): string[] {
  const lower = q.toLowerCase();
  const chips: string[] = [];
  if (lower.includes('depto') || lower.includes('departamento') || lower.includes('dpto')) chips.push('Departamento');
  else if (lower.includes('casa')) chips.push('Casa');
  else if (lower.includes('oficina')) chips.push('Oficina');
  for (const z of Object.keys(ZONES_MAP)) {
    if (lower.includes(z)) { chips.push(ZONES_MAP[z]); break; }
  }
  const beds = lower.match(/(\d)\s*dorm/);
  if (beds) chips.push(`${beds[1]} dorm.`);
  const uf = lower.match(/(\d[\d.]*)\s*uf/i);
  if (uf) chips.push(`Hasta UF ${parseInt(uf[1].replace(/\./g, '')).toLocaleString('es-CL')}`);
  if (lower.includes('metro')) chips.push('Cerca de metro');
  if (lower.includes('terraza')) chips.push('Terraza');
  if (lower.includes('nueva') || lower.includes('nuevo')) chips.push('Nueva');
  if (!lower.includes('arriendo')) chips.unshift('Comprar');
  else chips.unshift('Arrendar');
  return chips;
}
