import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Search, Sparkles, ChevronDown, Key, TrendingUp, Building2 } from 'lucide-react';
import { ToctocFullHeader } from '../seo/ToctocFullHeader';
import type { Filters, OperationType, PropertyType } from '../../types/property';

// ── IA chip extraction (mirrors parseQuery in App.tsx) ────
const ZONES_MAP: Record<string, string> = {
  'ñuñoa': 'Ñuñoa', 'providencia': 'Providencia', 'las condes': 'Las Condes',
  'vitacura': 'Vitacura', 'santiago centro': 'Santiago Centro', 'santiago': 'Santiago',
  'miraflores': 'Miraflores', 'la florida': 'La Florida', 'peñalolén': 'Peñalolén', 'la reina': 'La Reina',
};

function extractChips(q: string): string[] {
  const lower = q.toLowerCase();
  const chips: string[] = [];
  if (lower.includes('arriend') || lower.includes('alquil')) chips.push('Arriendo');
  else chips.push('Comprar');
  if (lower.includes('depto') || lower.includes('departamento') || lower.includes('dpto')) chips.push('Departamento');
  else if (lower.includes('casa')) chips.push('Casa');
  else if (lower.includes('oficina')) chips.push('Oficina');
  for (const z of Object.keys(ZONES_MAP)) {
    if (lower.includes(z)) { chips.push(ZONES_MAP[z]); break; }
  }
  const beds = lower.match(/(\d)\s*dorm/);
  if (beds) chips.push(`${beds[1]} dorm.`);
  const uf = lower.match(/(\d[\d.]*)\s*uf/i);
  if (uf) chips.push(`Hasta UF ${parseInt(uf[1].replace(/\./g, '')).toLocaleString('es-CL')}`);
  if (lower.includes('metro')) chips.push('Cerca de metro');
  if (lower.includes('terraza')) chips.push('Terraza');
  if (lower.includes('estacionamiento')) chips.push('Estacionamiento');
  return chips;
}

const LOADING_STEPS = [
  'Interpretando tu búsqueda…',
  'Detectando comuna, tipo de propiedad y presupuesto…',
  'Buscando propiedades que coincidan con tus criterios…',
  'Ordenando resultados relevantes…',
  'Preparando tu lista de propiedades…',
];

// ── Constants ─────────────────────────────────────────────

const IA_EXAMPLES = [
  'Departamento en Ñuñoa, 2 dormitorios, hasta 5.000 UF',
  'Casa en arriendo en La Reina con patio',
  'Depto cerca de metro en Providencia',
  'Inversión en Santiago Centro hasta 4.000 UF',
];

const COMMUNES = [
  'Ñuñoa', 'Providencia', 'Las Condes', 'Vitacura', 'Santiago Centro',
  'Miraflores', 'La Florida', 'Peñalolén', 'La Reina', 'Macul',
  'San Miguel', 'Estación Central', 'Maipú', 'Pudahuel', 'Quilicura',
  'Lo Barnechea', 'Huechuraba', 'Conchalí', 'Recoleta', 'Independencia',
];

const INDIGO = '#3200C1';
const MINT = '#37FFDB';

// ── Small sub-components ──────────────────────────────────

function SelectDropdown({
  value, options, onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          border: 0,
          outline: 0,
          background: 'transparent',
          fontSize: 14,
          fontWeight: 600,
          color: '#343A40',
          cursor: 'pointer',
          paddingRight: 20,
          paddingLeft: 0,
          fontFamily: 'inherit',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} color="#666" style={{ position: 'absolute', right: 2, pointerEvents: 'none' }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────

type SearchTab = 'traditional' | 'ia';

interface HomeScreenProps {
  onSearch: (query: string) => void;
  onClassicSearch: (filters: Partial<Filters>) => void;
}

export function HomeScreen({ onSearch, onClassicSearch }: HomeScreenProps) {
  const [tab, setTab] = useState<SearchTab>('traditional');

  // Traditional search state
  const [operation, setOperation] = useState<OperationType>('venta');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('departamento');
  const [commune, setCommune] = useState('');
  const [communeSuggestions, setCommuneSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const communeRef = useRef<HTMLDivElement>(null);

  // IA search state
  const [iaQuery, setIaQuery] = useState('');
  const [iaSuggestionsOpen, setIaSuggestionsOpen] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaLoadingStep, setIaLoadingStep] = useState(0);
  const [iaChips, setIaChips] = useState<string[]>([]);
  const [iaChipsVisible, setIaChipsVisible] = useState(false);
  const iaInputRef = useRef<HTMLDivElement>(null);
  const [iaInputRect, setIaInputRect] = useState<DOMRect | null>(null);

  const updateIaRect = useCallback(() => {
    if (iaInputRef.current) setIaInputRect(iaInputRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!iaSuggestionsOpen) return;
    updateIaRect();
    window.addEventListener('scroll', updateIaRect, true);
    window.addEventListener('resize', updateIaRect);
    return () => {
      window.removeEventListener('scroll', updateIaRect, true);
      window.removeEventListener('resize', updateIaRect);
    };
  }, [iaSuggestionsOpen, updateIaRect]);

  // Close commune suggestions on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (communeRef.current && !communeRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function handleCommuneInput(val: string) {
    setCommune(val);
    if (val.length >= 1) {
      const filtered = COMMUNES.filter(c => c.toLowerCase().startsWith(val.toLowerCase()));
      setCommuneSuggestions(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function handleTraditionalSearch() {
    const partial: Partial<Filters> = { operation };
    if (propertyType) partial.propertyType = propertyType as PropertyType;
    if (commune) partial.zone = commune;
    onClassicSearch(partial);
  }

  function handleIaSearch(q?: string) {
    const text = (q ?? iaQuery).trim();
    if (!text) return;
    setIaSuggestionsOpen(false);
    setIaLoading(true);
    setIaLoadingStep(0);
    setIaChipsVisible(false);
    setIaChips(extractChips(text));

    const t1 = setTimeout(() => { setIaLoadingStep(1); setIaChipsVisible(true); }, 2000);
    const t2 = setTimeout(() => { setIaLoadingStep(2); }, 4000);
    const t3 = setTimeout(() => { setIaLoadingStep(3); }, 6000);
    const t4 = setTimeout(() => { setIaLoadingStep(4); }, 8000);
    const t5 = setTimeout(() => {
      setIaLoading(false);
      setIaLoadingStep(0);
      setIaChipsVisible(false);
      onSearch(text);
    }, 9000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }

  function handleIaKey(e: KeyboardEvent) {
    if (e.key === 'Enter') handleIaSearch();
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F5', fontFamily: 'inherit' }}>

      {/* ── Commercial strip ─────────────────────────────── */}
      <div style={{ background: '#EEEDF8', padding: '9px 0' }}>
        <div className="seo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#343A40' }}>
            Si ya tienes tu <strong>SUBSIDIO</strong> ¡Tenemos la mejor opción para usarlo!
          </span>
          <button
            style={{
              border: 0, borderRadius: 6,
              padding: '5px 14px', fontSize: 12, fontWeight: 700,
              color: '#fff', background: '#221160', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Ver más
          </button>
        </div>
      </div>

      {/* ── Full TOCTOC header ────────────────────────────── */}
      <ToctocFullHeader onGoHome={() => {}} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        style={{
          background: INDIGO,
          padding: '56px 16px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            color: '#fff',
            fontSize: 34,
            fontWeight: 800,
            margin: '0 0 36px',
            textAlign: 'center',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          Hola, busca aquí tu próximo hogar
        </h1>

        {/* ── Search block ────────────────────────────────── */}
        <div style={{ width: '100%', maxWidth: 760 }}>

          {/* Tabs — float directly on purple */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
            {([
              { key: 'traditional' as const, label: 'Búsqueda tradicional' },
              { key: 'ia' as const, label: 'Búsqueda con IA ✨' },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setIaSuggestionsOpen(false); }}
                style={{
                  border: 0,
                  background: 'transparent',
                  padding: '10px 18px',
                  fontSize: 14,
                  fontWeight: tab === t.key ? 700 : 400,
                  color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.62)',
                  borderBottom: tab === t.key ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.12s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Traditional tab ─────────────────────────── */}
          {tab === 'traditional' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 10,
                  overflow: 'visible',
                  background: '#fff',
                  boxShadow: '0 4px 24px rgba(20,0,80,0.22)',
                }}
              >
                {/* Operation */}
                <div
                  style={{
                    padding: '0 16px',
                    borderRight: '1px solid #E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    height: 52,
                    flexShrink: 0,
                  }}
                >
                  <SelectDropdown
                    value={operation}
                    options={[
                      { value: 'venta', label: 'Comprar' },
                      { value: 'arriendo', label: 'Arrendar' },
                    ]}
                    onChange={v => setOperation(v as OperationType)}
                  />
                </div>

                {/* Property type */}
                <div
                  style={{
                    padding: '0 16px',
                    borderRight: '1px solid #E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    height: 52,
                    flexShrink: 0,
                  }}
                >
                  <SelectDropdown
                    value={propertyType}
                    options={[
                      { value: 'departamento', label: 'Departamento' },
                      { value: 'casa', label: 'Casa' },
                      { value: 'oficina', label: 'Oficina' },
                    ]}
                    onChange={v => setPropertyType(v as PropertyType)}
                  />
                </div>

                {/* Commune input */}
                <div
                  ref={communeRef}
                  style={{ flex: 1, position: 'relative' }}
                >
                  <input
                    type="text"
                    value={commune}
                    onChange={e => handleCommuneInput(e.target.value)}
                    onFocus={() => commune && setShowSuggestions(communeSuggestions.length > 0)}
                    onKeyDown={e => { if (e.key === 'Enter') handleTraditionalSearch(); }}
                    placeholder="Ingresa comuna o ciudad"
                    style={{
                      width: '100%',
                      border: 0,
                      outline: 0,
                      padding: '0 16px',
                      height: 52,
                      fontSize: 14,
                      color: '#343A40',
                      background: 'transparent',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                  {showSuggestions && communeSuggestions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #E5E5E5',
                        borderRadius: 8,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                        zIndex: 100,
                        marginTop: 4,
                        overflow: 'hidden',
                      }}
                    >
                      {communeSuggestions.map(c => (
                        <button
                          key={c}
                          onMouseDown={() => { setCommune(c); setShowSuggestions(false); }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 16px',
                            border: 0,
                            background: 'transparent',
                            textAlign: 'left',
                            fontSize: 14,
                            color: '#343A40',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search button */}
                <button
                  onClick={handleTraditionalSearch}
                  style={{
                    height: 52,
                    padding: '0 28px',
                    background: MINT,
                    color: INDIGO,
                    border: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'inherit',
                    flexShrink: 0,
                    borderRadius: '0 7px 7px 0',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <Search size={15} />
                  Buscar
                </button>
              </div>

              {/* Código link */}
              <div style={{ marginTop: 12 }}>
                <button
                  style={{
                    border: 0,
                    background: 'transparent',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.72)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Buscar propiedad por código
                </button>
              </div>
            </div>
          )}

          {/* ── IA tab ──────────────────────────────────── */}
          {tab === 'ia' && (
            <div>
              {/* ── Loading state ── */}
              {iaLoading ? (
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    background: '#fff',
                    borderRadius: 10,
                    boxShadow: '0 4px 24px rgba(20,0,80,0.22)',
                    overflow: 'hidden',
                    padding: '18px 20px 0',
                  }}
                >
                  {/* Top row: icon + messages */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Sparkles
                      size={20}
                      color={INDIGO}
                      className="ia-sparkle-icon"
                      style={{ flexShrink: 0, marginTop: 2, animation: 'ia-sparkle-pulse 1.2s ease-in-out infinite' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: INDIGO, transition: 'all 0.3s' }}>
                        {LOADING_STEPS[iaLoadingStep]}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{iaQuery}"
                      </p>
                    </div>
                  </div>

                  {/* Chips — appear after step 1 */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginTop: iaChipsVisible && iaChips.length > 0 ? 12 : 0,
                      maxHeight: iaChipsVisible && iaChips.length > 0 ? 60 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.35s ease, margin-top 0.35s ease',
                    }}
                  >
                    {iaChips.map((chip, i) => (
                      <span
                        key={chip}
                        className="ia-chip"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#EAF2FC',
                          color: INDIGO,
                          border: `1px solid rgba(50,0,193,0.15)`,
                          animation: `ia-chip-in 0.25s ease both`,
                          animationDelay: `${i * 80}ms`,
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 14, height: 3, background: '#EAF2FC', borderRadius: 0, overflow: 'hidden', marginLeft: -20, marginRight: -20 }}>
                    <div
                      className="ia-progress-bar"
                      style={{
                        height: '100%',
                        width: '35%',
                        background: `linear-gradient(90deg, ${INDIGO}, ${MINT})`,
                        borderRadius: 2,
                        animation: 'ia-progress 1.1s ease-in-out infinite',
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* ── Normal input state ── */
                <div
                  ref={iaInputRef}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#fff',
                    boxShadow: '0 4px 24px rgba(20,0,80,0.22)',
                  }}
                >
                  <Sparkles size={16} color={INDIGO} style={{ marginLeft: 14, flexShrink: 0 }} />
                  <input
                    type="text"
                    value={iaQuery}
                    onChange={e => setIaQuery(e.target.value)}
                    onFocus={() => { updateIaRect(); setIaSuggestionsOpen(true); }}
                    onKeyDown={handleIaKey}
                    placeholder="Ej: Departamento en Ñuñoa, 2 dormitorios, hasta 5.000 UF"
                    style={{
                      flex: 1,
                      border: 0,
                      outline: 0,
                      padding: '0 12px',
                      height: 52,
                      fontSize: 14,
                      color: '#343A40',
                      background: 'transparent',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    onClick={() => handleIaSearch()}
                    disabled={iaLoading}
                    style={{
                      height: 52,
                      padding: '0 28px',
                      background: MINT,
                      color: INDIGO,
                      border: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'inherit',
                      flexShrink: 0,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <Search size={15} />
                    Buscar
                  </button>
                </div>
              )}

              {/* Suggestions portal — only visible on focus, anchored below input */}
              {iaSuggestionsOpen && iaInputRect && createPortal(
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                    onMouseDown={() => setIaSuggestionsOpen(false)}
                  />
                  <div
                    style={{
                      position: 'fixed',
                      top: iaInputRect.bottom + 6,
                      left: iaInputRect.left,
                      width: iaInputRect.width,
                      background: '#fff',
                      border: '1px solid #E5E5E5',
                      borderRadius: 10,
                      boxShadow: '0 8px 32px rgba(50,0,193,0.14)',
                      zIndex: 9999,
                      overflow: 'hidden',
                    }}
                  >
                    <p style={{ margin: 0, padding: '10px 16px 6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#999' }}>
                      Sugerencias IA
                    </p>
                    {IA_EXAMPLES.map(ex => (
                      <button
                        key={ex}
                        onMouseDown={() => { setIaQuery(ex); setIaSuggestionsOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '10px 16px',
                          border: 0,
                          background: 'transparent',
                          textAlign: 'left',
                          fontSize: 13,
                          color: '#343A40',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#EAF2FC')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Sparkles size={13} color={INDIGO} style={{ flexShrink: 0 }} />
                        {ex}
                      </button>
                    ))}
                  </div>
                </>,
                document.body
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Below-hero sections ───────────────────────────── */}


      {/* Quick categories */}
      <section style={{ padding: '48px 16px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#343A40',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          ¿Qué estás buscando?
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              icon: Key,
              label: 'Comprar',
              sub: 'Departamentos y casas en venta',
              action: () => onClassicSearch({ operation: 'venta' }),
            },
            {
              icon: TrendingUp,
              label: 'Arrendar',
              sub: 'Arriendo residencial y comercial',
              action: () => onClassicSearch({ operation: 'arriendo' }),
            },
            {
              icon: Building2,
              label: 'Proyectos nuevos',
              sub: 'Edificios y condominios en construcción',
              action: () => onSearch('Proyectos nuevos en venta Santiago'),
            },
          ].map(({ icon: Icon, label, sub, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '20px',
                borderRadius: 12,
                border: '1px solid #E5E5E5',
                background: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(50,0,193,0.10)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#EAF2FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={INDIGO} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#343A40' }}>{label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Commercial banners */}
      <section style={{ background: '#fff', borderTop: '1px solid #E5E5E5', padding: '32px 16px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { title: 'Subsidio Habitacional', desc: 'Encuentra propiedades que se ajusten a tu subsidio disponible.', cta: 'Ver propiedades' },
            { title: 'Crédito Hipotecario', desc: 'Simula y compara las mejores tasas para tu crédito.', cta: 'Simular crédito' },
            { title: 'Tasa tu propiedad', desc: 'Conoce el valor de mercado de tu inmueble gratis.', cta: 'Tasar ahora' },
          ].map(({ title, desc, cta }) => (
            <div
              key={title}
              style={{
                padding: '20px 24px',
                borderRadius: 10,
                background: '#EAF2FC',
                border: '1px solid #d0dcee',
              }}
            >
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: INDIGO }}>{title}</p>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#444', lineHeight: 1.5 }}>{desc}</p>
              <button
                style={{
                  border: 0,
                  background: INDIGO,
                  color: '#fff',
                  padding: '7px 16px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer stats */}
      <section
        style={{
          marginTop: 'auto',
          borderTop: '1px solid #E5E5E5',
          background: '#fff',
          padding: '24px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {[
            ['40.000+', 'propiedades activas'],
            ['15 años', 'en el mercado chileno'],
            ['Búsqueda IA', 'tecnología semántica'],
          ].map(([num, label]) => (
            <div key={num}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: INDIGO }}>{num}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
