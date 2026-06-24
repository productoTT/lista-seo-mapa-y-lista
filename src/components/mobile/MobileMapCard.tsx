import { useState, useRef } from 'react';
import { X, Heart, HeartOff, Bed, Bath, Maximize2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Property } from '../../types/property';
import { formatPriceUF, formatRent } from '../../data/mockProperties';

const INDIGO = '#3200C1';
const PINK = '#F05C89';

interface MobileMapCardProps {
  properties: Property[];
  savedProperties: Set<string>;
  onClose: () => void;
  onSave: (id: string) => void;
  onViewFull: (id: string) => void;
}

export function MobileMapCard({ properties, savedProperties, onClose, onSave, onViewFull }: MobileMapCardProps) {
  const [index, setIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);

  const count = properties.length;
  const safeIndex = Math.min(index, count - 1);
  const p = properties[safeIndex];
  if (!p) return null;

  const isSaved = savedProperties.has(p.id);
  const priceDisplay = p.operation === 'arriendo' ? formatRent(p.price) : formatPriceUF(p.priceUF);
  const priceClp = p.operation === 'venta' && p.price >= 1_000_000
    ? `$${(p.price / 1_000_000).toFixed(1).replace('.', ',')} mill.`
    : null;

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(count - 1, i + 1));

  // Horizontal swipe for carousel — differentiate from vertical sheet drag
  const onTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - swipeStartY.current);
    // Only treat as horizontal swipe if mostly horizontal
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy * 1.5) {
      if (dx < 0) next(); else prev();
    }
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  return (
    <div style={{ padding: '0 12px' }}>
      {/* Counter badge for carousel */}
      {count > 1 && (
        <div style={{
          textAlign: 'center', marginBottom: 6,
          fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.95)',
          textShadow: '0 1px 6px rgba(0,0,0,0.5)',
        }}>
          {safeIndex + 1} de {count}
        </div>
      )}

      {/* Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(34,17,96,0.20)',
          overflow: 'hidden',
          display: 'flex',
          height: 112,
          cursor: 'pointer',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => onViewFull(p.id)}
        role="button"
        aria-label={`Ver ${p.address}`}
      >
        {/* Image */}
        <div style={{ width: 108, flexShrink: 0, position: 'relative' }}>
          <img
            src={p.imageUrl}
            alt={p.address}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Close button */}
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 6, left: 6,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            <X size={12} style={{ color: '#343A40' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, minWidth: 0,
          padding: '10px 10px 10px 10px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: INDIGO, margin: 0, lineHeight: 1.15 }}>
                  {priceDisplay}
                </p>
                {priceClp && (
                  <p style={{ fontSize: 10, color: '#888', margin: 0 }}>{priceClp}</p>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); onSave(p.id); }}
                aria-label={isSaved ? 'Quitar guardado' : 'Guardar'}
                style={{
                  width: 32, height: 32, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                {isSaved
                  ? <HeartOff size={16} style={{ color: PINK }} />
                  : <Heart size={16} style={{ color: '#CCC' }} />
                }
              </button>
            </div>

            <p style={{
              fontSize: 11, fontWeight: 600, color: '#343A40',
              margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {p.address}
            </p>
            <p style={{ fontSize: 10, color: '#888', margin: 0 }}>{p.zone}</p>
          </div>

          {/* Specs + arrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#666' }}>
            {p.bedrooms > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Bed size={10} />{p.bedrooms}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Bath size={10} />{p.bathrooms}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Maximize2 size={10} />{p.sqm} m²
            </span>
            <ArrowRight size={13} style={{ color: INDIGO, marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* Carousel nav buttons */}
      {count > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={prev}
            disabled={safeIndex === 0}
            aria-label="Propiedad anterior"
            style={{
              flex: 1, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.92)',
              border: 'none', cursor: safeIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: safeIndex === 0 ? 0.35 : 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <ChevronLeft size={18} style={{ color: '#343A40' }} />
          </button>
          <button
            onClick={next}
            disabled={safeIndex === count - 1}
            aria-label="Propiedad siguiente"
            style={{
              flex: 1, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.92)',
              border: 'none', cursor: safeIndex === count - 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: safeIndex === count - 1 ? 0.35 : 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <ChevronRight size={18} style={{ color: '#343A40' }} />
          </button>
        </div>
      )}
    </div>
  );
}
