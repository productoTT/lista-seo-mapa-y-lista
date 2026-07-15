import { ArrowLeft, Filter, Search, Sparkles } from 'lucide-react';
import type { Filters } from '../../types/property';
import { DEFAULT_FILTERS } from '../../types/property';

export const MOBILE_HEADER_HEIGHT = 56;

const INDIGO = '#3200C1';

function filtersActive(f: Filters): boolean {
  return (
    f.bedrooms !== null ||
    !!f.propertyType ||
    !!f.zone ||
    f.priceMinUF !== DEFAULT_FILTERS.priceMinUF ||
    f.priceMaxUF !== DEFAULT_FILTERS.priceMaxUF
  );
}

function searchLabel(f: Filters, query: string): string {
  if (query) return query;
  const parts: string[] = [];
  if (f.propertyType) {
    const map: Record<string, string> = { departamento: 'Departamentos', casa: 'Casas', oficina: 'Oficinas' };
    parts.push(map[f.propertyType] || f.propertyType);
  }
  if (f.zone) parts.push(f.zone);
  if (f.operation) parts.push(f.operation === 'arriendo' ? 'en arriendo' : 'en venta');
  return parts.join(' · ');
}

interface MobileHeaderProps {
  filters: Filters;
  query: string;
  resultCount: number;
  onGoBack: () => void;
  onOpenFilters: () => void;
  onOpenSearch: () => void;
}

export function MobileHeader({ filters, query, resultCount: _resultCount, onGoBack, onOpenFilters, onOpenSearch }: MobileHeaderProps) {
  const hasFilters = filtersActive(filters);
  const label = searchLabel(filters, query);
  const isAI = !!query;

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
        gap: 8,
        padding: '0 10px',
        zIndex: 200,
        WebkitBackfaceVisibility: 'hidden',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Back button */}
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

      {/* Compact search bar — tappable, not editable */}
      <button
        onClick={onOpenSearch}
        aria-label="Abrir buscador"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height: 38,
          padding: '0 12px',
          borderRadius: 10,
          border: '1.5px solid #E5E5E5',
          background: '#F9F9F9',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'Nunito, sans-serif',
          overflow: 'hidden',
        }}
      >
        {isAI
          ? <Sparkles size={14} style={{ color: INDIGO, flexShrink: 0 }} />
          : <Search size={14} style={{ color: '#999', flexShrink: 0 }} />
        }
        <span style={{
          fontSize: 13,
          fontWeight: label ? 600 : 400,
          color: label ? '#343A40' : '#999',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
        }}>
          {label || 'Ej: "Depto cerca de metro…"'}
        </span>
        <div style={{
          flexShrink: 0,
          width: 26, height: 26,
          borderRadius: 7,
          background: INDIGO,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Search size={13} style={{ color: '#fff' }} />
        </div>
      </button>

      {/* Filters button */}
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
        <Filter size={18} />
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
