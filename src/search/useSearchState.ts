import { useCallback, useMemo, useReducer } from 'react';
import type { AdvancedFilters, Filters } from '../types/property';
import type { CriterionOrigin, SearchCriteria } from './criteria';
import { initialSearchState, searchReducer } from './searchState';

/** Hook de la búsqueda compartida. Expone adaptadores para los componentes que reciben Filters/AdvancedFilters por separado. */
export function useSearchState() {
  const [state, dispatch] = useReducer(searchReducer, undefined, () => initialSearchState());

  const update = useCallback(
    (patch: Partial<SearchCriteria>, origin: CriterionOrigin = 'usuario') => dispatch({ type: 'update', patch, origin }),
    [],
  );
  const replace = useCallback(
    (criteria: SearchCriteria, origin: CriterionOrigin) => dispatch({ type: 'replace', criteria, origin }),
    [],
  );

  return useMemo(() => ({
    state,
    criteria: state.applied,
    origins: state.origins,
    canRestorePrevious: state.previous !== null,
    update,
    updateFilters: (patch: Partial<Filters>) => update(patch, 'usuario'),
    updateAdvanced: (patch: Partial<AdvancedFilters>) => update(patch, 'usuario'),
    replace,
    restorePrevious: () => dispatch({ type: 'restorePrevious' }),
    reset: (base?: Partial<SearchCriteria>) => dispatch({ type: 'reset', base }),
    draft: state.draft,
    startDraft: (from: 'applied' | 'operationAndType') => dispatch({ type: 'draft/start', from }),
    updateDraft: (patch: Partial<SearchCriteria>) => dispatch({ type: 'draft/update', patch }),
    discardDraft: () => dispatch({ type: 'draft/discard' }),
    applyDraft: () => dispatch({ type: 'draft/apply' }),
  }), [state, update, replace]);
}

export type SearchStore = ReturnType<typeof useSearchState>;
