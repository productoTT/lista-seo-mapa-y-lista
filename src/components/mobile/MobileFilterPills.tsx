import { X } from 'lucide-react';
import type { Filters, AdvancedFilters } from '../../types/property';
import { DEFAULT_FILTERS, PROPERTY_TYPE_LABELS } from '../../types/property';

const INDIGO = '#3200C1';
const INDIGO_50 = '#EAF2FC';

interface ActiveFilter {
  label: string;
  onRemove: () => void;
}

function buildActiveFilters(
  filters: Filters,
  advancedFilters: AdvancedFilters,
  onFiltersChange: (f: Partial<Filters>) => void,
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void,
): ActiveFilter[] {
  const pills: ActiveFilter[] = [];

  if (filters.propertyType) {
    const map: Record<string, string> = { departamento: 'Departamentos', casa: 'Casas', oficina: 'Oficinas' };
    pills.push({
      label: map[filters.propertyType] || PROPERTY_TYPE_LABELS[filters.propertyType],
      onRemove: () => onFiltersChange({ propertyType: null }),
    });
  }

  if (filters.zone) {
    pills.push({
      label: filters.zone,
      onRemove: () => onFiltersChange({ zone: '' }),
    });
  }

  if (filters.bedrooms !== null) {
    pills.push({
      label: filters.bedrooms === 0 ? 'Estudio' : `${filters.bedrooms}+ dorm.`,
      onRemove: () => onFiltersChange({ bedrooms: null }),
    });
  }

  if (filters.priceMinUF > DEFAULT_FILTERS.priceMinUF || filters.priceMaxUF < DEFAULT_FILTERS.priceMaxUF) {
    const min = filters.priceMinUF > 0 ? `UF ${filters.priceMinUF.toLocaleString('es-CL')}` : '';
    const max = filters.priceMaxUF < DEFAULT_FILTERS.priceMaxUF ? `UF ${filters.priceMaxUF.toLocaleString('es-CL')}` : '';
    const label = min && max ? `${min} – ${max}` : min ? `Desde ${min}` : `Hasta ${max}`;
    pills.push({
      label,
      onRemove: () => onFiltersChange({ priceMinUF: DEFAULT_FILTERS.priceMinUF, priceMaxUF: DEFAULT_FILTERS.priceMaxUF }),
    });
  }

  advancedFilters.status.forEach(s => {
    pills.push({
      label: s === 'nueva' ? 'Nueva' : 'Usada',
      onRemove: () => onAdvancedFiltersChange({ status: advancedFilters.status.filter(x => x !== s) }),
    });
  });

  if (advancedFilters.sqmMin !== null || advancedFilters.sqmMax !== null) {
    const min = advancedFilters.sqmMin ? `${advancedFilters.sqmMin}m²` : '';
    const max = advancedFilters.sqmMax ? `${advancedFilters.sqmMax}m²` : '';
    const label = min && max ? `${min}–${max}` : min ? `Desde ${min}` : `Hasta ${max}`;
    pills.push({
      label,
      onRemove: () => onAdvancedFiltersChange({ sqmMin: null, sqmMax: null }),
    });
  }

  return pills;
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
          key={pill.label}
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
