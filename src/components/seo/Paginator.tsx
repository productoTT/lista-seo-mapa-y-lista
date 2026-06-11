import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TOTAL_PAGES = 1198;

const INDIGO = '#3200C1';

export function Paginator() {
  const [page, setPage] = useState(1);

  const go = (p: number) => {
    if (p < 1 || p > TOTAL_PAGES) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build visible page sequence
  const pages: (number | '…')[] = [];
  if (page <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', TOTAL_PAGES);
  } else if (page >= TOTAL_PAGES - 3) {
    pages.push(1, '…', TOTAL_PAGES - 4, TOTAL_PAGES - 3, TOTAL_PAGES - 2, TOTAL_PAGES - 1, TOTAL_PAGES);
  } else {
    pages.push(1, '…', page - 1, page, page + 1, '…', TOTAL_PAGES);
  }

  const btnBase: React.CSSProperties = {
    minWidth: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s ease', background: '#fff', color: '#343A40',
  };
  const btnActive: React.CSSProperties = { ...btnBase, background: INDIGO, color: '#fff', borderColor: INDIGO };
  const btnDisabled: React.CSSProperties = { ...btnBase, opacity: 0.35, cursor: 'not-allowed' };

  return (
    <div
      className="seo-container"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 32, paddingBottom: 40 }}
    >
      {/* Prev */}
      <button
        style={page === 1 ? btnDisabled : btnBase}
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            style={{ minWidth: 32, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#999' }}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            style={p === page ? btnActive : btnBase}
            onClick={() => go(p as number)}
            aria-label={`Ir a página ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        style={page === TOTAL_PAGES ? btnDisabled : btnBase}
        onClick={() => go(page + 1)}
        disabled={page === TOTAL_PAGES}
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
