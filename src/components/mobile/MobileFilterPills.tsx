import { X } from 'lucide-react';
import type { Filters, AdvancedFilters } from '../../types/property';
import { activeCriteria, removalPatch, splitPatch } from '../../search/criteria';

// Tokens del sistema de diseño (mismo valor que los colores anteriores)
const INDIGO = 'var(--tt-indigo)';
const INDIGO_50 = 'var(--tt-indigo-50)';

interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

// Mismas etiquetas y criterios que la cabecera de escritorio (search/criteria). La operación se muestra en el buscador.
function buildActiveFilters(
  filters: Filters,
  advancedFilters: AdvancedFilters,
  onFiltersChange: (f: Partial<Filters>) => void,
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void,
): ActiveFilter[] {
  const criteria = { ...filters, ...advancedFilters };
  return activeCriteria(criteria, { exclude: ['operation'] }).map(c => ({
    key: c.key,
    label: c.label,
    onRemove: () => {
      const { filters: f, advanced: a } = splitPatch(removalPatch(criteria, c.key));
      if (Object.keys(f).length) onFiltersChange(f);
      if (Object.keys(a).length) onAdvancedFiltersChange(a);
    },
  }));
}

interface MobileFilterPillsProps {
  filters: Filters;
  advancedFilters: AdvancedFilters;
  onFiltersChange: (f: Partial<Filters>) => void;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
}

export function MobileFilterPills({ filters, advancedFilters, onFiltersChange, onAdvancedFiltersChange }: MobileFilterPillsProps) {
  const pills = buildActiveFilters(filters, advancedFilters, onFiltersChange, onAdvancedFiltersChange);

  if (pills.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 4,
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        // Fade right edge to hint continuation
        WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)',
        maskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)',
      }}
      className="hide-scrollbar"
      role="list"
      aria-label="Filtros activos"
    >
      {pills.map((pill) => (
        <div
          key={pill.key}
          role="listitem"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
            background: INDIGO_50,
            color: INDIGO,
            borderRadius: 20,
            padding: '5px 10px 5px 12px',
            fontSize: 12,
            fontWeight: 700,
            border: `1px solid rgba(50,0,193,0.2)`,
            minHeight: 32,
          }}
        >
          <span>{pill.label}</span>
          <button
            type="button"
            onClick={pill.onRemove}
            aria-label={`Quitar filtro ${pill.label}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: INDIGO,
              minWidth: 20,
              minHeight: 20,
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {/* Right padding sentinel so last pill isn't clipped by mask */}
      <div style={{ flexShrink: 0, width: 24 }} />
    </div>
  );
}
