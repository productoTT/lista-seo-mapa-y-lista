// Estado de búsqueda compartido: búsqueda aplicada (única), origen de cada criterio,
// búsqueda anterior recuperable y borrador del asistente.
// Reducer puro: no depende de React y se verifica con scripts/verify-search.ts.

import type { CriterionKey, CriterionOrigin, SearchCriteria } from './criteria.ts';
import { DEFAULT_CRITERIA, criterionKeys, diffCriteria } from './criteria.ts';

export type CriterionOrigins = Partial<Record<CriterionKey, CriterionOrigin>>;

export interface AppliedSnapshot {
  criteria: SearchCriteria;
  origins: CriterionOrigins;
}

export interface SearchState {
  /** Única búsqueda que filtra resultados en Lista, Mapa y Dividida. */
  applied: SearchCriteria;
  origins: CriterionOrigins;
  /** Búsqueda reemplazada por la última propuesta aceptada ("Volver a la anterior"). */
  previous: AppliedSnapshot | null;
  /** Búsqueda en borrador del asistente. Nunca filtra resultados hasta que la persona la aplica. */
  draft: SearchCriteria | null;
}

export type SearchAction =
  /** Edición directa (buscador, filtros, quitar chip). No toca `previous`. */
  | { type: 'update'; patch: Partial<SearchCriteria>; origin: CriterionOrigin }
  /** Reemplazo completo por una propuesta aceptada o una búsqueda guardada. Guarda la búsqueda anterior. */
  | { type: 'replace'; criteria: SearchCriteria; origin: CriterionOrigin }
  | { type: 'restorePrevious' }
  | { type: 'reset'; base?: Partial<SearchCriteria> }
  /** Inicia el borrador: desde la búsqueda aplicada o solo con operación y tipo (entrada desde el Home). */
  | { type: 'draft/start'; from: 'applied' | 'operationAndType' }
  | { type: 'draft/update'; patch: Partial<SearchCriteria> }
  /** Reemplaza el borrador completo (propuesta del asistente). */
  | { type: 'draft/set'; criteria: SearchCriteria }
  | { type: 'draft/discard' }
  /** Aplica el borrador: equivale a `replace` con origen "asistente". */
  | { type: 'draft/apply' };

export function initialSearchState(base: Partial<SearchCriteria> = {}): SearchState {
  return { applied: { ...DEFAULT_CRITERIA, ...base }, origins: {}, previous: null, draft: null };
}

function cloneCriteria(c: SearchCriteria): SearchCriteria {
  return { ...c, comunas: [...c.comunas], features: [...c.features], status: [...c.status], budgetCap: c.budgetCap ? { ...c.budgetCap } : null };
}

/** Recalcula orígenes: lo agregado o cambiado toma `origin`; lo quitado se elimina; lo intacto conserva su origen. */
export function nextOrigins(prev: SearchCriteria, next: SearchCriteria, origins: CriterionOrigins, origin: CriterionOrigin): CriterionOrigins {
  const out: CriterionOrigins = { ...origins };
  diffCriteria(prev, next).forEach(ch => {
    if (ch.kind === 'remove') delete out[ch.key];
    else out[ch.key] = origin;
  });
  const live = new Set(criterionKeys(next));
  Object.keys(out).forEach(k => { if (!live.has(k)) delete out[k]; });
  return out;
}

export function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'update': {
      const next = { ...state.applied, ...action.patch };
      // Coherencia: el tope de poder de compra solo existe en compra.
      if (next.operation !== 'venta') next.budgetCap = null;
      const unchanged = (Object.keys(next) as (keyof SearchCriteria)[]).every(k => next[k] === state.applied[k]);
      if (unchanged) return state;
      // Campos que no son criterios (moneda, región) cambian sin alterar orígenes.
      return { ...state, applied: next, origins: nextOrigins(state.applied, next, state.origins, action.origin) };
    }
    case 'replace': {
      const next = cloneCriteria(action.criteria);
      if (next.operation !== 'venta') next.budgetCap = null;
      return {
        ...state,
        applied: next,
        origins: nextOrigins(state.applied, next, state.origins, action.origin),
        previous: { criteria: cloneCriteria(state.applied), origins: { ...state.origins } },
      };
    }
    case 'restorePrevious': {
      if (!state.previous) return state;
      return { ...state, applied: state.previous.criteria, origins: state.previous.origins, previous: null };
    }
    case 'reset':
      return { ...state, applied: { ...DEFAULT_CRITERIA, ...action.base }, origins: {}, previous: null };
    case 'draft/start': {
      const draft = action.from === 'applied'
        ? cloneCriteria(state.applied)
        : { ...DEFAULT_CRITERIA, operation: state.applied.operation, propertyType: state.applied.propertyType };
      return { ...state, draft };
    }
    case 'draft/update':
      if (!state.draft) return state;
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case 'draft/set':
      return { ...state, draft: cloneCriteria(action.criteria) };
    case 'draft/discard':
      return { ...state, draft: null };
    case 'draft/apply': {
      if (!state.draft) return state;
      const applied = searchReducer(state, { type: 'replace', criteria: state.draft, origin: 'asistente' });
      // El borrador sigue vivo, alineado con lo aplicado, para continuar la conversación desde ahí.
      return { ...applied, draft: cloneCriteria(applied.applied) };
    }
  }
}
