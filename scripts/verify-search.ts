// Verificación del bloque 1: reglas de filtrado, conteos y estado compartido de búsqueda.
// Ejecutar con:  npm run verify:search   (o: node scripts/verify-search.ts)
// Usa los mismos módulos que la app; no duplica la lógica que verifica, salvo en los chequeos independientes marcados.

import { mockProperties as DATA } from '../src/data/mockProperties.ts';
import { UF_CLP } from '../src/data/uf.ts';
import type { SearchCriteria } from '../src/search/criteria.ts';
import { DEFAULT_CRITERIA, filterProperties } from '../src/search/criteria.ts';
import { initialSearchState, searchReducer } from '../src/search/searchState.ts';
import { bedroomInfo, bedroomsText } from '../src/data/propertyFacts.ts';

let failures = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? `  (${detail})` : ''}`);
}
const C = (patch: Partial<SearchCriteria>): SearchCriteria => ({ ...DEFAULT_CRITERIA, ...patch });
const count = (patch: Partial<SearchCriteria>) => filterProperties(DATA, C(patch)).length;

// ── Datos ──
console.log('\n── Datos ficticios');
console.log(`  ${DATA.length} propiedades · ${DATA.filter(p => p.operation === 'venta').length} en venta · ${DATA.filter(p => p.operation === 'arriendo').length} en arriendo · ${DATA.filter(p => p.isNewProject).length} proyectos nuevos`);
console.log(`  metro desconocido: ${DATA.filter(p => p.metroWalkMin === undefined).map(p => p.id).join(', ')}`);
console.log(`  características desconocidas: ${DATA.filter(p => !p.features).map(p => p.id).join(', ')}`);
check('UF única: todo priceUF = round(precio / 39.000)', UF_CLP === 39000 && DATA.every(p => p.priceUF === Math.round(p.price / 39000)));
check('Estacionamiento/bodega coherentes con la ficha', DATA.every(p => !p.features
  || (p.features.includes('estacionamiento') === ((p.parkingSpots ?? 0) > 0)
   && p.features.includes('bodega') === ((p.storageUnits ?? 0) > 0))));

// ── Reglas de combinación ──
console.log('\n── Reglas de combinación');
const nunoa = count({ comunas: ['Ñuñoa'] });
const provi = count({ comunas: ['Providencia'] });
check('Entre comunas aplica OR', count({ comunas: ['Ñuñoa', 'Providencia'] }) === nunoa + provi, `${nunoa} + ${provi}`);

const base = { operation: 'venta' as const, comunas: ['Ñuñoa', 'Providencia'] };
const steps: Partial<SearchCriteria>[] = [
  base,
  { ...base, propertyType: 'departamento' },
  { ...base, propertyType: 'departamento', bedrooms: 2 },
  { ...base, propertyType: 'departamento', bedrooms: 2, bathroomsMin: 2 },
  { ...base, propertyType: 'departamento', bedrooms: 2, bathroomsMin: 2, features: ['terraza'] },
];
const seq = steps.map(count);
check('Entre categorías aplica AND (cada filtro agregado nunca suma)', seq.every((n, i) => i === 0 || n <= seq[i - 1]), seq.join(' → '));

// Chequeo independiente: recuento manual sin pasar por matchesCriteria.
const both = DATA.filter(p => p.features?.includes('terraza') && p.features?.includes('mascotas')).length;
check('Características: deben cumplirse todas', count({ features: ['terraza', 'mascotas'] }) === both, `${both}`);
check('Características desconocidas no coinciden', filterProperties(DATA, C({ features: ['terraza'] })).every(p => !!p.features));
check('Metro desconocido no coincide', filterProperties(DATA, C({ metroMaxMin: 60 })).every(p => p.metroWalkMin !== undefined),
  `${count({ metroMaxMin: 60 })} de ${DATA.length}`);

const studios = filterProperties(DATA, C({ bedrooms: 0 }));
check('Studio = solo estudios declarados', studios.length > 0 && studios.every(p => p.isStudio === true), studios.map(p => p.id).join(', '));
check('Etiqueta: estudio, oficina y dato desconocido se distinguen',
  bedroomsText(DATA.find(p => p.id === '3')!) === 'Studio'
  && bedroomsText(DATA.find(p => p.type === 'oficina')!) === null
  && bedroomInfo({ ...DATA[0], bedrooms: 0, isStudio: undefined }).kind === 'unknown'
  && bedroomsText(DATA.find(p => p.id === '1')!) === '2');
check('Oficinas no cuentan como estudios', !studios.some(p => p.type === 'oficina'));
check('1+ excluye estudios', filterProperties(DATA, C({ bedrooms: 1 })).every(p => p.bedrooms >= 1));
check('2+ incluye 3 y más', filterProperties(DATA, C({ bedrooms: 2 })).some(p => p.bedrooms >= 3));
check('Nueva = proyecto nuevo', count({ status: ['nueva'] }) === DATA.filter(p => p.isNewProject).length);
check('Nueva + Usada = sin filtro', count({ status: ['nueva', 'usada'] }) === DATA.length);
check('Superficie 50–100 m²', count({ sqmMin: 50, sqmMax: 100 }) === DATA.filter(p => p.sqm >= 50 && p.sqm <= 100).length);
check('Baños 2+', count({ bathroomsMin: 2 }) === DATA.filter(p => p.bathrooms >= 2).length);
check('Tope de poder de compra solo en compra',
  count({ operation: 'arriendo', budgetCap: { valueUF: 1, kind: 'estimacion' } }) === count({ operation: 'arriendo' }));

// ── Estado compartido ──
console.log('\n── Estado compartido');
let s = initialSearchState();
s = searchReducer(s, { type: 'update', patch: { operation: 'venta', comunas: ['Ñuñoa'] }, origin: 'usuario' });
const userApplied = s.applied;
check('Edición directa: origen "usuario"', s.origins['comuna:Ñuñoa'] === 'usuario' && s.previous === null);

s = searchReducer(s, { type: 'draft/start', from: 'applied' });
s = searchReducer(s, { type: 'draft/update', patch: { comunas: ['Ñuñoa', 'Macul'], bedrooms: 2 } });
check('El borrador no cambia la búsqueda aplicada', s.applied === userApplied && s.draft?.comunas.length === 2);

s = searchReducer(s, { type: 'draft/apply' });
check('Aplicar el borrador: solo lo nuevo queda con origen "asistente"',
  s.origins['comuna:Macul'] === 'asistente' && s.origins.bedrooms === 'asistente' && s.origins['comuna:Ñuñoa'] === 'usuario');
check('Aplicar el borrador guarda la búsqueda anterior', s.previous?.criteria.comunas.join() === 'Ñuñoa');

s = searchReducer(s, { type: 'update', patch: { bedrooms: 3 }, origin: 'usuario' });
check('Cambiar a mano un criterio del asistente lo pasa a "usuario"', s.origins.bedrooms === 'usuario');

s = searchReducer(s, { type: 'restorePrevious' });
check('"Volver a la anterior" restaura criterios y orígenes', s.applied.comunas.join() === 'Ñuñoa' && s.applied.bedrooms === null
  && s.origins['comuna:Ñuñoa'] === 'usuario' && !('comuna:Macul' in s.origins) && s.previous === null);

s = searchReducer(s, { type: 'update', patch: { operation: 'venta', budgetCap: { valueUF: 3600, kind: 'estimacion' } }, origin: 'estimacion' });
s = searchReducer(s, { type: 'update', patch: { operation: 'arriendo' }, origin: 'usuario' });
check('Cambiar a arriendo quita el tope de compra', s.applied.budgetCap === null && !('budget' in s.origins));

s = searchReducer(s, { type: 'draft/start', from: 'operationAndType' });
check('Borrador desde el Home: solo operación y tipo', s.draft?.comunas.length === 0 && s.draft?.operation === 'arriendo');

// ── Conteos para revisar en la interfaz ──
console.log('\n── Conteos esperados en la interfaz (Lista, Mapa y Dividida deben mostrar el mismo número)');
const scenarios: [string, Partial<SearchCriteria>][] = [
  ['1. Home: Comprar · Departamento · Ñuñoa', { operation: 'venta', propertyType: 'departamento', comunas: ['Ñuñoa'] }],
  ['2. + agregar Providencia', { operation: 'venta', propertyType: 'departamento', comunas: ['Ñuñoa', 'Providencia'] }],
  ['3. + Dormitorios 2+', { operation: 'venta', propertyType: 'departamento', comunas: ['Ñuñoa', 'Providencia'], bedrooms: 2 }],
  ['4. + Baños 2+', { operation: 'venta', propertyType: 'departamento', comunas: ['Ñuñoa', 'Providencia'], bedrooms: 2, bathroomsMin: 2 }],
  ['5. Quitar Ñuñoa (queda Providencia)', { operation: 'venta', propertyType: 'departamento', comunas: ['Providencia'], bedrooms: 2, bathroomsMin: 2 }],
  ['6. Comprar · Todos los tipos · todas las comunas', { operation: 'venta' }],
  ['7. + Estado: Nueva', { operation: 'venta', status: ['nueva'] }],
  ['8. Arrendar · Todos los tipos · Studio', { operation: 'arriendo', bedrooms: 0 }],
  ['9. Arrendar · Todos los tipos · 1+', { operation: 'arriendo', bedrooms: 1 }],
  ['10. Comprar · Todos los tipos · Superficie 50 a 100 m²', { operation: 'venta', sqmMin: 50, sqmMax: 100 }],
  ['11. + Precio: Hasta UF 3.500', { operation: 'venta', sqmMin: 50, sqmMax: 100, priceMinUF: 0, priceMaxUF: 3500 }],
];
const w = Math.max(...scenarios.map(([n]) => n.length));
scenarios.forEach(([name, patch]) => console.log(`  ${name.padEnd(w)}  → ${count(patch)}`));

console.log(failures ? `\n✗ ${failures} verificación(es) fallaron` : '\n✓ Todas las verificaciones pasaron');
if (failures) process.exit(1);
