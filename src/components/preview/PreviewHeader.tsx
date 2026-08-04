import { X, ChevronLeft, ChevronRight, Heart, HeartOff, ArrowLeft } from 'lucide-react';

const INDIGO = '#3200C1';
const FG1 = '#343A40';
const FG3 = '#666666';
const PINK = '#F05C89';
const DIVIDER = '#E5E5E5';

interface PreviewHeaderProps {
  onClose: () => void;
  isSaved: boolean;
  onSave: () => void;
  showBackLabel?: boolean;
  showPrevNext?: boolean;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export function PreviewHeader({
  onClose, isSaved, onSave, showBackLabel = true,
  showPrevNext = true, hasPrev, hasNext, onPrev, onNext,
}: PreviewHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: `1px solid ${DIVIDER}`, background: '#fff', flexShrink: 0, gap: 8,
    }}>
      <button
        onClick={onClose}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, background: 'none', cursor: 'pointer', padding: 4, fontFamily: 'inherit' }}
      >
        <ArrowLeft size={16} color={INDIGO} />
        {showBackLabel && <span style={{ fontSize: 13, fontWeight: 700, color: INDIGO }}>Volver a resultados</span>}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {showPrevNext && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 4 }}>
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Propiedad anterior"
              style={navBtnStyle(!!hasPrev)}
            >
              <ChevronLeft size={16} color={hasPrev ? FG1 : '#C4C4C4'} />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Propiedad siguiente"
              style={navBtnStyle(!!hasNext)}
            >
              <ChevronRight size={16} color={hasNext ? FG1 : '#C4C4C4'} />
            </button>
          </div>
        )}
        <button
          onClick={onSave}
          aria-label={isSaved ? 'Quitar de guardados' : 'Guardar propiedad'}
          style={{ width: 32, height: 32, borderRadius: 999, background: isSaved ? '#FFF0F0' : '#F9F9F9', border: `1px solid ${isSaved ? '#FCA5A5' : DIVIDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isSaved ? <HeartOff size={14} color={PINK} /> : <Heart size={14} color={INDIGO} />}
        </button>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{ width: 32, height: 32, borderRadius: 999, background: '#F9F9F9', border: `1px solid ${DIVIDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={15} color={FG3} />
        </button>
      </div>
    </div>
  );
}

function navBtnStyle(enabled: boolean) {
  return {
    width: 28, height: 28, borderRadius: 999, border: `1px solid ${DIVIDER}`,
    background: '#fff', cursor: enabled ? 'pointer' as const : 'default' as const,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: enabled ? 1 : 0.5,
  };
}
