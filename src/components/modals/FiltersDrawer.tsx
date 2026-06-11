import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Filters, AdvancedFilters } from '../../types/property';
import { AdvancedFiltersContent } from './AdvancedFiltersContent';

const INDIGO = '#3200C1';
const FG1 = '#343A40';
const DIVIDER = '#E5E5E5';

interface FiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onFiltersChange: (f: Partial<Filters>) => void;
  advancedFilters: AdvancedFilters;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
  onClear: () => void;
  onApply: () => void;
}

export function FiltersDrawer({
  open, onClose, filters, onFiltersChange, advancedFilters, onAdvancedFiltersChange, onClear, onApply,
}: FiltersDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(34,17,96,0.35)', zIndex: 1300 }}
        onClick={onClose}
      />

      {/* Drawer — right side */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 380, maxWidth: '92vw',
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          zIndex: 1301,
          boxShadow: '-4px 0 32px rgba(34,17,96,0.12)',
          animation: 'slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${DIVIDER}`, flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: FG1 }}>Filtros</h3>
          <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4 }}>
            <X size={18} color="#666" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
          <AdvancedFiltersContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            advancedFilters={advancedFilters}
            onAdvancedFiltersChange={onAdvancedFiltersChange}
          />
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${DIVIDER}`, display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={onClear}
            style={{ padding: '10px 16px', border: `1px solid ${DIVIDER}`, borderRadius: 4, background: '#fff', color: '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Limpiar filtros
          </button>
          <button
            onClick={onApply}
            style={{ flex: 1, padding: '10px', background: INDIGO, color: '#fff', border: 0, borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Ver resultados
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
