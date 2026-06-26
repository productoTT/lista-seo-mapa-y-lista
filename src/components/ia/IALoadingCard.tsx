import { Sparkles } from 'lucide-react';
import { LOADING_STEPS, CHIPS_VISIBLE_AT_STEP } from './IASearchShared';

const INDIGO = '#3200C1';
const MINT = '#37FFDB';
const INDIGO_50 = '#EAF2FC';
const FG3 = '#666666';

interface IALoadingCardProps {
  query: string;
  step: number;
  chips: string[];
  chipsVisible: boolean;
}

export function IALoadingCard({ query, step, chips, chipsVisible }: IALoadingCardProps) {
  const showChips = chipsVisible && step >= CHIPS_VISIBLE_AT_STEP && chips.length > 0;

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
        // stable min-height avoids layout jumps between steps
        minHeight: 130,
      }}
    >
      {/* Card body */}
      <div style={{ padding: '14px 14px 12px' }}>
        {/* Step message row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
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

        {/* Original query */}
        <p style={{
          fontSize: 12,
          color: FG3,
          margin: '0 0 10px',
          fontStyle: 'italic',
          lineHeight: 1.4,
          // allow up to 3 lines, then ellipsis
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          "{query}"
        </p>

        {/* Interpreted chips */}
        {showChips && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {chips.map((chip, i) => (
              <span
                key={chip}
                className="ia-chip"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  background: '#fff',
                  color: INDIGO,
                  border: '1px solid #C7D8FF',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  animation: 'ia-chip-in 0.25s ease both',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Placeholder space when chips not yet visible — keeps card height stable */}
        {!showChips && <div style={{ height: 28 }} />}
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
