import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import type { Filters, AdvancedFilters } from '../../types/property';
import { SQM_PRESETS } from './filterPresets';
import { ufToClp } from '../../data/uf';
import { activeCriteria, removalPatch, splitPatch } from '../../search/criteria';

// Tokens del sistema de diseño (mismo valor que los colores anteriores; ver src/styles/ds-tokens/README.md)
const INDIGO = 'var(--tt-indigo)';
const INDIGO_50 = 'var(--tt-indigo-50)';
const FG1 = 'var(--tt-ink)';
const FG3 = 'var(--tt-ink-3)';
const DIVIDER = 'var(--tt-divider)';

// Rangos de precio actuales (se conservan). Los montos en pesos se calculan con la UF ficticia única del prototipo.
const PRICE_RANGES_UF = [
  { minUF: 0, maxUF: 3500 },
  { minUF: 3501, maxUF: 5000 },
  { minUF: 5001, maxUF: 8500 },
  { minUF: 8501, maxUF: 25000 },
];
const clp = (uf: number) => `$${ufToClp(uf).toLocaleString('es-CL')}`;
const ufl = (uf: number) => `UF ${uf.toLocaleString('es-CL')}`;
const PRICE_PRESETS: Record<'UF' | 'CLP', { label: string; minUF: number; maxUF: number }[]> = {
  UF: PRICE_RANGES_UF.map((r, i) => ({
    ...r,
    label: i === 0 ? `Hasta ${ufl(r.maxUF)}` : i === PRICE_RANGES_UF.length - 1 ? `Más de ${ufl(r.minUF - 1)}` : `${ufl(r.minUF)} a ${ufl(r.maxUF)}`,
  })),
  CLP: PRICE_RANGES_UF.map((r, i) => ({
    ...r,
    label: i === 0 ? `Hasta ${clp(r.maxUF)}` : i === PRICE_RANGES_UF.length - 1 ? `Más de ${clp(r.minUF - 1)}` : `${clp(r.minUF)} a ${clp(r.maxUF)}`,
  })),
};

// Dormitorios: Studio = solo estudios; "n+" = n o más.
const BEDROOM_OPTIONS: { label: string; val: number | null }[] = [
  { label: 'Cualquiera', val: null },
  { label: 'Studio', val: 0 },
  { label: '1+', val: 1 },
  { label: '2+', val: 2 },
  { label: '3+', val: 3 },
  { label: '4+', val: 4 },
];

// ── Shared mini components ────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: FG3, margin: '0 0 12px' }}>
      {children}
    </p>
  );
}

function QuickBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        padding: '6px 14px',
        border: `1px solid ${active ? INDIGO : DIVIDER}`,
        borderRadius: 4,
        background: active ? INDIGO : '#fff',
        color: active ? '#fff' : FG1,
        fontSize: 13, fontWeight: active ? 700 : 400,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 120ms',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  // Casilla nativa (accesible por teclado y lector de pantalla) con la misma apariencia de antes.
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', position: 'relative' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ position: 'absolute', opacity: 0, width: 18, height: 18, margin: 0, cursor: 'pointer' }}
      />
      <div aria-hidden="true" style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        border: `2px solid ${checked ? INDIGO : '#C4C4C4'}`,
        background: checked ? INDIGO : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 120ms',
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 13, color: FG1 }}>{label}</span>
    </label>
  );
}

export function RangeInputs({
  fromVal, toVal, onFromChange, onToChange, onApply, placeholder,
}: {
  fromVal: string; toVal: string;
  onFromChange: (v: string) => void; onToChange: (v: string) => void;
  onApply: () => void; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
      <input
        type="number"
        value={fromVal}
        onChange={e => onFromChange(e.target.value)}
        placeholder={placeholder ? `${placeholder} mín.` : 'Desde'}
        aria-label={placeholder ? `${placeholder} desde` : 'Desde'}
        style={{ flex: 1, minWidth: 0, height: 34, padding: '0 8px', border: `1px solid ${DIVIDER}`, borderRadius: 4, fontSize: 12, outline: 'none', fontFamily: 'inherit', color: FG1, background: '#FAFAFA' }}
      />
      <span style={{ fontSize: 12, color: FG3, flexShrink: 0 }}>–</span>
      <input
        type="number"
        value={toVal}
        onChange={e => onToChange(e.target.value)}
        placeholder="Hasta"
        aria-label={placeholder ? `${placeholder} hasta` : 'Hasta'}
        style={{ flex: 1, minWidth: 0, height: 34, padding: '0 8px', border: `1px solid ${DIVIDER}`, borderRadius: 4, fontSize: 12, outline: 'none', fontFamily: 'inherit', color: FG1, background: '#FAFAFA' }}
      />
      <button
        type="button"
        onClick={onApply}
        title="Aplicar rango"
        aria-label="Aplicar rango"
        style={{ width: 34, height: 34, background: INDIGO, color: '#fff', border: 0, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────

export interface AdvancedFiltersContentProps {
  filters: Filters;
  onFiltersChange: (f: Partial<Filters>) => void;
  advancedFilters: AdvancedFilters;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
}

export function AdvancedFiltersContent({
  filters, onFiltersChange, advancedFilters, onAdvancedFiltersChange,
}: AdvancedFiltersContentProps) {
  const [bathFrom, setBathFrom] = useState('');
  const [bathTo, setBathTo] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [sqmFrom, setSqmFrom] = useState('');
  const [sqmTo, setSqmTo] = useState('');

  const currency = advancedFilters.priceCurrency;
  const pricePresets = PRICE_PRESETS[currency];

  const activePricePreset = pricePresets.find(
    p => filters.priceMinUF === p.minUF && filters.priceMaxUF === p.maxUF
  );
  const activeSqmPreset = SQM_PRESETS.find(
    p => advancedFilters.sqmMin === p.min && advancedFilters.sqmMax === p.max
  );

  // Chips del panel: lo que vive en "Más filtros" (sin operación, tipo ni comunas). Fuente única: search/criteria.
  const criteria = { ...filters, ...advancedFilters };
  const allChips = activeCriteria(criteria)
    .filter(c => c.key !== 'operation' && c.key !== 'propertyType' && !c.key.startsWith('comuna:'))
    .map(c => ({
      key: c.key,
      label: c.label,
      onRemove: () => {
        const { filters: f, advanced: a } = splitPatch(removalPatch(criteria, c.key));
        if (Object.keys(f).length) onFiltersChange(f);
        if (Object.keys(a).length) onAdvancedFiltersChange(a);
      },
    }));

  const sec: React.CSSProperties = { padding: '16px 0' };
  const hr: React.CSSProperties = { border: 'none', borderTop: `1px solid ${DIVIDER}`, margin: 0 };

  return (
    <div>
      {/* A. Filtros aplicados */}
      {allChips.length > 0 && (
        <>
          <div style={sec}>
            <SectionTitle>Filtros aplicados</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {allChips.map(chip => (
                <span key={chip.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: INDIGO_50, color: INDIGO, border: `1px solid #C7D8FF`, borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                  {chip.label}
                  <button type="button" onClick={chip.onRemove} aria-label={`Quitar ${chip.label}`} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={10} color={INDIGO} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <hr style={hr} />
        </>
      )}

      {/* B. Estado */}
      <div style={sec}>
        <SectionTitle>Estado</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Checkbox
            checked={advancedFilters.status.includes('nueva')}
            onChange={() => {
              const has = advancedFilters.status.includes('nueva');
              onAdvancedFiltersChange({ status: has ? advancedFilters.status.filter(s => s !== 'nueva') : [...advancedFilters.status, 'nueva'] });
            }}
            label="Nueva"
          />
          <Checkbox
            checked={advancedFilters.status.includes('usada')}
            onChange={() => {
              const has = advancedFilters.status.includes('usada');
              onAdvancedFiltersChange({ status: has ? advancedFilters.status.filter(s => s !== 'usada') : [...advancedFilters.status, 'usada'] });
            }}
            label="Usada"
          />
        </div>
      </div>
      <hr style={hr} />

      {/* Barrio: oculto en esta rama (no hay datos de barrio). */}

      {/* D. Dormitorios */}
      <div style={sec}>
        <SectionTitle>Dormitorios</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {BEDROOM_OPTIONS.map(({ label, val }) => (
            <QuickBtn
              key={label}
              active={filters.bedrooms === val}
              onClick={() => onFiltersChange({ bedrooms: val })}
            >
              {label}
            </QuickBtn>
          ))}
        </div>
      </div>
      <hr style={hr} />

      {/* E. Baños */}
      <div style={sec}>
        <SectionTitle>Baños</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[1, 2, 3, 4].map(n => (
            <QuickBtn
              key={n}
              active={advancedFilters.bathroomsMin === n}
              onClick={() => onAdvancedFiltersChange({ bathroomsMin: advancedFilters.bathroomsMin === n ? null : n, bathroomsMax: null })}
            >
              {n === 4 ? '4+' : n}
            </QuickBtn>
          ))}
        </div>
        <RangeInputs
          fromVal={bathFrom} toVal={bathTo}
          onFromChange={setBathFrom} onToChange={setBathTo}
          onApply={() => {
            const from = parseInt(bathFrom);
            const to = parseInt(bathTo);
            onAdvancedFiltersChange({ bathroomsMin: isNaN(from) ? null : from, bathroomsMax: isNaN(to) ? null : to });
            setBathFrom(''); setBathTo('');
          }}
        />
      </div>
      <hr style={hr} />

      {/* F. Precios */}
      <div style={sec}>
        <SectionTitle>Precios</SectionTitle>
        <div style={{ display: 'flex', gap: 0, border: `1px solid ${DIVIDER}`, borderRadius: 4, overflow: 'hidden', width: 'fit-content', marginBottom: 12 }}>
          {(['CLP', 'UF'] as const).map(c => (
            <button
              key={c}
              onClick={() => onAdvancedFiltersChange({ priceCurrency: c })}
              style={{
                padding: '5px 18px', border: 0, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                ...(currency === c ? { background: INDIGO, color: '#fff' } : { background: '#fff', color: FG3 }),
              }}
            >
              {c === 'CLP' ? '$' : 'UF'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pricePresets.map(preset => (
            <QuickBtn
              key={preset.label}
              active={activePricePreset?.label === preset.label}
              onClick={() => {
                if (activePricePreset?.label === preset.label) {
                  onFiltersChange({ priceMinUF: 0, priceMaxUF: 25000 });
                } else {
                  onFiltersChange({ priceMinUF: preset.minUF, priceMaxUF: preset.maxUF });
                }
              }}
            >
              {preset.label}
            </QuickBtn>
          ))}
        </div>
        <RangeInputs
          fromVal={priceFrom} toVal={priceTo}
          onFromChange={setPriceFrom} onToChange={setPriceTo}
          placeholder="UF"
          onApply={() => {
            const from = parseFloat(priceFrom);
            const to = parseFloat(priceTo);
            onFiltersChange({ priceMinUF: isNaN(from) ? 0 : from, priceMaxUF: isNaN(to) ? 25000 : to });
            setPriceFrom(''); setPriceTo('');
          }}
        />
      </div>
      <hr style={hr} />

      {/* G. Superficie útil */}
      <div style={sec}>
        <SectionTitle>Superficie útil</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SQM_PRESETS.map(preset => (
            <QuickBtn
              key={preset.label}
              active={activeSqmPreset?.label === preset.label}
              onClick={() => {
                if (activeSqmPreset?.label === preset.label) {
                  onAdvancedFiltersChange({ sqmMin: null, sqmMax: null });
                } else {
                  onAdvancedFiltersChange({ sqmMin: preset.min, sqmMax: preset.max });
                }
              }}
            >
              {preset.label}
            </QuickBtn>
          ))}
        </div>
        <RangeInputs
          fromVal={sqmFrom} toVal={sqmTo}
          onFromChange={setSqmFrom} onToChange={setSqmTo}
          placeholder="m²"
          onApply={() => {
            const from = parseFloat(sqmFrom);
            const to = parseFloat(sqmTo);
            onAdvancedFiltersChange({ sqmMin: isNaN(from) ? null : from, sqmMax: isNaN(to) ? null : to });
            setSqmFrom(''); setSqmTo('');
          }}
        />
      </div>

      {/* Multimedia (tour virtual, video): oculto en esta rama (no hay datos). */}
    </div>
  );
}
