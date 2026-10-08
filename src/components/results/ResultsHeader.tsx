import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Sparkles, Filter, X, ChevronDown,
  List, Map, Columns2, Bookmark, BookmarkCheck,
} from 'lucide-react';
import type { Filters, AdvancedFilters, ViewMode, OperationType, PropertyType } from '../../types/property';
import { zones_list } from '../../data/mockProperties';
import { activeCriteria, propertyTypePlural, removalPatch, splitPatch } from '../../search/criteria';

// Tokens del sistema de diseño (mismo valor que los colores anteriores; ver src/styles/ds-tokens/README.md)
const INDIGO = 'var(--tt-indigo)';
const INDIGO_50 = 'var(--tt-indigo-50)';
const FG1 = 'var(--tt-ink)';
const FG3 = 'var(--tt-ink-3)';
const DIVIDER = 'var(--tt-divider)';



interface ResultsHeaderProps {
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
  filters: Filters;
  onFiltersChange: (f: Partial<Filters>) => void;
  resultCount: number;
  onOpenFilters: () => void;
  savedSearch: boolean;
  onSaveSearch: () => void;
  advancedFilters?: AdvancedFilters;
  onAdvancedFiltersChange?: (f: Partial<AdvancedFilters>) => void;
  /** Asistente conversacional (único). `available` es falso en Mapa y Dividida mientras el panel no se integre ahí. */
  assistant?: { available: boolean; open: boolean; active: boolean; onOpen: () => void };
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); triggerRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, triggerRef]);

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
      type="button"
      aria-pressed={active}
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
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
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
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${label}`}
        style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
      >
        <X size={11} color={INDIGO} />
      </button>
    </span>
  );
}

// ── Commune input (Clásico) — varias comunas, entre ellas aplica OR ──
// Cada selección agrega una comuna; las elegidas aparecen como chips en la fila de criterios.

function CommuneInput({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);

  const filtered = text.trim()
    ? zones_list.filter(z => z.toLowerCase().includes(text.toLowerCase()))
    : zones_list;

  const toggle = (z: string) => {
    onChange(selected.includes(z) ? selected.filter(x => x !== z) : [...selected, z]);
    setText('');
  };

  const placeholder = selected.length === 0 ? 'Comuna o ciudad'
    : selected.length === 1 ? 'Agregar otra comuna'
    : `${selected.length} comunas · agregar`;

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: 190 }}>
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
        <Search size={13} color={FG3} style={{ flexShrink: 0 }} aria-hidden="true" />
        <input
          type="text"
          value={text}
          onChange={e => { setText(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' && filtered.length > 0) { e.preventDefault(); toggle(filtered[0]); }
          }}
          placeholder={placeholder}
          aria-label="Agregar comuna"
          aria-expanded={open}
          style={{
            flex: 1, border: 0, outline: 'none', background: 'transparent',
            fontSize: 13, color: FG1, fontFamily: 'inherit', minWidth: 0,
          }}
        />
        {text && (
          <button type="button" aria-label="Borrar texto" onMouseDown={() => setText('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={11} color={FG3} />
          </button>
        )}
      </div>
      <PortalPanel
        triggerRef={triggerRef}
        open={open}
        onClose={() => { setOpen(false); setText(''); }}
        minWidth={190}
      >
        <DropdownItem label="Todas las comunas" active={selected.length === 0} onClick={() => { onChange([]); setText(''); setOpen(false); }} />
        {filtered.slice(0, 12).map(z => (
          <DropdownItem key={z} label={z} active={selected.includes(z)} onClick={() => toggle(z)} />
        ))}
      </PortalPanel>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────

export function ResultsHeader({
  viewMode, onViewChange, filters, onFiltersChange,
  resultCount: _resultCount, onOpenFilters,
  savedSearch, onSaveSearch,
  advancedFilters, onAdvancedFiltersChange, assistant,
}: ResultsHeaderProps) {

  // Chips: una por criterio activo (la operación se muestra en su selector). Fuente única: search/criteria.
  const criteria = { ...filters, ...(advancedFilters ?? {}) } as Filters & AdvancedFilters;
  const applyPatch = (patch: ReturnType<typeof removalPatch>) => {
    const { filters: f, advanced: a } = splitPatch(patch);
    if (Object.keys(f).length) onFiltersChange(f);
    if (Object.keys(a).length) onAdvancedFiltersChange?.(a);
  };
  const chips = (advancedFilters ? activeCriteria(criteria, { exclude: ['operation'] }) : [])
    .map(c => ({ label: c.label, onRemove: () => applyPatch(removalPatch(criteria, c.key)) }));

  // "Más filtros" cuenta lo que vive en el panel (no operación, tipo ni comunas).
  const activeFilterCount = advancedFilters
    ? activeCriteria(criteria).filter(c => c.key !== 'operation' && c.key !== 'propertyType' && !c.key.startsWith('comuna:')).length
    : 0;
  const hasActiveFilters = activeFilterCount > 0;

  const opLabel = filters.operation === 'arriendo' ? 'Arrendar'
    : filters.operation === 'venta' ? 'Comprar'
    : 'Operación';
  const typeLabel = propertyTypePlural(filters.propertyType);

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

        <CommuneInput
          selected={filters.comunas}
          onChange={comunas => onFiltersChange({ comunas })}
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
          <DropdownItem
            label="Todos los tipos"
            active={filters.propertyType === null}
            onClick={() => onFiltersChange({ propertyType: null })}
          />
          {(['departamento', 'casa', 'oficina'] as PropertyType[]).map(t => (
            <DropdownItem
              key={t}
              label={t === 'departamento' ? 'Departamentos' : t === 'casa' ? 'Casas' : 'Oficinas'}
              active={filters.propertyType === t}
              onClick={() => onFiltersChange({ propertyType: filters.propertyType === t ? null : t })}
            />
          ))}
        </Dropdown>

        <button
          type="button"
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
          <Filter size={13} />
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

        {assistant && (
          // Acceso único al asistente conversacional. En Mapa y Dividida queda inactivo hasta integrar el panel.
          <button
            type="button"
            onClick={assistant.onOpen}
            aria-expanded={assistant.available ? assistant.open : undefined}
            aria-disabled={!assistant.available || undefined}
            title={assistant.available ? undefined : 'Disponible en la vista Lista'}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '0 12px', height: 36,
              border: `1px solid ${INDIGO}`, borderRadius: 4,
              background: assistant.open ? INDIGO : '#fff',
              color: assistant.open ? '#fff' : INDIGO,
              opacity: assistant.available ? 1 : 0.55,
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={13} aria-hidden="true" />
            Asistente{assistant.active && !assistant.open ? ' (conversación activa)' : ''}
          </button>
        )}

        <div style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <ViewSelector viewMode={viewMode} onViewChange={onViewChange} />
          <SaveButton saved={savedSearch} onSave={onSaveSearch} />
        </div>
      </div>

      {/* ── Row 2: active filter chips ── */}
      {chips.length > 0 && (
        <div className="seo-container" style={{ ...rowBase, paddingTop: 0, paddingBottom: 10, gap: 6, flexWrap: 'wrap' }}>
          {chips.map((chip, i) => (
            <ActiveChip key={i} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </div>
      )}

    </div>
  );
}
