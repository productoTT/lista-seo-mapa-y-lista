import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Search, ChevronDown } from 'lucide-react';
import type { Filters, AdvancedFilters, SearchInterpretation, OperationType, PropertyType } from '../../types/property';
import { DEFAULT_FILTERS } from '../../types/property';
import { zones_list } from '../../data/mockProperties';

const INDIGO = '#3200C1';
const INDIGO_50 = '#EAF2FC';
const FG1 = '#343A40';

export type SearchTab = 'classic' | 'ai';

const AI_EXAMPLES = [
  'Departamento en Ñuñoa, 2 dormitorios, hasta 5.000 UF',
  'Casa en arriendo en La Reina con patio',
  'Depto cerca de metro en Providencia',
];

const LOADING_STEPS = [
  'Interpretando búsqueda…',
  'Detectando filtros relevantes…',
  'Buscando propiedades…',
  'Ordenando resultados…',
];

function parseAIQuery(q: string): { chips: string[]; interpretation: SearchInterpretation } {
  const lower = q.toLowerCase();
  const chips: string[] = [];
  const interp: SearchInterpretation = { query: q };

  if (lower.includes('arriendo')) { chips.push('Arrendar'); interp.operation = 'Arrendar'; }
  else { chips.push('Comprar'); interp.operation = 'Comprar'; }

  if (lower.includes('depto') || lower.includes('departamento') || lower.includes('dpto')) {
    chips.push('Departamento'); interp.propertyType = 'Departamento';
  } else if (lower.includes('casa')) {
    chips.push('Casa'); interp.propertyType = 'Casa';
  }

  const zoneMap: Record<string, string> = {
    'ñuñoa': 'Ñuñoa', 'providencia': 'Providencia', 'las condes': 'Las Condes',
    'vitacura': 'Vitacura', 'la reina': 'La Reina', 'la florida': 'La Florida',
    'santiago': 'Santiago', 'peñalolén': 'Peñalolén',
  };
  for (const [k, v] of Object.entries(zoneMap)) {
    if (lower.includes(k)) { chips.push(v); interp.zone = v; break; }
  }

  const beds = lower.match(/(\d)\s*dorm/);
  if (beds) { chips.push(`${beds[1]} dorm.`); interp.bedrooms = `${beds[1]} dormitorios`; }

  const uf = lower.match(/(\d[\d.]*)\s*uf/i);
  if (uf) {
    const n = parseInt(uf[1].replace(/\./g, ''));
    chips.push(`Hasta UF ${n.toLocaleString('es-CL')}`);
    interp.maxPrice = `Hasta UF ${n.toLocaleString('es-CL')}`;
  }

  if (lower.includes('metro')) chips.push('Cerca de metro');

  return { chips, interpretation: interp };
}

interface MobileSearchModalProps {
  open: boolean;
  tab: SearchTab;
  onTabChange: (t: SearchTab) => void;
  onClose: () => void;
  filters: Filters;
  advancedFilters: AdvancedFilters;
  query: string;
  interpretation: SearchInterpretation | null;  // eslint-disable-line @typescript-eslint/no-unused-vars
  onSearch: (q: string) => void;
  onFiltersChange: (f: Partial<Filters>) => void;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
}

export function MobileSearchModal({
  open, tab, onTabChange, onClose,
  filters, advancedFilters, query, interpretation: _interpretation,
  onSearch, onFiltersChange, onAdvancedFiltersChange,
}: MobileSearchModalProps) {
  // AI tab state
  const [aiQuery, setAiQuery] = useState(query);
  const [aiChips, setAiChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Classic tab local state (only applied on Buscar)
  const [localFilters, setLocalFilters] = useState<Filters>({ ...filters });
  const [localAdvanced, setLocalAdvanced] = useState<AdvancedFilters>({ ...advancedFilters });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync when modal opens
  useEffect(() => {
    if (open) {
      setAiQuery(query);
      setLocalFilters({ ...filters });
      setLocalAdvanced({ ...advancedFilters });
      if (query) {
        const { chips } = parseAIQuery(query);
        setAiChips(chips);
      } else {
        setAiChips([]);
      }
      setLoading(false);
      setLoadingStep(0);
    }
  }, [open]);

  // Back button interception
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ searchModal: true }, '');
    const handler = () => { onClose(); };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [open, onClose]);

  const handleExampleClick = (ex: string) => {
    setAiQuery(ex);
    const { chips } = parseAIQuery(ex);
    setAiChips(chips);
  };

  const handleAISearch = () => {
    if (!aiQuery.trim()) return;
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => {
        if (s >= LOADING_STEPS.length - 1) { clearInterval(stepInterval); return s; }
        return s + 1;
      });
    }, 340);

    setTimeout(() => {
      clearInterval(stepInterval);
      setLoading(false);
      onSearch(aiQuery.trim());
      onClose();
    }, 1500);
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
      {/* Header */}
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
          onClick={onClose}
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

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E5E5E5',
        flexShrink: 0,
      }}>
        {[
          { id: 'classic' as SearchTab, label: 'Búsqueda clásica' },
          { id: 'ai' as SearchTab, label: 'Búsqueda IA', badge: 'Beta' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
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
              cursor: 'pointer',
              fontFamily: 'inherit',
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
          <AITab
            aiQuery={aiQuery}
            setAiQuery={setAiQuery}
            aiChips={aiChips}
            setAiChips={setAiChips}
            loading={loading}
            loadingStep={loadingStep}
            onExampleClick={handleExampleClick}
            onSearch={handleAISearch}
            textareaRef={textareaRef}
          />
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

// ── AI tab ────────────────────────────────────────────────────

interface AITabProps {
  aiQuery: string;
  setAiQuery: (q: string) => void;
  aiChips: string[];
  setAiChips: (c: string[]) => void;
  loading: boolean;
  loadingStep: number;
  onExampleClick: (ex: string) => void;
  onSearch: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

function AITab({ aiQuery, setAiQuery, aiChips, setAiChips, loading, loadingStep, onExampleClick, onSearch, textareaRef }: AITabProps) {
  const handleChange = (val: string) => {
    setAiQuery(val);
    if (val.trim()) {
      const { chips } = parseAIQuery(val);
      setAiChips(chips);
    } else {
      setAiChips([]);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: INDIGO_50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 1.2s ease-in-out infinite',
        }}>
          <Sparkles size={26} style={{ color: INDIGO }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 800, color: FG1, margin: 0, textAlign: 'center' }}>
          Entendiendo tu búsqueda
        </p>
        <p style={{ fontSize: 13, color: '#666', margin: 0, textAlign: 'center', fontStyle: 'italic' }}>
          "{aiQuery}"
        </p>
        <p style={{ fontSize: 12, color: INDIGO, margin: 0, fontWeight: 600 }}>
          {LOADING_STEPS[loadingStep]}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#666', margin: '0 0 8px' }}>
          Describe en lenguaje natural lo que buscas:
        </p>
        <textarea
          ref={textareaRef}
          value={aiQuery}
          onChange={e => handleChange(e.target.value)}
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

      {/* Examples */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {AI_EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => onExampleClick(ex)}
            style={{
              textAlign: 'left',
              fontSize: 13,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #E5E5E5',
              background: '#F9F9F9',
              color: FG1,
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: 44,
              lineHeight: 1.4,
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Interpreted chips */}
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

      {/* CTA */}
      <button
        onClick={onSearch}
        disabled={!aiQuery.trim()}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: aiQuery.trim() ? INDIGO : '#C5C5C5',
          color: '#fff',
          fontSize: 15,
          fontWeight: 800,
          cursor: aiQuery.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          transition: 'background 0.15s',
          minHeight: 52,
        }}
      >
        <Search size={16} />
        Buscar
      </button>
      {/* Keyboard spacer */}
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
  return (
    <p style={{ fontSize: 12, fontWeight: 700, color: FG1, margin: '0 0 8px' }}>{children}</p>
  );
}

function ChipRow<T>({
  options, current, onSelect,
}: {
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
            padding: '7px 14px',
            borderRadius: 20,
            border: `1.5px solid ${current === o.value ? INDIGO : '#E5E5E5'}`,
            background: current === o.value ? INDIGO_50 : '#fff',
            color: current === o.value ? INDIGO : '#555',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            minHeight: 36,
            transition: 'all 0.12s',
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
      {/* Operación */}
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

      {/* Tipo de propiedad */}
      <div>
        <Label>Tipo de propiedad</Label>
        <ChipRow<PropertyType | null>
          options={PROP_TYPES}
          current={localFilters.propertyType}
          onSelect={v => setF({ propertyType: v })}
        />
      </div>

      {/* Ubicación */}
      <div>
        <Label>Ubicación / Comuna</Label>
        <div style={{ position: 'relative' }}>
          <select
            value={localFilters.zone}
            onChange={e => setF({ zone: e.target.value })}
            style={{
              width: '100%',
              padding: '11px 36px 11px 14px',
              borderRadius: 10,
              border: '1.5px solid #E5E5E5',
              background: '#fff',
              color: localFilters.zone ? FG1 : '#999',
              fontSize: 14,
              fontFamily: 'Nunito, sans-serif',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            <option value="">Todas las comunas</option>
            {zones_list.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Dormitorios */}
      <div>
        <Label>Dormitorios</Label>
        <ChipRow<number | null>
          options={BEDROOMS_OPTIONS}
          current={localFilters.bedrooms}
          onSelect={v => setF({ bedrooms: v })}
        />
      </div>

      {/* Precio */}
      <div>
        <Label>Precio en UF</Label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <select
              value={localFilters.priceMinUF}
              onChange={e => setF({ priceMinUF: Number(e.target.value) })}
              style={{
                width: '100%', padding: '11px 28px 11px 14px',
                borderRadius: 10, border: '1.5px solid #E5E5E5',
                background: '#fff', color: FG1, fontSize: 13,
                fontFamily: 'Nunito, sans-serif', outline: 'none',
                appearance: 'none', cursor: 'pointer', minHeight: 44,
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
                width: '100%', padding: '11px 28px 11px 14px',
                borderRadius: 10, border: '1.5px solid #E5E5E5',
                background: '#fff', color: FG1, fontSize: 13,
                fontFamily: 'Nunito, sans-serif', outline: 'none',
                appearance: 'none', cursor: 'pointer', minHeight: 44,
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

      {/* Estado */}
      <div>
        <Label>Estado</Label>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['nueva', 'usada'] as const).map(s => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
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

      {/* CTA */}
      <button
        onClick={onSearch}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: INDIGO,
          color: '#fff',
          fontSize: 15,
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: 'inherit',
          minHeight: 52,
        }}
      >
        <Search size={16} />
        Buscar
      </button>
      {/* Keyboard spacer */}
      <div style={{ height: 120 }} />
    </div>
  );
}
