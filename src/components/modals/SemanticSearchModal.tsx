import { useState } from 'react';
import { X, Sparkles, Search } from 'lucide-react';
import type { SearchInterpretation } from '../../types/property';

interface SemanticSearchModalProps {
  onClose: () => void;
  onSearch: (query: string) => void;
  currentInterpretation: SearchInterpretation | null;
  currentQuery: string;
}

const EXAMPLES = [
  'Departamento en Ñuñoa, 2 dormitorios, hasta 5.000 UF',
  'Casa en arriendo en La Reina con patio',
  'Depto cerca de metro en Providencia',
];

export function SemanticSearchModal({ onClose, onSearch, currentInterpretation, currentQuery }: SemanticSearchModalProps) {
  const [tab, setTab] = useState<'classic' | 'ai'>('ai');
  const [query, setQuery] = useState(currentQuery);

  const submit = () => {
    if (query.trim()) { onSearch(query.trim()); onClose(); }
  };

  const chips = currentInterpretation ? [
    currentInterpretation.operation,
    currentInterpretation.propertyType,
    currentInterpretation.zone,
    currentInterpretation.bedrooms,
    currentInterpretation.maxPrice,
  ].filter(Boolean) as string[] : [];

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-16 px-4" style={{ background: 'rgba(34,17,96,0.5)', zIndex: 1300 }} onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#fff', animation: 'slideDown 0.2s cubic-bezier(0.16,1,0.3,1)', zIndex: 1301, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#E5E5E5' }}>
          <h3 className="font-extrabold text-base" style={{ color: '#343A40' }}>Refinar búsqueda</h3>
          <button onClick={onClose}><X size={18} style={{ color: '#666' }} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: '#E5E5E5' }}>
          {[
            { id: 'classic', label: 'Búsqueda clásica' },
            { id: 'ai', label: 'Búsqueda IA', badge: 'Beta' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'classic' | 'ai')}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 transition-all"
              style={{
                borderBottomColor: tab === t.id ? '#3200C1' : 'transparent',
                color: tab === t.id ? '#3200C1' : '#666',
              }}
            >
              {t.id === 'ai' && <Sparkles size={13} />}
              {t.label}
              {t.badge && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#E8FFFB', color: '#0E7490', fontSize: 10 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'ai' ? (
            <>
              <p className="text-xs font-semibold mb-2" style={{ color: '#666' }}>
                Describe en lenguaje natural lo que buscas:
              </p>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ej: Departamento en Ñuñoa, 2 dormitorios, hasta 5.000 UF"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                style={{
                  borderColor: '#B2D0FF',
                  background: '#EAF2FC',
                  color: '#343A40',
                  fontFamily: 'Nunito, sans-serif',
                }}
              />

              {/* Examples */}
              <div className="flex flex-col gap-1.5 mt-3">
                {EXAMPLES.map(ex => (
                  <button
                    key={ex}
                    onClick={() => setQuery(ex)}
                    className="text-left text-xs px-3 py-2 rounded-lg border transition-all hover:border-tt-indigo hover:text-tt-indigo"
                    style={{ borderColor: '#E5E5E5', color: '#343A40', background: '#F9F9F9' }}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Current interpretation */}
              {chips.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#666' }}>
                    Búsqueda actual interpretada:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {chips.map(chip => (
                      <span key={chip} className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: '#EAF2FC', color: '#3200C1' }}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: '#343A40' }}>¿Qué buscas?</label>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ej: Departamento, Casa..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#E5E5E5', background: '#F9F9F9', fontFamily: 'Nunito, sans-serif' }}
                />
              </div>
              <p className="text-xs" style={{ color: '#666' }}>
                Usa la búsqueda IA para resultados más precisos.
              </p>
            </div>
          )}

          <button
            onClick={submit}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: '#3200C1', color: '#fff' }}
          >
            <Search size={15} />
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
