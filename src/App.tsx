import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Screen, ViewMode, SortOption } from './types/property';
import { mockProperties } from './data/mockProperties';
import type { SearchCriteria } from './search/criteria';
import { DEFAULT_CRITERIA, criteriaIdentity, criterionLabel, diffCriteria, filterProperties, removalPatch } from './search/criteria';
import { useSearchState } from './search/useSearchState';
import type { AssistantEntry, AssistantView } from './assistant/handoff';
import { comunaPrefill } from './assistant/handoff';
import { useAssistant } from './assistant/useAssistant';
import { AssistantPanel } from './components/assistant/AssistantPanel';
import { AssistantPill } from './components/assistant/AssistantPill';
import { ActionToast, type ToastData } from './components/assistant/ActionToast';
import { HomeScreen } from './components/screens/HomeScreen';
import { ResultsScreen } from './components/results/ResultsScreen';
import { PropertyFullScreen } from './components/screens/PropertyFullScreen';
import { Snackbar } from './components/ui/Snackbar';
import { useIsMobile } from './hooks/useIsMobile';

const MAX_RECENTS = 5;

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

/**
 * Dónde está integrado el panel del asistente (bloque 3): Home (desktop y mobile), Lista desktop y ficha desktop.
 * Pendiente: Mapa, Dividida y resultados mobile (D4/D5). Ahí los accesos avisan y el panel se minimiza.
 */
function assistantAvailableIn(screen: Screen, viewMode: ViewMode, isMobile: boolean): boolean {
  if (screen === 'home') return true;
  if (isMobile) return false;
  if (screen === 'results') return viewMode === 'lista';
  return screen === 'property-full';
}

const toView = (s: Screen): AssistantView => (s === 'home' ? 'inicio' : s === 'results' ? 'resultados' : 'ficha');

/** "agrega 2+ dorm.; quita Ñuñoa; cambia Comprar → Arrendar" */
function describeChanges(prev: SearchCriteria, next: SearchCriteria): string {
  return diffCriteria(prev, next).map(c =>
    c.kind === 'add' ? `agrega ${criterionLabel(next, c.key)}`
      : c.kind === 'remove' ? `quita ${criterionLabel(prev, c.key)}`
      : `cambia ${criterionLabel(prev, c.key)} → ${criterionLabel(next, c.key)}`,
  ).join('; ');
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('lista');
  const isMobile = useIsMobile();
  // Valores iniciales del buscador del Home: Comprar · Departamento.
  const search = useSearchState({ operation: 'venta', propertyType: 'departamento' });
  const { criteria } = search;
  // Búsquedas efectivamente ejecutadas (la más reciente primero). Solo en memoria.
  const [recents, setRecents] = useState<SearchCriteria[]>([]);
  const [sort, setSort] = useState<SortOption>('relevant');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [savedSearch, setSavedSearch] = useState(false);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [toast, setToast] = useState<ToastData | null>(null);
  const pillRef = useRef<HTMLButtonElement>(null);

  const showSnack = useCallback((msg: string) => setSnackbar({ visible: true, message: msg }), []);
  const showToast = useCallback((message: string, action?: ToastData['action']) => setToast({ id: Date.now(), message, action }), []);
  const hideToast = useCallback(() => setToast(null), []);

  const view = toView(screen);
  const available = assistantAvailableIn(screen, viewMode, isMobile);
  const assistant = useAssistant({
    data: mockProperties, view, applied: criteria, draft: search.draft,
    setDraft: search.setDraft, discardDraft: search.discardDraft,
  });

  // Al minimizar, el foco vuelve al ícono flotante (spec §21: retorno del foco).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !assistant.open) pillRef.current?.focus();
    wasOpen.current = assistant.open;
  }, [assistant.open]);

  const recordRecent = useCallback((c: SearchCriteria) => {
    const id = criteriaIdentity(c);
    setRecents(prev => [c, ...prev.filter(r => criteriaIdentity(r) !== id)].slice(0, MAX_RECENTS));
  }, []);

  // ── Navegación: deja nota en el hilo y minimiza si el destino no tiene el panel integrado ──

  const navigate = useCallback((next: Screen, opts: { viewMode?: ViewMode; propertyTitle?: string } = {}) => {
    const vm = opts.viewMode ?? viewMode;
    if (opts.viewMode) setViewMode(opts.viewMode);
    setScreen(next);
    if (next !== screen || next === 'property-full') {
      const where = next === 'home' ? 'el inicio' : next === 'results' ? 'tus resultados' : `la ficha de ${opts.propertyTitle ?? 'la propiedad'}`;
      assistant.addNote(`Ahora estás en ${where}.`);
    }
    if (assistant.open && !assistantAvailableIn(next, vm, isMobile)) {
      assistant.minimize();
      assistant.addNote('El asistente se minimizó: todavía no está integrado en esta vista.');
    }
  }, [assistant, screen, viewMode, isMobile]);

  const changeViewMode = useCallback((v: ViewMode) => {
    setViewMode(v);
    if (assistant.open && !assistantAvailableIn(screen, v, isMobile)) {
      assistant.minimize();
      showToast('El asistente se minimizó: en Mapa y Dividida todavía no está integrado. Tu conversación se conserva.');
    }
  }, [assistant, screen, isMobile, showToast]);

  // ── Ediciones directas de la búsqueda (anotadas en el hilo si hay conversación) ──

  const noteManualChange = useCallback((prev: SearchCriteria, next: SearchCriteria) => {
    const changes = describeChanges(prev, next);
    if (changes && assistant.hasConversation) {
      assistant.addNote(`Cambiaste tus filtros: ${changes}. Sigo a partir de ahí.`);
      search.setDraft(next);
    }
  }, [assistant, search]);

  const editCriteria = useCallback((patch: Partial<SearchCriteria>) => {
    search.update(patch, 'usuario');
    noteManualChange(criteria, { ...criteria, ...patch });
  }, [criteria, search, noteManualChange]);

  const replaceAllCriteria = useCallback((next: SearchCriteria) => {
    search.reset(next);
    noteManualChange(criteria, next);
  }, [criteria, search, noteManualChange]);

  /** Ejecuta la búsqueda aplicada (con un cambio opcional) y abre resultados. */
  const runSearch = useCallback((patch: Partial<SearchCriteria> = {}) => {
    editCriteria(patch);
    recordRecent({ ...criteria, ...patch });
    navigate('results');
  }, [criteria, editCriteria, recordRecent, navigate]);

  /** Reemplaza la búsqueda completa (recientes y búsquedas frecuentes) y la ejecuta. */
  const runFullSearch = useCallback((c: SearchCriteria) => {
    replaceAllCriteria(c);
    recordRecent(c);
    navigate('results');
  }, [replaceAllCriteria, recordRecent, navigate]);

  // ── Asistente: uno solo para todos los accesos ──

  const unavailableMessage = isMobile
    ? 'El asistente todavía no está integrado en los resultados mobile de este prototipo. Puedes usarlo desde el inicio.'
    : 'El asistente está disponible en el inicio y en la vista Lista. En Mapa y Dividida se integrará más adelante.';

  const openAssistant = useCallback((o: { firstMessage?: string; prefill?: string } = {}) => {
    if (!available) { showToast(unavailableMessage); return; }
    assistant.openPanel(o);
  }, [available, assistant, showToast, unavailableMessage]);

  const openFromHome = useCallback((o: { firstMessage?: string; comuna?: string; entry: AssistantEntry }) => {
    openAssistant({ firstMessage: o.firstMessage, prefill: o.comuna ? comunaPrefill(o.comuna) : undefined });
  }, [openAssistant]);

  /** "Ver N resultados": única forma en que una propuesta del asistente llega a la búsqueda aplicada. */
  const applyFromAssistant = useCallback((c: SearchCriteria) => {
    search.replace(c, 'asistente');
    search.setDraft(c);
    recordRecent(c);
    if (screen !== 'results' || viewMode !== 'lista') navigate('results', { viewMode: 'lista' });
    showToast('Abriste la búsqueda del asistente en la lista.', {
      label: 'Volver a la anterior',
      onClick: () => {
        search.restorePrevious();
        assistant.addNote('Volviste a tu búsqueda anterior.');
      },
    });
  }, [search, recordRecent, screen, viewMode, navigate, showToast, assistant]);

  const clearApplied = useCallback(() => {
    replaceAllCriteria({ ...DEFAULT_CRITERIA, operation: criteria.operation, propertyType: criteria.propertyType });
  }, [criteria.operation, criteria.propertyType, replaceAllCriteria]);

  const viewProperty = useCallback((id: string) => {
    setSelectedPropertyId(id);
    navigate('property-full', { propertyTitle: mockProperties.find(p => p.id === id)?.title });
  }, [navigate]);

  // ── Datos derivados ──

  const filteredProperties = useMemo(
    () => sortProps(filterProperties(mockProperties, criteria), sort),
    [criteria, sort],
  );
  const selectedProperty = selectedPropertyId ? mockProperties.find(p => p.id === selectedPropertyId) ?? null : null;

  const toggleSaved = (id: string) => {
    setSavedProperties(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showSnack('Propiedad eliminada de guardados.'); }
      else { next.add(id); showSnack('Propiedad guardada.'); }
      return next;
    });
  };

  const assistantStatus = { available, open: assistant.open, active: assistant.hasConversation, onOpen: () => openAssistant() };

  let content;
  if (screen === 'home') {
    content = (
      <HomeScreen
        criteria={criteria}
        resultCount={filteredProperties.length}
        recents={recents}
        onUpdate={editCriteria}
        onSearch={runSearch}
        onRunRecent={runFullSearch}
        onRunSearch={runFullSearch}
        onClear={clearApplied}
        onOpenAssistant={openFromHome}
        onOpenHeaderAssistant={() => openAssistant()}
      />
    );
  } else if (screen === 'property-full' && selectedProperty) {
    content = (
      <PropertyFullScreen
        property={selectedProperty}
        savedProperties={savedProperties}
        onBack={() => navigate('results')}
        onContact={() => showSnack('Mensaje enviado. El anunciante te contactará pronto.')}
        onSave={toggleSaved}
        onSelectSimilar={id => { setSelectedPropertyId(id); }}
      />
    );
  } else {
    content = (
      <ResultsScreen
        properties={filteredProperties}
        viewMode={viewMode}
        onViewChange={changeViewMode}
        filters={criteria}
        onFiltersChange={editCriteria}
        savedSearch={savedSearch}
        onSaveSearch={() => {
          setSavedSearch(s => {
            const next = !s;
            showSnack(next ? 'Búsqueda guardada. Te avisaremos de propiedades similares.' : 'Búsqueda eliminada.');
            return next;
          });
        }}
        savedProperties={savedProperties}
        onSaveProperty={toggleSaved}
        advancedFilters={criteria}
        onAdvancedFiltersChange={editCriteria}
        // Volver al inicio conserva la búsqueda (una sola búsqueda en todo el sitio) y la registra como reciente.
        onGoHome={() => { recordRecent(criteria); navigate('home', { viewMode: 'lista' }); }}
        onViewFullProperty={viewProperty}
        onContact={() => showSnack('Mensaje enviado. El anunciante te contactará pronto.')}
        sort={sort}
        onSortChange={setSort}
        assistant={assistantStatus}
      />
    );
  }

  return (
    <>
      {content}
      {assistant.open && available && (
        <AssistantPanel
          assistant={assistant}
          view={view}
          applied={criteria}
          draft={search.draft}
          data={mockProperties}
          onApply={applyFromAssistant}
          // Quitar un chip desde el panel es una edición directa de la persona.
          onRemoveFilter={key => editCriteria(removalPatch(criteria, key))}
          onClearApplied={clearApplied}
          onViewProperty={viewProperty}
        />
      )}
      {!assistant.open && available && (
        <AssistantPill ref={pillRef} active={assistant.hasConversation} bottom={screen === 'results' ? 88 : 20} onOpen={() => openAssistant()} />
      )}
      <ActionToast toast={toast} onDone={hideToast} />
      <Snackbar message={snackbar.message} visible={snackbar.visible} onHide={() => setSnackbar(s => ({ ...s, visible: false }))} />
    </>
  );
}
