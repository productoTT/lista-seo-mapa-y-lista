import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

const INDIGO = '#3200C1';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  index: number;
  onIndexChange: (i: number) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  height?: number;
}

export function PropertyGallery({ images, title, index, onIndexChange, expanded, onToggleExpanded, height = 260 }: PropertyGalleryProps) {
  const safeIndex = ((index % images.length) + images.length) % images.length;
  const go = (dir: 1 | -1) => onIndexChange((safeIndex + dir + images.length) % images.length);

  const navBtnStyle = (side: 'left' | 'right'): CSSProperties => ({
    position: 'absolute', top: '50%', [side]: 8, transform: 'translateY(-50%)',
    width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,17,96,0.55)',
    border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <div>
      <div style={{ position: 'relative', height, borderRadius: 10, overflow: 'hidden', background: '#F0F0F0' }}>
        <img
          src={images[safeIndex]}
          alt={`${title} — foto ${safeIndex + 1} de ${images.length}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Foto anterior" style={navBtnStyle('left')}>
              <ChevronLeft size={18} color="#fff" />
            </button>
            <button onClick={() => go(1)} aria-label="Foto siguiente" style={navBtnStyle('right')}>
              <ChevronRight size={18} color="#fff" />
            </button>
            <span style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '3px 8px', borderRadius: 20,
            }}>
              {safeIndex + 1} / {images.length}
            </span>
          </>
        )}

        <button
          onClick={onToggleExpanded}
          aria-label={expanded ? 'Cerrar galería ampliada' : 'Ampliar galería'}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 28, height: 28, borderRadius: '50%', background: '#fff', border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          {expanded ? <X size={14} color="#343A40" /> : <Expand size={14} color="#343A40" />}
        </button>
      </div>

      {images.length > 1 && (
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              style={{
                flexShrink: 0, width: 56, height: 42, borderRadius: 6, overflow: 'hidden',
                border: i === safeIndex ? `2px solid ${INDIGO}` : '2px solid transparent',
                padding: 0, cursor: 'pointer', opacity: i === safeIndex ? 1 : 0.7,
              }}
            >
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
