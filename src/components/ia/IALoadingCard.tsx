import { Sparkles } from 'lucide-react';
import { LOADING_STEPS } from './IASearchShared';

const INDIGO = '#3200C1';
const MINT = '#37FFDB';
const INDIGO_50 = '#EAF2FC';

interface IALoadingCardProps {
  step: number;
}

export function IALoadingCard({ step }: IALoadingCardProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Búsqueda IA: ${LOADING_STEPS[step]}`}
      style={{
        margin: '16px 16px 0',
        borderRadius: 14,
        border: `1.5px solid ${INDIGO}`,
        background: INDIGO_50,
        overflow: 'hidden',
      }}
    >
      {/* Card body */}
      <div style={{ padding: '16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles
            size={14}
            color={INDIGO}
            aria-hidden="true"
            style={{ flexShrink: 0, animation: 'ia-sparkle-pulse 1.2s ease-in-out infinite' }}
          />
          <span
            key={step}
            style={{
              fontSize: 13, fontWeight: 700, color: INDIGO,
              animation: 'ia-chip-in 0.2s ease both',
            }}
          >
            {LOADING_STEPS[step]}
          </span>
        </div>
      </div>

      {/* Progress bar — pinned to card bottom */}
      <div
        style={{ height: 3, background: `rgba(50,0,193,0.12)`, overflow: 'hidden' }}
        role="progressbar"
        aria-label="Progreso de búsqueda"
      >
        <div
          className="ia-progress-bar"
          style={{
            height: '100%',
            width: '30%',
            background: `linear-gradient(90deg, ${INDIGO}, ${MINT})`,
            animation: 'ia-progress 1.1s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
