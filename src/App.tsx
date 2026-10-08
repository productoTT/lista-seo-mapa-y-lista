import { useState, useCallback, useMemo } from 'react';
import type { Screen, ViewMode, SearchInterpretation, Filters, SortOption } from './types/property';
import { mockProperties } from './data/mockProperties';
import { filterProperties } from './search/criteria';
import { useSearchState } from './search/useSearchState';
import { HomeScreen } from './components/screens/HomeScreen';
import { ResultsScreen } from './components/results/ResultsScreen';
import { PropertyFullScreen } from './components/screens/PropertyFullScreen';
import { Snackbar } from './components/ui/Snackbar';

const ZONES = ['ñuñoa', 'providencia', 'las condes', 'vitacura', 'santiago centro', 'santiago', 'miraflores', 'la florida', 'peñalolén', 'la reina'];
const ZONE_DISPLAY: Record<string, string> = {
  'ñuñoa': 'Ñuñoa', 'providencia': 'Providencia', 'las condes': 'Las Condes',
  'vitacura': 'Vitacura', 'santiago': 'Santiago Centro', 'miraflores': 'Miraflores',
  'la florida': 'La Florida', 'peñalolén': 'Peñalolén', 'la reina': 'La Reina',
  'santiago centro': 'Santiago Centro',
};

function parseQuery(q: string): SearchInterpretation {
  const lower = q.toLowerCase();
  const interp: SearchInterpretation = { query: q };

  if (lower.includes('arriend') || lower.includes('alquil')) {
    interp.operation = 'Arriendo';
  } else {
    interp.operation = 'Comprar';
  }

  if (lower.includes('depto') || lower.includes('departamento') || lower.includes('dpto')) {
    interp.propertyType = 'Departamento';
  } else if (lower.includes('casa')) {
    interp.propertyType = 'Casa';
  } else if (lower.includes('oficina')) {
    interp.propertyType = 'Oficina';
  }

  for (const z of ZONES) {
    if (lower.includes(z)) { interp.zone = ZONE_DISPLAY[z] || z; break; }
  }

  const bedMatch = lower.match(/(\d)\s*dorm/);
  if (bedMatch) interp.bedrooms = `${bedMatch[1]} dormitorios`;

  const ufMatch = lower.match(/(\d[\d.]*)\s*uf/i);
  if (ufMatch) {
    const raw = ufMatch[1].replace(/\./g, '');
    interp.maxPrice = `Hasta UF ${parseInt(raw).toLocaleString('es-CL')}`;
  }

  return interp;
}

function applyInterpretation(interp: SearchInterpretation): Partial<Filters> {
  const f: Partial<Filters> = {};
  f.operation = interp.operation === 'Arriendo' ? 'arriendo' : 'venta';
  if (interp.propertyType === 'Departamento') f.propertyType = 'departamento';
  else if (interp.propertyType === 'Casa') f.propertyType = 'casa';
  else if (interp.propertyType === 'Oficina') f.propertyType = 'oficina';
  if (interp.zone) f.comunas = [interp.zone];
  // "2 dormitorios" se interpreta como 2 o más (mismo criterio que los filtros).
  if (interp.bedrooms) { const m = interp.bedrooms.match(/(\d)/); if (m) f.bedrooms = parseInt(m[1]); }
  if (interp.maxPrice) { const m = interp.maxPrice.replace(/\./g, '').match(/(\d+)/); if (m) f.priceMaxUF = parseInt(m[1]); }
  return f;
}

function sortProps(props: typeof mockProperties, s: SortOption) {
  const arr = [...props];
  switch (s) {
    case 'price_asc': return arr.sort((a, b) => a.priceUF - b.priceUF);
    case 'price_desc': return arr.sort((a, b) => b.priceUF - a.priceUF);
    case 'newest': return arr.sort((a, b) => b.listedAt - a.listedAt);
    case 'sqm_desc': return arr.sort((a, b) => b.sqm - a.sqm);
    default: return arr.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('lista');
  const [query, setQuery] = useState('');
  const [interpretation, setInterpretation] = useState<SearchInterpretation | null>(null);
  const search = useSearchState();
  const { criteria, update: updateCriteria, reset: resetCriteria } = search;
  const [sort, setSort] = useState<SortOption>('relevant');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [savedSearch, setSavedSearch] = useState(false);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showSnack = useCallback((msg: string) => {
    setSnackbar({ visible: true, message: msg });
  }, []);

  const startSearch = useCallback((q: string) => {
    const interp = parseQuery(q);
    setQuery(q);
    setInterpretation(interp);
    // Flujo IA heredado (se reemplaza en el bloque del asistente): aplica directo, con origen "asistente".
    updateCriteria(applyInterpretation(interp), 'asistente');
    setScreen('results');
  }, [updateCriteria]);

  const startClassicSearch = useCallback((partial: Partial<Filters>) => {
    updateCriteria(partial, 'usuario');
    setInterpretation(null);
    setQuery('');
    setScreen('results');
  }, [updateCriteria]);

  const filteredProperties = useMemo(
    () => sortProps(filterProperties(mockProperties, criteria), sort),
    [criteria, sort],
  );

  const selectedProperty = selectedPropertyId ? mockProperties.find(p => p.id === selectedPropertyId) ?? null : null;

  if (screen === 'home') return (
    <>
      <HomeScreen onSearch={startSearch} onClassicSearch={startClassicSearch} />
      <Snackbar message={snackbar.message} visible={snackbar.visible} onHide={() => setSnackbar(s => ({ ...s, visible: false }))} />
    </>
  );

  if (screen === 'property-full' && selectedProperty) return (
    <>
      <PropertyFullScreen
        property={selectedProperty}
        savedProperties={savedProperties}
        onBack={() => setScreen('results')}
        onContact={() => showSnack('Mensaje enviado. El anunciante te contactará pronto.')}
        onSave={id => {
          setSavedProperties(prev => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); showSnack('Propiedad eliminada de guardados.'); }
            else { next.add(id); showSnack('Propiedad guardada.'); }
            return next;
          });
        }}
        onSelectSimilar={id => { setSelectedPropertyId(id); }}
      />
      <Snackbar message={snackbar.message} visible={snackbar.visible} onHide={() => setSnackbar(s => ({ ...s, visible: false }))} />
    </>
  );

  return (
    <>
      <ResultsScreen
        properties={filteredProperties}
        viewMode={viewMode}
        onViewChange={setViewMode}
        filters={criteria}
        onFiltersChange={search.updateFilters}
        interpretation={interpretation}
        query={query}
        savedSearch={savedSearch}
        onSaveSearch={() => {
          setSavedSearch(s => {
            const next = !s;
            showSnack(next ? 'Búsqueda guardada. Te avisaremos de propiedades similares.' : 'Búsqueda eliminada.');
            return next;
          });
        }}
        savedProperties={savedProperties}
        onSaveProperty={id => {
          setSavedProperties(prev => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); showSnack('Propiedad eliminada de guardados.'); }
            else { next.add(id); showSnack('Propiedad guardada.'); }
            return next;
          });
        }}
        advancedFilters={criteria}
        onAdvancedFiltersChange={search.updateAdvanced}
        onGoHome={() => { setScreen('home'); resetCriteria(); setViewMode('lista'); }}
        onSearch={startSearch}
        onViewFullProperty={id => { setSelectedPropertyId(id); setScreen('property-full'); }}
        onContact={() => showSnack('Mensaje enviado. El anunciante te contactará pronto.')}
        sort={sort}
        onSortChange={setSort}
      />
      <Snackbar message={snackbar.message} visible={snackbar.visible} onHide={() => setSnackbar(s => ({ ...s, visible: false }))} />
    </>
  );
}
