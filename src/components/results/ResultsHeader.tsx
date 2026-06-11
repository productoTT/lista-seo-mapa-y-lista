import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Sparkles, SlidersHorizontal, X, ChevronDown,
  List, Map, Columns2, Bookmark, BookmarkCheck,
} from 'lucide-react';
import type { Filters, AdvancedFilters, ViewMode, OperationType, PropertyType } from '../../types/property';
import { zones_list } from '../../data/mockProperties';

const INDIGO = '#3200C1';
const MINT = '#37FFDB';
const INDIGO_50 = '#EAF2FC';
const FG1 = '#343A40';
const FG3 = '#666666';
const DIVIDER = '#E5E5E5';

const IA_SUGGESTIONS = [
  'Deptos en Providencia cerca de metro',
  'Departamento 2 dormitorios hasta 5.000 UF',
  'Propiedades con terraza y estacionamiento',
  'Casas en La Reina cerca de colegios',
  'Deptos nuevos en Ñuñoa',
];

const LOADING_STEPS_SEO = [
  'Interpretando búsqueda…',
  'Detectando filtros relevantes…',
  'Buscando propiedades compatibles…',
  'Ordenando resultados…',
  'Actualizando resultados…',
];

const ZONES_MAP_SEO: Record<string, string> = {
  'ñuñoa': 'Ñuñoa', 'providencia': 'Providencia', 'las condes': 'Las Condes',
  'vitacura': 'Vitacura', 'santiago centro': 'Santiago Centro', 'santiago': 'Santiago',
  'miraflores': 'Miraflores', 'la florida': 'La Florida', 'peñalolén': 'Peñalolén', 'la reina': 'La Reina',
};

function extractChipsSEO(q: string): string[] {
  const lower = q.toLowerCase();
  const chips: string[] = [];
  if (lower.includes('depto') || lower.includes('departamento') || lower.includes('dpto')) chips.push('Departamento');
  else if (lower.includes('casa')) chips.push('Casa');
  else if (lower.includes('oficina')) chips.push('Oficina');
  for (const z of Object.keys(ZONES_MAP_SEO)) {
    if (lower.includes(z)) { chips.push(ZONES_MAP_SEO[z]); break; }
  }
  const beds = lower.match(/(\d)\s*dorm/);
  if (beds) chips.push(`${beds[1]} dorm.`);
  const uf = lower.match(/(\d[\d.]*)\s*uf/i);
  if (uf) chips.push(`Hasta UF ${parseInt(uf[1].replace(/\./g, '')).toLocaleString('es-CL')}`);
  if (lower.includes('metro')) chips.push('Cerca de metro');
  if (lower.includes('terraza')) chips.push('Terraza');
  if (lower.includes('nueva') || lower.includes('nuevo')) chips.push('Nueva');
  return chips;
}

interface ResultsHeaderProps {
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
  filters: Filters;
  onFiltersChange: (f: Partial<Filters>) => void;
  query: string;
  resultCount: number;
  onOpenSemanticSearch: () => void;
  onOpenFilters: () => void;
  savedSearch: boolean;
  onSaveSearch: () => void;
  onSearch?: (q: string) => void;
  advancedFilters?: AdvancedFilters;
  onAdvancedFiltersChange?: (f: Partial<AdvancedFilters>) => void;
}

const VIEW_OPTIONS: { id: ViewMode; icon: typeof List; label: string }[] = [
  { id: 'lista', icon: List, label: 'Lista' },
  { id: 'mapa', icon: Map, label: 'Mapa' },
  { id: 'dividida', icon: Columns2, label: 'Dividida' },
];

// ── Portal panel — renders into document.body to escape stacking contexts ──

const PANEL_Z = 9999;

function useAnchoredPanel(triggerRef: React.RefObject<HTMLElement | null>, open: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = useCallback(() => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
  }, [triggerRef]);

  useEffect(() => {
    if (!open) return;
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, update]);

  return rect;
}

function PortalPanel({
  triggerRef, open, onClose, children, minWidth = 180,
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  minWidth?: number;
}) {
  const rect = useAnchoredPanel(triggerRef, open);
  if (!open || !rect) return null;

  // Decide whether to open downward or upward
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < 240 && rect.top > 240;

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    left: rect.left,
    ...(openUp
      ? { bottom: window.innerHeight - rect.top + 4 }
      : { top: rect.bottom + 4 }),
    minWidth: Math.max(rect.width, minWidth),
    background: '#fff',
    border: `1px solid ${DIVIDER}`,
    borderRadius: 8,
    padding: '4px 0',
    boxShadow: '0 4px 20px rgba(50,0,193,0.12)',
    zIndex: PANEL_Z,
    maxHeight: 260,
    overflowY: 'auto',
  };

  return createPortal(
    <>
      {/* Backdrop — also portal, below panel */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: PANEL_Z - 1 }}
        onMouseDown={onClose}
      />
      <div style={panelStyle}>
        {children}
      </div>
    </>,
    document.body
  );
}

// ── Shared sub-components ─────────────────────────────────

function ViewSelector({ viewMode, onViewChange }: { viewMode: ViewMode; onViewChange: (v: ViewMode) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: INDIGO_50, borderRadius: 6, padding: 3,
      height: 36, flexShrink: 0,
    }}>
      {VIEW_OPTIONS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          title={label}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 28,
            borderRadius: 4, border: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 120ms',
            ...(viewMode === id
              ? { background: INDIGO, color: '#fff' }
              : { background: 'transparent', color: INDIGO }),
          }}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}

function SaveButton({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      title={saved ? 'Búsqueda guardada' : 'Guardar búsqueda'}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 12px',
        border: `1px solid ${saved ? INDIGO : DIVIDER}`,
        borderRadius: 4,
        background: saved ? INDIGO_50 : '#fff',
        color: saved ? INDIGO : FG3,
        fontSize: 13, fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        flexShrink: 0,
      }}
    >
      {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      <span className="hidden xl:inline" style={{ fontSize: 13 }}>{saved ? 'Guardada' : 'Guardar'}</span>
    </button>
  );
}

function DropdownItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '8px 16px',
        border: 0, background: 'transparent',
        fontSize: 13,
        color: active ? INDIGO : FG1,
        fontWeight: active ? 700 : 400,
        cursor: 'pointer', fontFamily: 'inherit',
        display: 'block',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = INDIGO_50)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </button>
  );
}

// Portal-based dropdown trigger + panel
function Dropdown({
  label, active, children, minWidth = 180,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
  minWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(s => !s)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '0 12px', height: 36,
          border: `1px solid ${active ? INDIGO : DIVIDER}`,
          borderRadius: 4,
          background: active ? INDIGO_50 : '#fff',
          color: active ? INDIGO : FG1,
          fontSize: 13, fontWeight: active ? 700 : 500,
          cursor: 'pointer', fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        <ChevronDown
          size={12}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', color: FG3 }}
        />
      </button>
      <PortalPanel
        triggerRef={triggerRef}
        open={open}
        onClose={() => setOpen(false)}
        minWidth={minWidth}
      >
        {children}
      </PortalPanel>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: 'ia' | 'clasico'; onChange: (m: 'ia' | 'clasico') => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1px solid ${DIVIDER}`,
      borderRadius: 4, overflow: 'hidden',
      flexShrink: 0, height: 36,
    }}>
      {(['ia', 'clasico'] as const).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '0 10px', height: '100%',
            border: 0,
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            ...(mode === m
              ? { background: INDIGO, color: '#fff' }
              : { background: '#fff', color: FG3 }),
          }}
        >
          {m === 'ia' && <Sparkles size={10} />}
          {m === 'ia' ? 'Búsqueda IA' : 'Clásico'}
        </button>
      ))}
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px',
      background: INDIGO_50, color: INDIGO,
      border: `1px solid #C7D8FF`,
      borderRadius: 4, fontSize: 12, fontWeight: 600,
      flexShrink: 0,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
      >
        <X size={11} color={INDIGO} />
      </button>
    </span>
  );
}

// ── IA search input with portal suggestions ───────────────

function IaSearchInput({
  value, onChange, onSearch,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: (v: string) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = value.trim()
    ? IA_SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : IA_SUGGESTIONS;

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (s: string) => {
    onChange(s);
    setShowSuggestions(false);
    // Solo llena el input — el usuario debe presionar Buscar o Enter para ejecutar
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { setShowSuggestions(false); onSearch(value); }
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  // Compute anchor rect from the input wrapper div
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!showSuggestions) return;
    const update = () => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [showSuggestions]);

  return (
    <div ref={triggerRef} style={{ flex: 1, minWidth: 0, position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 36,
        border: `1px solid ${showSuggestions ? INDIGO : '#D8E7FF'}`,
        borderRadius: 4, background: '#fff',
        paddingLeft: 10, paddingRight: 6,
        transition: 'border-color 120ms',
      }}>
        <Sparkles size={14} color={INDIGO} style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder='Ej: "Depto cerca de metro en Providencia"'
          style={{
            flex: 1, border: 0, outline: 'none', background: 'transparent',
            fontSize: 13, color: FG1, fontFamily: 'inherit', minWidth: 0,
          }}
        />
        {value && (
          <button
            onMouseDown={e => { e.preventDefault(); onChange(''); inputRef.current?.focus(); }}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <X size={13} color={FG3} />
          </button>
        )}
      </div>

      {/* Portal suggestions */}
      {showSuggestions && filtered.length > 0 && rect && createPortal(
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: PANEL_Z - 1 }}
            onMouseDown={() => setShowSuggestions(false)}
          />
          <div style={{
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            background: '#fff',
            border: `1px solid ${DIVIDER}`,
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(50,0,193,0.12)',
            zIndex: PANEL_Z,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '6px 12px 4px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={11} color={INDIGO} />
              <span style={{ fontSize: 11, fontWeight: 700, color: INDIGO }}>Sugerencias IA</span>
            </div>
            {filtered.map((s, i) => (
              <button
                key={i}
                onMouseDown={() => handleSelect(s)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '8px 16px',
                  border: 0, background: 'transparent',
                  fontSize: 13, color: FG1,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = INDIGO_50)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Search size={12} color={FG3} style={{ flexShrink: 0 }} />
                {s}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// ── Commune input (Clásico) — portal suggestions ──────────

function CommuneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setText(value); }, [value]);

  const filtered = text.trim()
    ? zones_list.filter(z => z.toLowerCase().includes(text.toLowerCase()))
    : zones_list;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!zones_list.includes(text)) setText(value);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [text, value]);

  const handleSelect = (z: string) => {
    setText(z);
    onChange(z);
    setOpen(false);
  };

  const handleClear = () => { setText(''); onChange(''); };

  return (
    <div ref={containerRef} style={{ position: 'relative', flexShrink: 0, width: 190 }}>
      <div
        ref={triggerRef}
        style={{
          display: 'flex', alignItems: 'center',
          height: 36,
          border: `1px solid ${open ? INDIGO : DIVIDER}`,
          borderRadius: 4, background: '#fff',
          paddingLeft: 10, paddingRight: 8,
          transition: 'border-color 120ms',
          gap: 6,
        }}
      >
        <Search size={13} color={FG3} style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={text}
          onChange={e => { setText(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Comuna o ciudad"
          style={{
            flex: 1, border: 0, outline: 'none', background: 'transparent',
            fontSize: 13, color: FG1, fontFamily: 'inherit', minWidth: 0,
          }}
        />
        {text && (
          <button onMouseDown={handleClear} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={11} color={FG3} />
          </button>
        )}
      </div>
      <PortalPanel
        triggerRef={triggerRef}
        open={open}
        onClose={() => { setOpen(false); }}
        minWidth={190}
      >
        <DropdownItem label="Todas las comunas" active={!value} onClick={() => handleSelect('')} />
        {filtered.slice(0, 12).map(z => (
          <DropdownItem key={z} label={z} active={value === z} onClick={() => handleSelect(z)} />
        ))}
      </PortalPanel>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────

export function ResultsHeader({
  viewMode, onViewChange, filters, onFiltersChange,
  query, resultCount: _resultCount, onOpenFilters,
  savedSearch, onSaveSearch, onSearch,
  advancedFilters, onAdvancedFiltersChange,
}: ResultsHeaderProps) {
  const [searchMode, setSearchMode] = useState<'ia' | 'clasico'>('ia');
  const [iaText, setIaText] = useState(query || '');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaLoadingStep, setIaLoadingStep] = useState(0);
  const [iaLoadingChips, setIaLoadingChips] = useState<string[]>([]);
  const [iaChipsVisible, setIaChipsVisible] = useState(false);

  // Chips computation — basic filters
  const chips: { label: string; onRemove: () => void }[] = [];
  if (filters.zone) chips.push({ label: filters.zone, onRemove: () => onFiltersChange({ zone: '' }) });
  if (filters.propertyType) chips.push({
    label: filters.propertyType === 'departamento' ? 'Departamentos' : filters.propertyType === 'casa' ? 'Casas' : 'Oficinas',
    onRemove: () => onFiltersChange({ propertyType: null }),
  });
  if (filters.bedrooms !== null) chips.push({
    label: filters.bedrooms === 0 ? 'Studio' : `${filters.bedrooms} dorm.`,
    onRemove: () => onFiltersChange({ bedrooms: null }),
  });
  if (filters.priceMaxUF < 25000) chips.push({
    label: `Hasta UF ${filters.priceMaxUF.toLocaleString('es-CL')}`,
    onRemove: () => onFiltersChange({ priceMaxUF: 25000 }),
  });
  // Advanced filters chips
  if (advancedFilters && onAdvancedFiltersChange) {
    advancedFilters.status.forEach(s =>
      chips.push({ label: s === 'nueva' ? 'Nueva' : 'Usada', onRemove: () => onAdvancedFiltersChange({ status: advancedFilters.status.filter(x => x !== s) }) })
    );
    if (advancedFilters.barrio) chips.push({ label: advancedFilters.barrio, onRemove: () => onAdvancedFiltersChange({ barrio: '' }) });
    if (advancedFilters.bathroomsMin !== null) chips.push({ label: `${advancedFilters.bathroomsMin}+ baños`, onRemove: () => onAdvancedFiltersChange({ bathroomsMin: null, bathroomsMax: null }) });
    if (advancedFilters.sqmMin !== null || advancedFilters.sqmMax !== null) chips.push({ label: `${advancedFilters.sqmMin ?? 0}–${advancedFilters.sqmMax && advancedFilters.sqmMax < 9999 ? advancedFilters.sqmMax : '∞'} m²`, onRemove: () => onAdvancedFiltersChange({ sqmMin: null, sqmMax: null }) });
    if (advancedFilters.tourVirtual) chips.push({ label: 'Tour virtual', onRemove: () => onAdvancedFiltersChange({ tourVirtual: false }) });
    if (advancedFilters.video) chips.push({ label: 'Video', onRemove: () => onAdvancedFiltersChange({ video: false }) });
  }

  const activeFilterCount = [
    filters.priceMaxUF < 25000,
    filters.bedrooms !== null,
    (advancedFilters?.status.length ?? 0) > 0,
    !!advancedFilters?.barrio,
    advancedFilters?.bathroomsMin !== null,
    advancedFilters?.sqmMin !== null || advancedFilters?.sqmMax !== null,
    advancedFilters?.tourVirtual,
    advancedFilters?.video,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const opLabel = filters.operation === 'arriendo' ? 'Arrendar'
    : filters.operation === 'venta' ? 'Comprar'
    : 'Operación';
  const typeLabel = filters.propertyType === 'departamento' ? 'Departamentos'
    : filters.propertyType === 'casa' ? 'Casas'
    : filters.propertyType === 'oficina' ? 'Oficinas'
    : 'Tipo propiedad';

  const handleIaSearch = (q: string) => {
    const text = q.trim();
    if (!text || iaLoading) return;
    setIaText(text);
    setIaLoading(true);
    setIaLoadingStep(0);
    setIaChipsVisible(false);
    setIaLoadingChips(extractChipsSEO(text));

    const t1 = setTimeout(() => { setIaLoadingStep(1); setIaChipsVisible(true); }, 2000);
    const t2 = setTimeout(() => setIaLoadingStep(2), 4000);
    const t3 = setTimeout(() => setIaLoadingStep(3), 6000);
    const t4 = setTimeout(() => setIaLoadingStep(4), 8000);
    const t5 = setTimeout(() => {
      setIaLoading(false);
      setIaLoadingStep(0);
      setIaChipsVisible(false);
      onSearch?.(text);
    }, 9000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  };

  const rowBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    flexWrap: 'nowrap', overflowX: 'auto',
  };

  return (
    <div style={{
      background: '#fff',
      borderBottom: `1px solid ${DIVIDER}`,
      flexShrink: 0,
      // NOTE: no z-index here — avoid creating a stacking context that traps portal dropdowns
    }}>

      {/* ── Row 1: main bar ── */}
      <div className="seo-container" style={{ ...rowBase, paddingTop: 10, paddingBottom: 10 }}>

        <ModeToggle mode={searchMode} onChange={setSearchMode} />

        {searchMode === 'ia' ? (
          iaLoading ? (
            /* ── Compact inline loader ── */
            <div
              role="status"
              aria-live="polite"
              style={{
                flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8,
                height: 36, borderRadius: 4,
                border: `1px solid ${INDIGO}`,
                background: INDIGO_50,
                padding: '0 12px',
                overflow: 'hidden',
              }}
            >
              <Sparkles
                size={13}
                color={INDIGO}
                style={{ flexShrink: 0, animation: 'ia-sparkle-pulse 1.2s ease-in-out infinite' }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: INDIGO, flexShrink: 0 }}>
                {LOADING_STEPS_SEO[iaLoadingStep]}
              </span>
              <span style={{
                fontSize: 11, color: FG3,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flex: 1, minWidth: 0,
              }}>
                "{iaText}"
              </span>
            </div>
          ) : (
            <>
              <IaSearchInput
                value={iaText}
                onChange={setIaText}
                onSearch={handleIaSearch}
              />
              <button
                onClick={() => handleIaSearch(iaText)}
                disabled={iaLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0 16px', height: 36,
                  background: MINT, color: INDIGO,
                  border: 0, borderRadius: 4,
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >
                <Search size={13} />
                Buscar
              </button>
            </>
          )
        ) : (
          <>
            <CommuneInput
              value={filters.zone}
              onChange={z => onFiltersChange({ zone: z })}
            />

            <Dropdown label={opLabel} active={filters.operation !== null} minWidth={160}>
              <DropdownItem
                label="Comprar"
                active={filters.operation === 'venta'}
                onClick={() => onFiltersChange({ operation: filters.operation === 'venta' ? null : 'venta' as OperationType })}
              />
              <DropdownItem
                label="Arrendar"
                active={filters.operation === 'arriendo'}
                onClick={() => onFiltersChange({ operation: filters.operation === 'arriendo' ? null : 'arriendo' as OperationType })}
              />
            </Dropdown>

            <Dropdown label={typeLabel} active={filters.propertyType !== null} minWidth={160}>
              {(['departamento', 'casa', 'oficina'] as PropertyType[]).map(t => (
                <DropdownItem
                  key={t}
                  label={t === 'departamento' ? 'Departamentos' : t === 'casa' ? 'Casas' : 'Oficinas'}
                  active={filters.propertyType === t}
                  onClick={() => onFiltersChange({ propertyType: filters.propertyType === t ? null : t })}
                />
              ))}
            </Dropdown>
          </>
        )}

        <button
          onClick={onOpenFilters}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 12px', height: 36,
            border: `1px solid ${hasActiveFilters ? INDIGO : DIVIDER}`,
            borderRadius: 4,
            background: hasActiveFilters ? INDIGO_50 : '#fff',
            color: hasActiveFilters ? INDIGO : FG1,
            fontSize: 13, fontWeight: hasActiveFilters ? 700 : 500,
            cursor: 'pointer', fontFamily: 'inherit',
            flexShrink: 0, whiteSpace: 'nowrap',
          }}
        >
          <SlidersHorizontal size={13} />
          Más filtros
          {activeFilterCount > 0 && (
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              background: INDIGO, color: '#fff',
              fontSize: 9, fontWeight: 800,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{activeFilterCount}</span>
          )}
        </button>

        <div style={{
          marginLeft: searchMode === 'ia' ? 60 : 'auto',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <ViewSelector viewMode={viewMode} onViewChange={onViewChange} />
          <SaveButton saved={savedSearch} onSave={onSaveSearch} />
        </div>
      </div>

      {/* ── Row 2: active filter chips OR interpreted loading chips ── */}
      {(chips.length > 0 || (iaLoading && iaChipsVisible && iaLoadingChips.length > 0)) && (
        <div className="seo-container" style={{ ...rowBase, paddingTop: 0, paddingBottom: 10, gap: 6, flexWrap: 'wrap' }}>
          {iaLoading && iaChipsVisible
            ? iaLoadingChips.map((chip, i) => (
                <span
                  key={chip}
                  className="ia-chip"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 10px',
                    background: INDIGO_50, color: INDIGO,
                    border: '1px solid #C7D8FF',
                    borderRadius: 4, fontSize: 12, fontWeight: 600,
                    animation: 'ia-chip-in 0.25s ease both',
                    animationDelay: `${i * 60}ms`,
                    flexShrink: 0,
                  }}
                >
                  {chip}
                </span>
              ))
            : chips.map((chip, i) => (
                <ActiveChip key={i} label={chip.label} onRemove={chip.onRemove} />
              ))
          }
        </div>
      )}

      {/* Progress bar at bottom of header during IA loading */}
      {iaLoading && (
        <div style={{ height: 3, background: INDIGO_50, overflow: 'hidden' }}>
          <div
            className="ia-progress-bar"
            style={{
              height: '100%', width: '30%',
              background: `linear-gradient(90deg, ${INDIGO}, ${MINT})`,
              animation: 'ia-progress 1.1s ease-in-out infinite',
            }}
          />
        </div>
      )}
    </div>
  );
}
