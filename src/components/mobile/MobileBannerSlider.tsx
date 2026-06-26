import { useRef } from 'react';
import { ArrowRight, Calculator, Home, Users } from 'lucide-react';

const INDIGO = '#3200C1';
const MINT = '#37FFDB';
const INDIGO_50 = '#EAF2FC';

const BANNERS = [
  {
    bg: `linear-gradient(135deg, ${INDIGO} 0%, #24018A 100%)`,
    eyebrow: 'Banco TOCTOC',
    title: 'Simula tu crédito hipotecario',
    body: '100% online · Sin ir al banco',
    cta: 'Simular ahora',
    ctaBg: MINT,
    ctaColor: INDIGO,
    Icon: Calculator,
    iconBg: 'rgba(55,255,219,0.18)',
    iconColor: MINT,
    light: false,
  },
  {
    bg: INDIGO_50,
    eyebrow: 'Tasación gratuita',
    title: '¿Cuánto vale tu propiedad?',
    body: 'Tasación online gratis en 2 min',
    cta: 'Tasar mi propiedad',
    ctaBg: INDIGO,
    ctaColor: '#fff',
    Icon: Home,
    iconBg: 'rgba(50,0,193,0.10)',
    iconColor: INDIGO,
    light: true,
  },
  {
    bg: `linear-gradient(135deg, #221160 0%, ${INDIGO} 100%)`,
    eyebrow: 'Agentes TOCTOC',
    title: 'Encuentra a tu agente ideal',
    body: '+500 agentes verificados',
    cta: 'Ver agentes',
    ctaBg: MINT,
    ctaColor: '#221160',
    Icon: Users,
    iconBg: 'rgba(55,255,219,0.18)',
    iconColor: MINT,
    light: false,
  },
];

export function MobileBannerSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  // Touch tracking to differentiate tap-on-CTA vs swipe
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const didSwipe = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didSwipe.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 6 && dx > dy) {
      didSwipe.current = true;
      // Let the horizontal scroll handle it, prevent vertical sheet drag
      e.stopPropagation();
    }
  };

  return (
    <div
      style={{
        overflow: 'visible',
        marginLeft: 0,
        marginRight: -12,
      }}
    >
      <div
        ref={trackRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: 0,
          paddingRight: 12,
          paddingBottom: 6,
          // hide scrollbar
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
        className="hide-scrollbar"
      >
        {BANNERS.map((b, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 calc(85%)',
              scrollSnapAlign: 'start',
              background: b.bg,
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 90,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative circle */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: b.light ? 'rgba(50,0,193,0.06)' : 'rgba(255,255,255,0.06)',
                pointerEvents: 'none',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: b.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <b.Icon size={18} style={{ color: b.iconColor }} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: b.light ? INDIGO : MINT,
                margin: '0 0 2px',
                opacity: 0.85,
              }}>
                {b.eyebrow}
              </p>
              <p style={{
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1.2,
                color: b.light ? INDIGO : '#fff',
                margin: '0 0 2px',
              }}>
                {b.title}
              </p>
              <p style={{
                fontSize: 10,
                color: b.light ? '#555' : 'rgba(255,255,255,0.7)',
                margin: 0,
              }}>
                {b.body}
              </p>
            </div>

            {/* CTA */}
            <button
              onTouchEnd={(e) => {
                if (didSwipe.current) { e.preventDefault(); return; }
              }}
              onClick={(e) => {
                if (didSwipe.current) { e.preventDefault(); return; }
              }}
              style={{
                flexShrink: 0,
                background: b.ctaBg,
                color: b.ctaColor,
                border: 'none',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minHeight: 44,
                minWidth: 44,
                whiteSpace: 'nowrap',
              }}
            >
              {b.cta}
              <ArrowRight size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
