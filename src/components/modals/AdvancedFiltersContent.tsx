import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import type { Filters, AdvancedFilters } from '../../types/property';

const INDIGO = '#3200C1';
const INDIGO_50 = '#EAF2FC';
const FG1 = '#343A40';
const FG3 = '#666666';
const DIVIDER = '#E5E5E5';

const BARRIOS = [
  'Plaza Ñuñoa', 'Irarrázaval', 'Simón Bolívar', 'Metro Chile España',
  'Los Dominicos', 'Escuela Militar', 'Pocuro', 'Pedro de Valdivia',
];

const PRICE_PRESETS: Record<'UF' | 'CLP', { label: string; minUF: number; maxUF: number }[]> = {
  UF: [
    { label: 'Hasta UF 3.500', minUF: 0, maxUF: 3500 },
    { label: 'UF 3.501 a UF 5.000', minUF: 3501, maxUF: 5000 },
    { label: 'UF 5.001 a UF 8.500', minUF: 5001, maxUF: 8500 },
    { label: 'Más de UF 8.500', minUF: 8501, maxUF: 25000 },
  ],
  CLP: [
    { label: 'Hasta $146.236.040', minUF: 0, maxUF: 3500 },
    { label: '$146.236.041 a $219.354.060', minUF: 3501, maxUF: 5000 },
    { label: '$219.354.061 a $365.590.100', minUF: 5001, maxUF: 8500 },
    { label: 'Más de $365.590.101', minUF: 8501, maxUF: 25000 },
  ],
};

const SQM_PRESETS = [
  { label: 'Hasta 50 m²', min: 0, max: 50 },
  { label: '50 a 100 m²', min: 50, max: 100 },
  { label: 'Más de 100 m²', min: 100, max: 9999 },
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
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }} onClick={onChange}>
      <div style={{
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

function RangeInputs({
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
        style={{ flex: 1, minWidth: 0, height: 34, padding: '0 8px', border: `1px solid ${DIVIDER}`, borderRadius: 4, fontSize: 12, outline: 'none', fontFamily: 'inherit', color: FG1, background: '#FAFAFA' }}
      />
      <span style={{ fontSize: 12, color: FG3, flexShrink: 0 }}>–</span>
      <input
        type="number"
        value={toVal}
        onChange={e => onToChange(e.target.value)}
        placeholder="Hasta"
        style={{ flex: 1, minWidth: 0, height: 34, padding: '0 8px', border: `1px solid ${DIVIDER}`, borderRadius: 4, fontSize: 12, outline: 'none', fontFamily: 'inherit', color: FG1, background: '#FAFAFA' }}
      />
      <button
        onClick={onApply}
        title="Aplicar rango"
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
  const [bedFrom, setBedFrom] = useState('');
  const [bedTo, setBedTo] = useState('');
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

  // All active chips (shown at top of panel)
  const allChips: { label: string; onRemove: () => void }[] = [];
  advancedFilters.status.forEach(s =>
    allChips.push({ label: s === 'nueva' ? 'Nueva' : 'Usada', onRemove: () => onAdvancedFiltersChange({ status: advancedFilters.status.filter(x => x !== s) }) })
  );
  if (advancedFilters.barrio) allChips.push({ label: advancedFilters.barrio, onRemove: () => onAdvancedFiltersChange({ barrio: '' }) });
  if (filters.bedrooms !== null) allChips.push({ label: filters.bedrooms === 0 ? 'Studio' : `${filters.bedrooms} dorm.`, onRemove: () => onFiltersChange({ bedrooms: null }) });
  if (advancedFilters.bathroomsMin !== null) allChips.push({ label: `${advancedFilters.bathroomsMin}+ baños`, onRemove: () => onAdvancedFiltersChange({ bathroomsMin: null, bathroomsMax: null }) });
  if (filters.priceMaxUF < 25000) allChips.push({ label: `Hasta UF ${filters.priceMaxUF.toLocaleString('es-CL')}`, onRemove: () => onFiltersChange({ priceMinUF: 0, priceMaxUF: 25000 }) });
  if (advancedFilters.sqmMin !== null || advancedFilters.sqmMax !== null) allChips.push({ label: `${advancedFilters.sqmMin ?? 0}–${advancedFilters.sqmMax && advancedFilters.sqmMax < 9999 ? advancedFilters.sqmMax : '∞'} m²`, onRemove: () => onAdvancedFiltersChange({ sqmMin: null, sqmMax: null }) });
  if (advancedFilters.tourVirtual) allChips.push({ label: 'Tour virtual', onRemove: () => onAdvancedFiltersChange({ tourVirtual: false }) });
  if (advancedFilters.video) allChips.push({ label: 'Video', onRemove: () => onAdvancedFiltersChange({ video: false }) });

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
              {allChips.map((chip, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: INDIGO_50, color: INDIGO, border: `1px solid #C7D8FF`, borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                  {chip.label}
                  <button onClick={chip.onRemove} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
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

      {/* C. Barrio */}
      <div style={sec}>
        <SectionTitle>Barrio</SectionTitle>
        <select
          value={advancedFilters.barrio}
          onChange={e => onAdvancedFiltersChange({ barrio: e.target.value })}
          style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${DIVIDER}`, borderRadius: 4, fontSize: 13, outline: 'none', cursor: 'pointer', color: advancedFilters.barrio ? FG1 : FG3, background: '#fff', fontFamily: 'inherit' }}
        >
          <option value="">Barrio</option>
          {BARRIOS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <hr style={hr} />

      {/* D. Dormitorios */}
      <div style={sec}>
        <SectionTitle>Dormitorios</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[{ label: 'Studio', val: 0 }, { label: '1', val: 1 }, { label: '2', val: 2 }, { label: '3', val: 3 }, { label: '4+', val: 4 }].map(({ label, val }) => (
            <QuickBtn
              key={val}
              active={filters.bedrooms === val}
              onClick={() => onFiltersChange({ bedrooms: filters.bedrooms === val ? null : val })}
            >
              {label}
            </QuickBtn>
          ))}
        </div>
        <RangeInputs
          fromVal={bedFrom} toVal={bedTo}
          onFromChange={setBedFrom} onToChange={setBedTo}
          onApply={() => {
            const from = parseInt(bedFrom);
            if (!isNaN(from)) onFiltersChange({ bedrooms: from });
            setBedFrom(''); setBedTo('');
          }}
        />
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
              onClick={() => onAdvancedFiltersChange({ bathroomsMin: advancedFilters.bathroomsMin === n ? null : n })}
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
      <hr style={hr} />

      {/* H. Multimedia */}
      <div style={sec}>
        <SectionTitle>Multimedia</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Checkbox
            checked={advancedFilters.tourVirtual}
            onChange={() => onAdvancedFiltersChange({ tourVirtual: !advancedFilters.tourVirtual })}
            label="Tour virtual"
          />
          <Checkbox
            checked={advancedFilters.video}
            onChange={() => onAdvancedFiltersChange({ video: !advancedFilters.video })}
            label="Video"
          />
        </div>
      </div>
    </div>
  );
}
