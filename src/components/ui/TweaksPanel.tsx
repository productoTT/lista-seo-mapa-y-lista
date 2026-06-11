import { useState } from 'react';
import { Settings2 } from 'lucide-react';

const INDIGO = '#3200C1';
const DIVIDER = '#E5E5E5';

export type FilterPresentation = 'drawer' | 'modal';
export type SplitLayout = '3col' | '2col-wide-map';

interface TweaksPanelProps {
  filterPresentation: FilterPresentation;
  onFilterPresentationChange: (v: FilterPresentation) => void;
  splitLayout: SplitLayout;
  onSplitLayoutChange: (v: SplitLayout) => void;
}

export function TweaksPanel({ filterPresentation, onFilterPresentationChange, splitLayout, onSplitLayoutChange }: TweaksPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {open && (
        <div style={{
          background: '#fff',
          border: `1px solid ${DIVIDER}`,
          borderRadius: 10,
          padding: '14px 16px',
          boxShadow: '0 4px 24px rgba(50,0,193,0.14)',
          minWidth: 220,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#999', margin: '0 0 10px' }}>
            ⚙ Tweaks
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#343A40', margin: '0 0 8px' }}>
            Presentación de filtros
          </p>
          <div style={{ display: 'flex', gap: 0, border: `1px solid ${DIVIDER}`, borderRadius: 4, overflow: 'hidden' }}>
            {(['drawer', 'modal'] as const).map(v => (
              <button
                key={v}
                onClick={() => onFilterPresentationChange(v)}
                style={{
                  flex: 1, padding: '7px 10px',
                  border: 0, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 120ms',
                  ...(filterPresentation === v
                    ? { background: INDIGO, color: '#fff' }
                    : { background: '#fff', color: '#666' }),
                }}
              >
                {v === 'drawer' ? 'Drawer' : 'Modal'}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 11, fontWeight: 600, color: '#343A40', margin: '12px 0 8px' }}>
            Layout vista dividida
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, border: `1px solid ${DIVIDER}`, borderRadius: 4, overflow: 'hidden' }}>
            {([
              { value: '3col', label: '3 columnas + mapa' },
              { value: '2col-wide-map', label: '2 col. compacto + mapa amplio' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onSplitLayoutChange(value)}
                style={{
                  padding: '7px 10px',
                  border: 0, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 120ms',
                  ...(splitLayout === value
                    ? { background: INDIGO, color: '#fff' }
                    : { background: '#fff', color: '#666' }),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(s => !s)}
        title="Tweaks del prototipo"
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: open ? INDIGO : '#fff',
          border: `1px solid ${open ? INDIGO : DIVIDER}`,
          boxShadow: '0 2px 12px rgba(50,0,193,0.15)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 150ms',
        }}
      >
        <Settings2 size={18} color={open ? '#37FFDB' : INDIGO} />
      </button>
    </div>
  );
}
