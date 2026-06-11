import { Calculator, Home, ArrowRight } from 'lucide-react';

const INDIGO = '#3200C1';
const INDIGO_DARK = '#24018A';
const MINT = '#37FFDB';
const INDIGO_50 = '#EAF2FC';

interface ContextualBannerProps {
  variant?: number;
}

const BANNERS = [
  {
    bg: `linear-gradient(145deg, ${INDIGO} 0%, ${INDIGO_DARK} 100%)`,
    eyebrow: 'Banco TOCTOC',
    title: 'Simula tu crédito hipotecario',
    body: '100% online · Sin ir al banco · Respuesta en minutos',
    cta: 'Simular ahora',
    ctaBg: MINT,
    ctaColor: INDIGO,
    Icon: Calculator,
    iconBg: 'rgba(55,255,219,0.15)',
    iconColor: MINT,
    light: false,
  },
  {
    bg: INDIGO_50,
    eyebrow: 'Tasación gratuita',
    title: '¿Cuánto vale tu propiedad?',
    body: 'Obtén una tasación online gratis en menos de 2 minutos.',
    cta: 'Tasar mi propiedad',
    ctaBg: INDIGO,
    ctaColor: '#fff',
    Icon: Home,
    iconBg: 'rgba(50,0,193,0.10)',
    iconColor: INDIGO,
    light: true,
  },
];

export function ContextualBanner({ variant = 0 }: ContextualBannerProps) {
  const b = BANNERS[variant % BANNERS.length];

  return (
    <div
      style={{
        background: b.bg,
        borderRadius: 12,
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 280,
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: 'absolute',
          top: -32,
          right: -32,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: b.light ? 'rgba(50,0,193,0.06)' : 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />

      {/* Top: icon + eyebrow */}
      <div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: b.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <b.Icon size={18} style={{ color: b.iconColor }} />
        </div>

        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: b.light ? INDIGO : MINT,
            margin: '0 0 6px',
            opacity: 0.85,
          }}
        >
          {b.eyebrow}
        </p>

        <p
          style={{
            fontSize: 15,
            fontWeight: 800,
            lineHeight: 1.25,
            color: b.light ? INDIGO : '#fff',
            margin: '0 0 8px',
          }}
        >
          {b.title}
        </p>

        <p
          style={{
            fontSize: 11,
            lineHeight: 1.5,
            color: b.light ? '#555' : 'rgba(255,255,255,0.7)',
            margin: 0,
          }}
        >
          {b.body}
        </p>
      </div>

      {/* CTA */}
      <button
        style={{
          marginTop: 18,
          background: b.ctaBg,
          color: b.ctaColor,
          border: 'none',
          borderRadius: 8,
          padding: '9px 14px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          justifyContent: 'center',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {b.cta}
        <ArrowRight size={13} />
      </button>
    </div>
  );
}

// Frequency constant — change this to adjust how often banners appear
export const BANNER_EVERY = 5;

// Helper: interleave banners into a property list
export function insertBanners<T>(items: T[]): (T | { __banner: true; variant: number })[] {
  const result: (T | { __banner: true; variant: number })[] = [];
  let bannerCount = 0;
  items.forEach((item, i) => {
    result.push(item);
    if ((i + 1) % BANNER_EVERY === 0 && i < items.length - 1) {
      result.push({ __banner: true, variant: bannerCount++ });
    }
  });
  return result;
}
