import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import type { Filters } from '../../types/property';
import { DEFAULT_FILTERS } from '../../types/property';

export const MOBILE_HEADER_HEIGHT = 56;

const INDIGO = '#3200C1';

interface MobileHeaderProps {
  filters: Filters;
  query: string;
  resultCount: number;
  onGoBack: () => void;
  onOpenFilters: () => void;
}

function filtersActive(f: Filters): boolean {
  return (
    f.bedrooms !== null ||
    !!f.propertyType ||
    !!f.zone ||
    f.priceMinUF !== DEFAULT_FILTERS.priceMinUF ||
    f.priceMaxUF !== DEFAULT_FILTERS.priceMaxUF
  );
}

function searchSummary(f: Filters, query: string): string {
  if (query) return query;
  const parts: string[] = [];
  if (f.propertyType) {
    const map: Record<string, string> = { departamento: 'Departamentos', casa: 'Casas', oficina: 'Oficinas' };
    parts.push(map[f.propertyType] || f.propertyType);
  } else {
    parts.push('Propiedades');
  }
  if (f.zone) parts.push(f.zone);
  if (f.operation) parts.push(f.operation === 'arriendo' ? 'en arriendo' : 'en venta');
  return parts.join(' · ');
}

export function MobileHeader({ filters, query, resultCount, onGoBack, onOpenFilters }: MobileHeaderProps) {
  const hasFilters = filtersActive(filters);
  const label = searchSummary(filters, query);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: MOBILE_HEADER_HEIGHT,
        background: '#fff',
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 12px',
        zIndex: 200,
        WebkitBackfaceVisibility: 'hidden',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <button
        onClick={onGoBack}
        aria-label="Volver"
        style={{
          width: 40, height: 40, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 10, border: '1px solid #E5E5E5',
          background: '#fff', cursor: 'pointer', color: '#343A40',
        }}
      >
        <ArrowLeft size={18} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 700, color: '#343A40',
          margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </p>
        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
          {resultCount.toLocaleString('es-CL')} propiedades
        </p>
      </div>

      <button
        onClick={onOpenFilters}
        aria-label="Abrir filtros"
        style={{
          position: 'relative',
          width: 40, height: 40, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 10,
          border: hasFilters ? `1.5px solid ${INDIGO}` : '1px solid #E5E5E5',
          background: hasFilters ? '#EAF2FC' : '#fff',
          cursor: 'pointer',
          color: hasFilters ? INDIGO : '#343A40',
        }}
      >
        <SlidersHorizontal size={18} />
        {hasFilters && (
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%',
            background: INDIGO, border: '1.5px solid #fff',
            pointerEvents: 'none',
          }} />
        )}
      </button>
    </div>
  );
}
