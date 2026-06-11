import { useState } from 'react';
import { Bed, Bath, Maximize2, Heart, HeartOff, Phone, Eye } from 'lucide-react';
import type { Property } from '../../types/property';
import { formatPriceUF } from '../../data/mockProperties';

// ── DS tokens ─────────────────────────────────────────────
const INDIGO = '#3200C1';
const INDIGO_DARK = '#24018A';
const INDIGO_50 = '#EAF2FC';
const FG1 = '#343A40';
const FG3 = '#666666';
const MINT = '#37FFDB';
const PINK = '#F05C89';
const DIVIDER = '#E5E5E5';
const SURFACE = '#fff';

// ── Helpers ───────────────────────────────────────────────

function getTypeLabel(p: Property): string {
  const t = p.type === 'departamento' ? 'Departamento' : p.type === 'casa' ? 'Casa' : 'Oficina';
  const op = p.operation === 'arriendo' ? 'Arriendo' : p.isNewProject ? 'Venta nuevo' : 'Venta';
  return `${t} · ${op}`;
}

function getFlagInfo(p: Property): { label: string; bg: string; color: string } | null {
  if (p.commercialStatus === 'ai_recommended') return { label: '✦ Recomendado IA', bg: MINT, color: INDIGO };
  if (p.commercialStatus === 'featured') return { label: 'Destacado', bg: '#F97316', color: '#fff' };
  if (p.commercialStatus === 'sponsored') return { label: 'Publicidad', bg: '#6B7280', color: '#fff' };
  if (p.badges.includes('price_drop')) return { label: 'Precio rebajado', bg: '#FF8C00', color: '#fff' };
  if (p.badges.includes('new')) return { label: 'Nuevo', bg: PINK, color: '#fff' };
  if (p.isNewProject) return { label: 'Proyecto', bg: INDIGO, color: MINT };
  return null;
}

function formatPricePrimary(p: Property): string {
  if (p.operation === 'arriendo') return `$ ${p.price.toLocaleString('es-CL')}`;
  return formatPriceUF(p.priceUF);
}

function formatPriceAlt(p: Property): string {
  if (p.operation === 'arriendo') return '/ mes';
  return `/ $ ${p.price.toLocaleString('es-CL')}`;
}

// ── Icon paths (Phosphor-style, matching DS exactly) ──────

const IconBed = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="none" stroke={INDIGO} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 184V72"/><path d="M232 184v-40a24 24 0 0 0-24-24H120v64"/>
    <line x1="24" y1="160" x2="232" y2="160"/><circle cx="68" cy="128" r="20"/>
  </svg>
);

const IconBath = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="none" stroke={INDIGO} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 128h208v40a32 32 0 0 1-32 32H56a32 32 0 0 1-32-32Z"/>
    <path d="M56 128V56a16 16 0 0 1 16-16h16a16 16 0 0 1 16 16v8"/>
    <line x1="48" y1="200" x2="40" y2="216"/><line x1="208" y1="200" x2="216" y2="216"/>
  </svg>
);

const IconArea = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="none" stroke={INDIGO} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
    <rect x="40" y="40" width="176" height="176" rx="8"/>
    <polyline points="160 80 80 80 80 160"/><polyline points="96 176 176 176 176 96"/>
  </svg>
);

// ── Props ─────────────────────────────────────────────────

interface PropertyResultCardProps {
  property: Property;
  isHighlighted?: boolean;
  isSaved?: boolean;
  onSelect: (id: string) => void;
  onSave?: (id: string) => void;
  onHoverEnter?: (id: string) => void;
  onHoverLeave?: () => void;
  layout?: 'vertical' | 'horizontal';
}

// ── Card vertical (lista grid) ────────────────────────────

function VerticalCard({
  property, isHighlighted, isSaved, onSelect, onSave, onHoverEnter, onHoverLeave,
}: PropertyResultCardProps) {
  const [hover, setHover] = useState(false);
  const { id, title, zone, bedrooms, bathrooms, sqm } = property;
  const flag = getFlagInfo(property);
  const active = isHighlighted || hover;

  return (
    <div
      onClick={() => onSelect(id)}
      onMouseEnter={() => { setHover(true); onHoverEnter?.(id); }}
      onMouseLeave={() => { setHover(false); onHoverLeave?.(); }}
      style={{
        background: SURFACE,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: active
          ? '0 8px 24px rgba(34,17,96,.10)'
          : '0 4px 12px rgba(34,17,96,.06)',
        cursor: 'pointer',
        transition: 'box-shadow 180ms',
        display: 'flex',
        flexDirection: 'column',
        outline: active ? `2px solid ${INDIGO}` : '2px solid transparent',
      }}
    >
      {/* ── Photo ── */}
      <div style={{ height: 168, position: 'relative', overflow: 'hidden' }}>
        <img
          src={property.imageUrl}
          alt={title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {flag && (
          <span style={{
            position: 'absolute', top: 10, left: 12,
            background: flag.bg, color: flag.color,
            fontSize: 11, fontWeight: 700,
            padding: '4px 8px', borderRadius: 4,
            letterSpacing: '0.01em',
            lineHeight: 1,
          }}>
            {flag.label}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onSave?.(id); }}
          style={{
            position: 'absolute', top: 10, right: 12,
            width: 30, height: 30,
            background: SURFACE, borderRadius: 999,
            border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          {isSaved
            ? <HeartOff size={14} color={PINK} />
            : <Heart size={14} color={INDIGO} />
          }
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ fontSize: 12, color: FG3, fontWeight: 600 }}>{zone}</div>
        <div style={{ fontSize: 12, color: FG3 }}>{getTypeLabel(property)}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: FG1, marginTop: 2, lineHeight: 1.3 }}>{title}</div>

        {/* Specs */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          marginTop: 6, paddingTop: 8, paddingBottom: 8,
          borderTop: `1px solid ${DIVIDER}`,
          borderBottom: `1px solid ${DIVIDER}`,
        }}>
          {bedrooms > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: FG1 }}>
              <IconBed /> {bedrooms}
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: FG1 }}>
            <IconBath /> {bathrooms}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: FG1 }}>
            <IconArea /> {sqm} m²
          </span>
        </div>

        {/* Price */}
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 11, color: FG3 }}>
            {property.operation === 'arriendo' ? 'Arriendo' : 'Desde'}
          </div>
          <div style={{ marginTop: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: INDIGO, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              {formatPricePrimary(property)}
            </span>
            <span style={{ fontSize: 13, color: FG3, marginLeft: 4 }}>
              {formatPriceAlt(property)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <button
            onClick={e => { e.stopPropagation(); onSelect(id); }}
            style={{
              width: '100%',
              background: INDIGO, color: '#fff',
              border: 0, borderRadius: 4,
              padding: '9px 14px',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: `background-color 180ms`,
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = INDIGO_DARK)}
            onMouseLeave={e => (e.currentTarget.style.background = INDIGO)}
          >
            <Phone size={13} /> Cotizar
          </button>
          <button
            onClick={e => { e.stopPropagation(); onSelect(id); }}
            style={{
              width: '100%',
              background: SURFACE, color: INDIGO,
              border: 0, borderRadius: 4,
              padding: '9px 14px',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: `0 0 0 1px ${INDIGO} inset`,
              transition: `background-color 180ms`,
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = INDIGO_50)}
            onMouseLeave={e => (e.currentTarget.style.background = SURFACE)}
          >
            <Eye size={13} /> Ver más
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card horizontal (dividida) ────────────────────────────

function HorizontalCard({
  property, isHighlighted, isSaved, onSelect, onSave, onHoverEnter, onHoverLeave,
}: PropertyResultCardProps) {
  const [hover, setHover] = useState(false);
  const { id, title, zone, bedrooms, bathrooms, sqm } = property;
  const flag = getFlagInfo(property);
  const active = isHighlighted || hover;

  return (
    <div
      onClick={() => onSelect(id)}
      onMouseEnter={() => { setHover(true); onHoverEnter?.(id); }}
      onMouseLeave={() => { setHover(false); onHoverLeave?.(); }}
      style={{
        background: SURFACE,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: active
          ? '0 8px 24px rgba(34,17,96,.10)'
          : '0 2px 8px rgba(34,17,96,.06)',
        cursor: 'pointer',
        transition: 'box-shadow 180ms',
        display: 'flex',
        outline: active ? `2px solid ${INDIGO}` : '2px solid transparent',
      }}
    >
      {/* Image */}
      <div style={{ width: 148, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <img
          src={property.imageUrl}
          alt={title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {flag && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            background: flag.bg, color: flag.color,
            fontSize: 10, fontWeight: 700,
            padding: '3px 6px', borderRadius: 4,
            lineHeight: 1,
          }}>
            {flag.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '12px 14px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: FG3, fontWeight: 600 }}>{zone}</div>
          <div style={{ fontSize: 11, color: FG3, marginTop: 1 }}>{getTypeLabel(property)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: FG1, marginTop: 3, lineHeight: 1.3 }}
            className="truncate"
          >{title}</div>

          {/* Specs inline */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            {bedrooms > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: FG1 }}>
                <Bed size={11} color={INDIGO} /> {bedrooms}
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: FG1 }}>
              <Bath size={11} color={INDIGO} /> {bathrooms}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: FG1 }}>
              <Maximize2 size={11} color={INDIGO} /> {sqm} m²
            </span>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: FG3 }}>
            {property.operation === 'arriendo' ? 'Arriendo' : 'Desde'}
          </div>
          <div>
            <span style={{ fontSize: 17, fontWeight: 800, color: INDIGO, lineHeight: 1.1 }}>
              {formatPricePrimary(property)}
            </span>
            <span style={{ fontSize: 11, color: FG3, marginLeft: 4 }}>
              {formatPriceAlt(property)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              onClick={e => { e.stopPropagation(); onSelect(id); }}
              style={{
                flex: 1, background: INDIGO, color: '#fff',
                border: 0, borderRadius: 4, padding: '7px 8px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = INDIGO_DARK)}
              onMouseLeave={e => (e.currentTarget.style.background = INDIGO)}
            >
              Cotizar
            </button>
            <button
              onClick={e => { e.stopPropagation(); onSelect(id); }}
              style={{
                flex: 1,
                background: SURFACE, color: INDIGO,
                border: 0, borderRadius: 4, padding: '7px 8px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: `0 0 0 1px ${INDIGO} inset`,
                fontFamily: 'inherit',
              }}
            >
              Ver más
            </button>
            <button
              onClick={e => { e.stopPropagation(); onSave?.(id); }}
              style={{
                width: 32, height: 32, flexShrink: 0,
                background: SURFACE, borderRadius: 4,
                border: `1px solid ${DIVIDER}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isSaved
                ? <HeartOff size={13} color={PINK} />
                : <Heart size={13} color={INDIGO} />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────

export function PropertyResultCard(props: PropertyResultCardProps) {
  if (props.layout === 'horizontal') return <HorizontalCard {...props} />;
  return <VerticalCard {...props} />;
}
