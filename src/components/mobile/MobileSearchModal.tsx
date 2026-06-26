import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Search, ChevronDown } from 'lucide-react';
import type { Filters, AdvancedFilters, OperationType, PropertyType } from '../../types/property';
import { DEFAULT_FILTERS } from '../../types/property';
import { zones_list } from '../../data/mockProperties';
import {
  STEP_TIMESTAMPS,
  SEARCH_TOTAL_MS,
  extractChipsSEO,
} from '../ia/IASearchShared';
import { IALoadingCard } from '../ia/IALoadingCard';

const INDIGO = '#3200C1';
const INDIGO_50 = '#EAF2FC';
const FG1 = '#343A40';

export type SearchTab = 'classic' | 'ai';

const AI_EXAMPLES = [
  'Departamento en Ñuñoa, 2 dormitorios, hasta 5.000 UF',
  'Casa en arriendo en La Reina con patio',
  'Depto cerca de metro en Providencia',
];


interface MobileSearchModalProps {
  open: boolean;
  tab: SearchTab;
  onTabChange: (t: SearchTab) => void;
  onClose: () => void;
  filters: Filters;
  advancedFilters: AdvancedFilters;
  query: string;
  interpretation: null | unknown;
  onSearch: (q: string) => void;
  onFiltersChange: (f: Partial<Filters>) => void;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
}

export function MobileSearchModal({
  open, tab, onTabChange, onClose,
  filters, advancedFilters, query,
  onSearch, onFiltersChange, onAdvancedFiltersChange,
}: MobileSearchModalProps) {
  // AI tab state
  const [aiQuery, setAiQuery] = useState(query);
  const [aiChips, setAiChips] = useState<string[]>([]);

  // Loading state — shared with desktop logic
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [chipsVisible, setChipsVisible] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Classic tab local state (only applied on Buscar)
  const [localFilters, setLocalFilters] = useState<Filters>({ ...filters });
  const [localAdvanced, setLocalAdvanced] = useState<AdvancedFilters>({ ...advancedFilters });

  // Sync when modal opens; always reset loading state so re-opening shows form
  useEffect(() => {
    if (open) {
      setAiQuery(query);
      setLocalFilters({ ...filters });
      setLocalAdvanced({ ...advancedFilters });
      setAiChips(query ? extractChipsSEO(query) : []);
      cancelTimers();
      setLoading(false);
      setLoadingStep(0);
      setChipsVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Cleanup on unmount
  useEffect(() => () => cancelTimers(), []);

  // Back button interception — closes modal (or cancels loading) before navigating
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ searchModal: true }, '');
    const handler = () => {
      cancelTimers();
      setLoading(false);
      onClose();
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [open, onClose]);

  function cancelTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  const handleExampleClick = (ex: string) => {
    setAiQuery(ex);
    setAiChips(extractChipsSEO(ex));
  };

  const handleAISearch = () => {
    const text = aiQuery.trim();
    if (!text || loading) return;

    const chips = extractChipsSEO(text);
    setAiChips(chips);
    setLoading(true);
    setLoadingStep(0);
    setChipsVisible(false);
    cancelTimers();

    // Mirror exact desktop timing from STEP_TIMESTAMPS
    const t1 = setTimeout(() => { setLoadingStep(1); setChipsVisible(true); }, STEP_TIMESTAMPS[1]);
    const t2 = setTimeout(() => setLoadingStep(2), STEP_TIMESTAMPS[2]);
    const t3 = setTimeout(() => setLoadingStep(3), STEP_TIMESTAMPS[3]);
    const t4 = setTimeout(() => setLoadingStep(4), STEP_TIMESTAMPS[4]);
    const t5 = setTimeout(() => {
      cancelTimers();
      setLoading(false);
      setLoadingStep(0);
      setChipsVisible(false);
      onSearch(text);
      onClose();
    }, SEARCH_TOTAL_MS);

    timersRef.current = [t1, t2, t3, t4, t5];
  };

  const handleClose = () => {
    // Cancel in-flight loading without applying partial search
    cancelTimers();
    setLoading(false);
    setLoadingStep(0);
    setChipsVisible(false);
    onClose();
  };

  const handleClassicSearch = () => {
    onFiltersChange({ ...localFilters });
    onAdvancedFiltersChange({ ...localAdvanced });
    onSearch('');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Refinar búsqueda"
    >
      {/* Header — always visible, even during loading */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid #E5E5E5',
        flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: FG1, margin: 0 }}>
          Refinar búsqueda
        </h2>
        <button
          onClick={handleClose}
          aria-label="Cerrar buscador"
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: '#F5F5F5', borderRadius: 8,
            cursor: 'pointer', color: '#666',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs — always visible, even during loading */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E5E5', flexShrink: 0 }}>
        {[
          { id: 'classic' as SearchTab, label: 'Búsqueda clásica' },
          { id: 'ai' as SearchTab, label: 'Búsqueda IA', badge: 'Beta' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => !loading && onTabChange(t.id)}
            role="tab"
            aria-selected={tab === t.id}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 0',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              borderBottom: `2px solid ${tab === t.id ? INDIGO : 'transparent'}`,
              background: 'none',
              color: tab === t.id ? INDIGO : '#666',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading && t.id !== 'ai' ? 0.5 : 1,
              transition: 'color 0.15s',
            }}
          >
            {t.id === 'ai' && <Sparkles size={13} />}
            {t.label}
            {t.badge && (
              <span style={{
                fontSize: 9, fontWeight: 700,
                padding: '2px 5px', borderRadius: 4,
                background: '#E8FFFB', color: '#0E7490',
              }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {tab === 'ai' ? (
          loading ? (
            /* ── Loader card — replaces form content during processing ── */
            <IALoadingCard
              query={aiQuery}
              step={loadingStep}
              chips={aiChips}
              chipsVisible={chipsVisible}
            />
          ) : (
            <AITab
              aiQuery={aiQuery}
              setAiQuery={val => { setAiQuery(val); setAiChips(val.trim() ? extractChipsSEO(val) : []); }}
              aiChips={aiChips}
              onExampleClick={handleExampleClick}
              onSearch={handleAISearch}
            />
          )
        ) : (
          <ClassicTab
            localFilters={localFilters}
            setLocalFilters={setLocalFilters}
            localAdvanced={localAdvanced}
            setLocalAdvanced={setLocalAdvanced}
            onSearch={handleClassicSearch}
          />
        )}
      </div>
    </div>
  );
}

// ── AI tab (form state) ────────────────────────────────────────

interface AITabProps {
  aiQuery: string;
  setAiQuery: (q: string) => void;
  aiChips: string[];
  onExampleClick: (ex: string) => void;
  onSearch: () => void;
}

function AITab({ aiQuery, setAiQuery, aiChips, onExampleClick, onSearch }: AITabProps) {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#666', margin: '0 0 8px' }}>
          Describe en lenguaje natural lo que buscas:
        </p>
        <textarea
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          placeholder='Ej: "Depto cerca de metro en Providencia"'
          rows={3}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 12,
            border: '1.5px solid #B2D0FF',
            background: INDIGO_50,
            color: FG1,
            fontSize: 14,
            fontFamily: 'Nunito, sans-serif',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {AI_EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => onExampleClick(ex)}
            style={{
              textAlign: 'left', fontSize: 13,
              padding: '10px 14px', borderRadius: 10,
              border: '1px solid #E5E5E5', background: '#F9F9F9',
              color: FG1, cursor: 'pointer', fontFamily: 'inherit',
              minHeight: 44, lineHeight: 1.4,
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Preview chips from current input */}
      {aiChips.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#666', margin: '0 0 8px' }}>
            Búsqueda actual interpretada:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {aiChips.map(chip => (
              <span key={chip} style={{
                fontSize: 12, fontWeight: 700,
                padding: '5px 12px', borderRadius: 20,
                background: INDIGO_50, color: INDIGO,
              }}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onSearch}
        disabled={!aiQuery.trim()}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px', borderRadius: 12, border: 'none',
          background: aiQuery.trim() ? INDIGO : '#C5C5C5',
          color: '#fff', fontSize: 15, fontWeight: 800,
          cursor: aiQuery.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit', transition: 'background 0.15s', minHeight: 52,
        }}
      >
        <Search size={16} />
        Buscar
      </button>
      <div style={{ height: 120 }} />
    </div>
  );
}

// ── Classic tab ────────────────────────────────────────────────

interface ClassicTabProps {
  localFilters: Filters;
  setLocalFilters: (f: Filters) => void;
  localAdvanced: AdvancedFilters;
  setLocalAdvanced: (f: AdvancedFilters) => void;
  onSearch: () => void;
}

const PROP_TYPES: { value: PropertyType | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'oficina', label: 'Oficina' },
];

const BEDROOMS_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 0, label: 'Estudio' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
];

const PRICE_OPTIONS = [0, 1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000, 25000];

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, fontWeight: 700, color: FG1, margin: '0 0 8px' }}>{children}</p>;
}

function ChipRow<T>({ options, current, onSelect }: {
  options: { value: T; label: string }[];
  current: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => (
        <button
          key={String(o.value)}
          onClick={() => onSelect(o.value)}
          style={{
            padding: '7px 14px', borderRadius: 20,
            border: `1.5px solid ${current === o.value ? INDIGO : '#E5E5E5'}`,
            background: current === o.value ? INDIGO_50 : '#fff',
            color: current === o.value ? INDIGO : '#555',
            fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            minHeight: 36, transition: 'all 0.12s',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ClassicTab({ localFilters, setLocalFilters, localAdvanced, setLocalAdvanced, onSearch }: ClassicTabProps) {
  const setF = (partial: Partial<Filters>) => setLocalFilters({ ...localFilters, ...partial });
  const setA = (partial: Partial<AdvancedFilters>) => setLocalAdvanced({ ...localAdvanced, ...partial });

  const toggleStatus = (s: 'nueva' | 'usada') => {
    const current = localAdvanced.status;
    setA({ status: current.includes(s) ? current.filter(x => x !== s) : [...current, s] });
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Label>Operación</Label>
        <ChipRow<OperationType | null>
          options={[
            { value: null, label: 'Todas' },
            { value: 'venta', label: 'Comprar' },
            { value: 'arriendo', label: 'Arrendar' },
          ]}
          current={localFilters.operation}
          onSelect={v => setF({ operation: v })}
        />
      </div>

      <div>
        <Label>Tipo de propiedad</Label>
        <ChipRow<PropertyType | null>
          options={PROP_TYPES}
          current={localFilters.propertyType}
          onSelect={v => setF({ propertyType: v })}
        />
      </div>

      <div>
        <Label>Ubicación / Comuna</Label>
        <div style={{ position: 'relative' }}>
          <select
            value={localFilters.zone}
            onChange={e => setF({ zone: e.target.value })}
            style={{
              width: '100%', padding: '11px 36px 11px 14px', borderRadius: 10,
              border: '1.5px solid #E5E5E5', background: '#fff',
              color: localFilters.zone ? FG1 : '#999',
              fontSize: 14, fontFamily: 'Nunito, sans-serif',
              outline: 'none', appearance: 'none', cursor: 'pointer', minHeight: 44,
            }}
          >
            <option value="">Todas las comunas</option>
            {zones_list.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
        </div>
      </div>

      <div>
        <Label>Dormitorios</Label>
        <ChipRow<number | null>
          options={BEDROOMS_OPTIONS}
          current={localFilters.bedrooms}
          onSelect={v => setF({ bedrooms: v })}
        />
      </div>

      <div>
        <Label>Precio en UF</Label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <select
              value={localFilters.priceMinUF}
              onChange={e => setF({ priceMinUF: Number(e.target.value) })}
              style={{
                width: '100%', padding: '11px 28px 11px 14px', borderRadius: 10,
                border: '1.5px solid #E5E5E5', background: '#fff', color: FG1,
                fontSize: 13, fontFamily: 'Nunito, sans-serif',
                outline: 'none', appearance: 'none', cursor: 'pointer', minHeight: 44,
              }}
            >
              {PRICE_OPTIONS.map(v => <option key={v} value={v}>{v === 0 ? 'Sin mínimo' : `UF ${v.toLocaleString('es-CL')}`}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <select
              value={localFilters.priceMaxUF}
              onChange={e => setF({ priceMaxUF: Number(e.target.value) })}
              style={{
                width: '100%', padding: '11px 28px 11px 14px', borderRadius: 10,
                border: '1.5px solid #E5E5E5', background: '#fff', color: FG1,
                fontSize: 13, fontFamily: 'Nunito, sans-serif',
                outline: 'none', appearance: 'none', cursor: 'pointer', minHeight: 44,
              }}
            >
              {PRICE_OPTIONS.slice(1).concat([DEFAULT_FILTERS.priceMaxUF]).map(v => (
                <option key={v} value={v}>{v >= DEFAULT_FILTERS.priceMaxUF ? 'Sin máximo' : `UF ${v.toLocaleString('es-CL')}`}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      <div>
        <Label>Estado</Label>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['nueva', 'usada'] as const).map(s => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              style={{
                padding: '7px 14px', borderRadius: 20,
                border: `1.5px solid ${localAdvanced.status.includes(s) ? INDIGO : '#E5E5E5'}`,
                background: localAdvanced.status.includes(s) ? INDIGO_50 : '#fff',
                color: localAdvanced.status.includes(s) ? INDIGO : '#555',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                minHeight: 36, textTransform: 'capitalize',
              }}
            >
              {s === 'nueva' ? 'Nueva' : 'Usada'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSearch}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px', borderRadius: 12, border: 'none',
          background: INDIGO, color: '#fff', fontSize: 15, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit', minHeight: 52,
        }}
      >
        <Search size={16} />
        Buscar
      </button>
      <div style={{ height: 120 }} />
    </div>
  );
}
