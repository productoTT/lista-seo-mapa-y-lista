import { useState, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import type { Filters, AdvancedFilters, OperationType, PropertyType } from '../../types/property';
import { DEFAULT_FILTERS, PROPERTY_TYPE_LABELS } from '../../types/property';
import { zones_list } from '../../data/mockProperties';
import { RangeInputs } from '../modals/AdvancedFiltersContent';
import { SQM_PRESETS } from '../modals/filterPresets';
import { UF_CLP } from '../../data/uf';

// Tokens del sistema de diseño (mismo valor que los colores anteriores)
const INDIGO = 'var(--tt-indigo)';
const INDIGO_50 = 'var(--tt-indigo-50)';
const FG1 = 'var(--tt-ink)';

interface MobileSearchModalProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  advancedFilters: AdvancedFilters;
  onFiltersChange: (f: Partial<Filters>) => void;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
}

/**
 * Buscador mobile de resultados: solo búsqueda tradicional.
 * La pestaña "Búsqueda IA" anterior (que aplicaba filtros automáticamente) está desactivada:
 * el asistente nuevo todavía no se integra en mobile de resultados (ver docs/home-ia-preevaluacion).
 */
export function MobileSearchModal({
  open, onClose, filters, advancedFilters, onFiltersChange, onAdvancedFiltersChange,
}: MobileSearchModalProps) {
  // Estado local: se aplica solo al presionar Buscar
  const [localFilters, setLocalFilters] = useState<Filters>({ ...filters });
  const [localAdvanced, setLocalAdvanced] = useState<AdvancedFilters>({ ...advancedFilters });

  // Sincroniza al abrir
  useEffect(() => {
    if (open) {
      setLocalFilters({ ...filters });
      setLocalAdvanced({ ...advancedFilters });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Botón atrás del navegador: cierra el modal antes de navegar
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ searchModal: true }, '');
    const handler = () => onClose();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [open, onClose]);

  const handleClassicSearch = () => {
    onFiltersChange({ ...localFilters });
    onAdvancedFiltersChange({ ...localAdvanced });
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
          type="button"
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

      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <ClassicTab
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          localAdvanced={localAdvanced}
          setLocalAdvanced={setLocalAdvanced}
          onSearch={handleClassicSearch}
        />
      </div>
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

const PROP_TYPES_ORDER: PropertyType[] = [
  'departamento', 'casa', 'oficina', 'local_comercial', 'bodega',
  'estacionamiento', 'parcela', 'terreno', 'campo_agricola', 'industrial', 'vacacional',
];

const PROP_TYPES: { value: PropertyType | null; label: string }[] = [
  { value: null, label: 'Todos' },
  ...PROP_TYPES_ORDER.map(t => ({ value: t as PropertyType | null, label: PROPERTY_TYPE_LABELS[t] })),
];

// Dormitorios: Studio = solo estudios; "n+" = n o más.
const BEDROOMS_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Cualquiera' },
  { value: 0, label: 'Studio' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
];

const BATHROOMS_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
];

const PRICE_RANGES = [
  { min: 0, max: 4000 },
  { min: 4001, max: 6000 },
  { min: 6001, max: 10000 },
  { min: 10001, max: DEFAULT_FILTERS.priceMaxUF },
];

function priceRangeLabel(min: number, max: number, currency: 'UF' | 'CLP'): string {
  const isLast = max >= DEFAULT_FILTERS.priceMaxUF;
  if (currency === 'UF') {
    return isLast
      ? `UF ${min.toLocaleString('es-CL')} o más`
      : `UF ${min.toLocaleString('es-CL')} - UF ${max.toLocaleString('es-CL')}`;
  }
  const minClp = min * UF_CLP, maxClp = max * UF_CLP;
  return isLast
    ? `$${minClp.toLocaleString('es-CL')} o más`
    : `$${minClp.toLocaleString('es-CL')} - $${maxClp.toLocaleString('es-CL')}`;
}

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
          type="button"
          aria-pressed={current === o.value}
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
  const [expanded, setExpanded] = useState(false);
  const [bathFrom, setBathFrom] = useState('');
  const [bathTo, setBathTo] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [sqmFrom, setSqmFrom] = useState('');
  const [sqmTo, setSqmTo] = useState('');

  const setF = (partial: Partial<Filters>) => setLocalFilters({ ...localFilters, ...partial });
  const setA = (partial: Partial<AdvancedFilters>) => setLocalAdvanced({ ...localAdvanced, ...partial });

  const toggleStatus = (s: 'nueva' | 'usada') => {
    const current = localAdvanced.status;
    setA({ status: current.includes(s) ? current.filter(x => x !== s) : [...current, s] });
  };

  const currency = localAdvanced.priceCurrency;
  const activePriceRange = PRICE_RANGES.find(r => localFilters.priceMinUF === r.min && localFilters.priceMaxUF === r.max);
  const activeSqmPreset = SQM_PRESETS.find(p => localAdvanced.sqmMin === p.min && localAdvanced.sqmMax === p.max);

  const advancedActiveCount = [
    localAdvanced.status.length > 0,
    localFilters.bedrooms !== null,
    localAdvanced.bathroomsMin !== null || localAdvanced.bathroomsMax !== null,
    localFilters.priceMinUF > 0 || localFilters.priceMaxUF < DEFAULT_FILTERS.priceMaxUF,
    localAdvanced.sqmMin !== null || localAdvanced.sqmMax !== null,
  ].filter(Boolean).length;

  const toggleLabel = expanded
    ? 'Ocultar filtros'
    : advancedActiveCount > 0 ? `Más filtros · ${advancedActiveCount}` : 'Más filtros';

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '11px 36px 11px 14px', borderRadius: 10,
    border: '1.5px solid #E5E5E5', background: '#fff',
    fontSize: 14, fontFamily: 'Nunito, sans-serif',
    outline: 'none', appearance: 'none', cursor: 'pointer', minHeight: 44,
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Label>Operación</Label>
        <ChipRow<OperationType | null>
          options={[
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
        <Label>Región</Label>
        <div style={{ position: 'relative' }}>
          <select
            value={localAdvanced.region}
            onChange={e => {
              const region = e.target.value;
              setA({ region });
              if (!region) setF({ comunas: [] });
            }}
            style={{ ...selectStyle, color: localAdvanced.region ? FG1 : '#999' }}
          >
            <option value="">Región</option>
            <option value="Región Metropolitana">Región Metropolitana</option>
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
        </div>
      </div>

      <div>
        <Label>Comuna</Label>
        <div style={{ position: 'relative' }}>
          <select
            value={localFilters.comunas.length === 1 ? localFilters.comunas[0] : localFilters.comunas.length > 1 ? '__varias' : ''}
            onChange={e => setF({ comunas: e.target.value ? [e.target.value] : [] })}
            disabled={!localAdvanced.region}
            style={{
              ...selectStyle,
              color: localFilters.comunas.length ? FG1 : '#999',
              background: localAdvanced.region ? '#fff' : '#F5F5F5',
              cursor: localAdvanced.region ? 'pointer' : 'not-allowed',
            }}
          >
            <option value="">{localAdvanced.region ? 'Todas las comunas' : 'Selecciona una región primero'}</option>
            {/* Selección múltiple de comunas en mobile: pendiente de la revisión mobile. Aquí se muestra, pero se reemplaza al elegir una. */}
            {localFilters.comunas.length > 1 && <option value="__varias" disabled>{localFilters.comunas.length} comunas seleccionadas</option>}
            {localAdvanced.region && zones_list.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── Secondary disclosure control + expandable filters (single flex child, own internal spacing) ── */}
      <div>
        <button
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-controls="mobile-classic-more-filters"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', minHeight: 44,
            padding: '10px 0', margin: 0,
            border: 'none', borderTop: '1px solid #E5E5E5',
            background: 'transparent', color: '#555',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          {toggleLabel}
          <ChevronDown
            size={16}
            style={{ transition: 'transform 0.2s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {/* ── Expandable advanced filters ─────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: expanded ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.25s ease',
          }}
        >
        <div id="mobile-classic-more-filters" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 20 }}>

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

            {/* Barrio, tour virtual y video: ocultos en esta rama (no hay datos ni filtrado). */}

            <div>
              <Label>Dormitorios</Label>
              <ChipRow<number | null>
                options={BEDROOMS_OPTIONS}
                current={localFilters.bedrooms}
                onSelect={v => setF({ bedrooms: v })}
              />
            </div>

            <div>
              <Label>Baños</Label>
              <ChipRow<number | null>
                options={BATHROOMS_OPTIONS}
                current={localAdvanced.bathroomsMin}
                onSelect={v => setA({ bathroomsMin: localAdvanced.bathroomsMin === v ? null : v, bathroomsMax: null })}
              />
              <RangeInputs
                fromVal={bathFrom} toVal={bathTo}
                onFromChange={setBathFrom} onToChange={setBathTo}
                onApply={() => {
                  const from = parseInt(bathFrom);
                  const to = parseInt(bathTo);
                  setA({ bathroomsMin: isNaN(from) ? null : from, bathroomsMax: isNaN(to) ? null : to });
                  setBathFrom(''); setBathTo('');
                }}
              />
            </div>

            <div>
              <Label>Precios</Label>
              <div style={{ display: 'flex', gap: 0, border: '1px solid #E5E5E5', borderRadius: 4, overflow: 'hidden', width: 'fit-content', marginBottom: 10 }}>
                {(['CLP', 'UF'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setA({ priceCurrency: c })}
                    style={{
                      padding: '6px 18px', border: 0, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      ...(currency === c ? { background: INDIGO, color: '#fff' } : { background: '#fff', color: '#666' }),
                    }}
                  >
                    {c === 'CLP' ? '$' : 'UF'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PRICE_RANGES.map(r => (
                  <button
                    key={`${r.min}-${r.max}`}
                    onClick={() => {
                      if (activePriceRange?.min === r.min && activePriceRange?.max === r.max) {
                        setF({ priceMinUF: 0, priceMaxUF: DEFAULT_FILTERS.priceMaxUF });
                      } else {
                        setF({ priceMinUF: r.min, priceMaxUF: r.max });
                      }
                    }}
                    style={{
                      padding: '8px 14px', textAlign: 'left', borderRadius: 8,
                      border: `1.5px solid ${activePriceRange?.min === r.min && activePriceRange?.max === r.max ? INDIGO : '#E5E5E5'}`,
                      background: activePriceRange?.min === r.min && activePriceRange?.max === r.max ? INDIGO_50 : '#fff',
                      color: activePriceRange?.min === r.min && activePriceRange?.max === r.max ? INDIGO : '#555',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minHeight: 40,
                    }}
                  >
                    {priceRangeLabel(r.min, r.max, currency)}
                  </button>
                ))}
              </div>
              <RangeInputs
                fromVal={priceFrom} toVal={priceTo}
                onFromChange={setPriceFrom} onToChange={setPriceTo}
                placeholder="UF"
                onApply={() => {
                  const from = parseFloat(priceFrom);
                  const to = parseFloat(priceTo);
                  setF({ priceMinUF: isNaN(from) ? 0 : from, priceMaxUF: isNaN(to) ? DEFAULT_FILTERS.priceMaxUF : to });
                  setPriceFrom(''); setPriceTo('');
                }}
              />
            </div>

            <div>
              <Label>Superficie útil</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SQM_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      if (activeSqmPreset?.label === preset.label) {
                        setA({ sqmMin: null, sqmMax: null });
                      } else {
                        setA({ sqmMin: preset.min, sqmMax: preset.max });
                      }
                    }}
                    style={{
                      padding: '7px 14px', borderRadius: 20,
                      border: `1.5px solid ${activeSqmPreset?.label === preset.label ? INDIGO : '#E5E5E5'}`,
                      background: activeSqmPreset?.label === preset.label ? INDIGO_50 : '#fff',
                      color: activeSqmPreset?.label === preset.label ? INDIGO : '#555',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minHeight: 36,
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <RangeInputs
                fromVal={sqmFrom} toVal={sqmTo}
                onFromChange={setSqmFrom} onToChange={setSqmTo}
                placeholder="m²"
                onApply={() => {
                  const from = parseFloat(sqmFrom);
                  const to = parseFloat(sqmTo);
                  setA({ sqmMin: isNaN(from) ? null : from, sqmMax: isNaN(to) ? null : to });
                  setSqmFrom(''); setSqmTo('');
                }}
              />
            </div>

          </div>
        </div>
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
