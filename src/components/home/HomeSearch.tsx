import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import type { OperationType, PropertyType } from '../../types/property';
import type { SearchCriteria } from '../../search/criteria';
import { activeCriteria, canonicalComuna, removalPatch } from '../../search/criteria';
import { LocationCombobox } from './LocationCombobox';
import './home.css';

const OPERATIONS: { value: OperationType; label: string }[] = [
  { value: 'venta', label: 'Comprar' },
  { value: 'arriendo', label: 'Arrendar' },
];

const TYPES: { value: PropertyType | ''; label: string }[] = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'oficina', label: 'Oficina' },
  { value: '', label: 'Todos los tipos' },
];

export interface HomeSearchProps {
  /** Búsqueda aplicada (única). Operación y tipo se editan aquí mismo. */
  criteria: SearchCriteria;
  /** Propiedades que coinciden con la búsqueda aplicada (para "Ver N propiedades"). */
  resultCount: number;
  recents: SearchCriteria[];
  comunas: string[];
  popular: string[];
  onUpdate: (patch: Partial<SearchCriteria>) => void;
  /** Ejecuta la búsqueda aplicada y abre resultados. `patch` se aplica antes. */
  onSearch: (patch?: Partial<SearchCriteria>) => void;
  onRunRecent: (criteria: SearchCriteria) => void;
  onClear: () => void;
  onOpenAssistant: (opts: { firstMessage?: string; comuna?: string; entry: 'combobox' | 'enlace-home' | 'buscar-texto-libre' }) => void;
}

/**
 * Buscador del Home (spec §5). La ruta principal es Comprar/Arrendar, tipo, ubicación y Buscar,
 * sin cuenta ni datos financieros. El asistente es una entrada progresiva: desde el combobox,
 * desde el enlace inferior o al buscar con una descripción que no es una comuna.
 */
export function HomeSearch({
  criteria, resultCount, recents, comunas, popular,
  onUpdate, onSearch, onRunRecent, onClear, onOpenAssistant,
}: HomeSearchProps) {
  const [text, setText] = useState('');

  const exactComuna = (t: string) => {
    const c = canonicalComuna(t, comunas);
    return comunas.includes(c) ? c : undefined;
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) { onSearch(); return; }
    const comuna = exactComuna(t);
    if (comuna) { setText(''); onSearch({ comunas: [comuna] }); return; }
    // Una descripción no se interpreta como filtros: se traspasa al asistente.
    setText('');
    onOpenAssistant({ firstMessage: t, entry: 'buscar-texto-libre' });
  }

  function openAssistantFromLink() {
    const t = text.trim();
    const comuna = t ? exactComuna(t) : undefined;
    setText('');
    onOpenAssistant(comuna ? { comuna, entry: 'enlace-home' } : { firstMessage: t || undefined, entry: 'enlace-home' });
  }

  // Pestañas de operación como radiogroup: flechas izquierda/derecha cambian la selección.
  function onTabsKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = OPERATIONS.findIndex(o => o.value === criteria.operation);
    const next = OPERATIONS[(i + (e.key === 'ArrowRight' ? 1 : OPERATIONS.length - 1)) % OPERATIONS.length];
    onUpdate({ operation: next.value });
    (e.currentTarget.querySelector(`[data-op="${next.value}"]`) as HTMLButtonElement | null)?.focus();
  }

  // "Tu búsqueda ya tiene": criterios más allá de operación y tipo (spec §5).
  const extra = activeCriteria(criteria, { exclude: ['operation', 'propertyType'] });

  return (
    <div className="hs">
      <div className="hs-tabs" role="radiogroup" aria-label="Operación" onKeyDown={onTabsKey}>
        {OPERATIONS.map(o => {
          const on = criteria.operation === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on || (!criteria.operation && o.value === 'venta') ? 0 : -1}
              data-op={o.value}
              className="hs-tab"
              onClick={() => onUpdate({ operation: o.value })}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <form className="hs-card" role="search" aria-label="Buscar propiedades" onSubmit={submit}>
        <div className="hs-field hs-field-type">
          <label htmlFor="hs-type" className="hs-label">Tipo de propiedad</label>
          <select
            id="hs-type"
            className="hs-select"
            value={criteria.propertyType ?? ''}
            onChange={e => onUpdate({ propertyType: (e.target.value || null) as PropertyType | null })}
          >
            {TYPES.map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <LocationCombobox
          value={text}
          onChange={setText}
          recents={recents}
          comunas={comunas}
          popular={popular}
          onPickComuna={setText}
          onPickRecent={c => { setText(''); onRunRecent(c); }}
          onPickAssistant={o => { setText(''); onOpenAssistant({ ...o, entry: 'combobox' }); }}
        />

        <button type="submit" className="hs-submit">
          <Search size={16} aria-hidden="true" />
          Buscar
        </button>
      </form>

      <div className="hs-below">
        <span>
          ¿Tienes algo más específico en mente?{' '}
          <button type="button" className="hs-linkbtn" onClick={openAssistantFromLink}>Cuéntaselo al asistente</button>
        </span>
      </div>

      {extra.length > 0 && (
        <div className="hs-crit" role="region" aria-label="Criterios de tu búsqueda">
          <span className="hs-crit-lead">Tu búsqueda ya tiene:</span>
          <ul className="hs-chips">
            {extra.map(c => (
              <li key={c.key} className="hs-chip">
                {c.label}
                <button type="button" aria-label={`Quitar ${c.label}`} onClick={() => onUpdate(removalPatch(criteria, c.key))}>
                  <X size={12} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="hs-crit-actions" aria-live="polite">
            <button type="button" className="hs-btn hs-btn-primary" onClick={() => onSearch()}>
              {resultCount === 0 ? 'Ver resultados' : resultCount === 1 ? 'Ver 1 propiedad' : `Ver ${resultCount} propiedades`}
            </button>
            <button type="button" className="hs-btn hs-btn-ghost" onClick={onClear}>Limpiar</button>
          </div>
        </div>
      )}

      <p className="hs-note">La búsqueda directa no requiere cuenta ni datos financieros.</p>
    </div>
  );
}
