import type { Filters } from '../../types/property';

interface SeoPageInfoProps {
  filters: Filters;
  resultCount: number;
}

function getH1(filters: Filters): string {
  const type =
    filters.propertyType === 'departamento' ? 'Departamentos'
    : filters.propertyType === 'casa' ? 'Casas'
    : filters.propertyType === 'oficina' ? 'Oficinas'
    : 'Propiedades';
  const op = filters.operation === 'arriendo' ? 'en arriendo' : 'en venta';
  const zone = filters.zone ? `en ${filters.zone}` : 'en Región Metropolitana';
  return `${type} ${op} ${zone}`;
}

function getBreadcrumb(filters: Filters): { label: string; last: boolean }[] {
  const crumbs: { label: string; last: boolean }[] = [
    { label: 'Inicio', last: false },
    { label: filters.operation === 'arriendo' ? 'Arriendo' : 'Venta', last: false },
  ];
  if (filters.propertyType) {
    crumbs.push({
      label: filters.propertyType === 'departamento' ? 'Departamento'
        : filters.propertyType === 'casa' ? 'Casa' : 'Oficina',
      last: !filters.zone,
    });
  }
  if (filters.zone) crumbs.push({ label: filters.zone, last: true });
  return crumbs;
}

export function SeoPageInfo({ filters, resultCount: _resultCount }: SeoPageInfoProps) {
  const h1 = getH1(filters);
  const crumbs = getBreadcrumb(filters);

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', flexShrink: 0 }}>
      <div className="seo-container" style={{ paddingTop: 12, paddingBottom: 0 }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666', flexWrap: 'wrap' }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span style={{ color: '#B2B2B2', fontSize: 10 }}>›</span>}
              <span style={{ color: c.last ? '#343A40' : '#3200C1', fontWeight: c.last ? 600 : 400, cursor: c.last ? 'default' : 'pointer' }}>
                {c.label}
              </span>
            </span>
          ))}
        </nav>

        {/* H1 */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#343A40', margin: '18px 0 2px', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          {h1}
        </h1>
        <p style={{ margin: '0 0 14px' }} />
      </div>

      {/* ── Top banners — hero-promo style from DS ── */}
      <div className="seo-container" style={{ paddingTop: 0, paddingBottom: 16, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12, minWidth: 640 }}>

          {/* Banner 1 — Asesoría (photo overlay dark) */}
          <div style={{
            height: 132, borderRadius: 10, overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(rgba(50,0,193,.7), rgba(34,17,96,.85)), linear-gradient(120deg,#6579D1,#221160)',
            padding: 16,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            color: '#fff',
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.35 }}>
                ¿Necesitas asesoría para comprar?
              </p>
              <p style={{ fontSize: 12, opacity: 0.9, margin: '4px 0 0', lineHeight: 1.4 }}>
                Te acompañamos sin costo en todo el proceso
              </p>
            </div>
            <button style={{
              alignSelf: 'flex-start', padding: '6px 16px',
              borderRadius: 4, fontSize: 13, fontWeight: 600,
              background: '#fff', color: '#343A40', border: 0, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              Solicitar asesoría
            </button>
          </div>

          {/* Banner 2 — Subsidio (indigo sólido) */}
          <div style={{
            height: 132, borderRadius: 10, overflow: 'hidden',
            background: '#3200C1',
            padding: 16,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            color: '#fff',
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.35 }}>
                ¡Encuentra tu hogar con subsidio DS1 y DS19!
              </p>
              <p style={{ fontSize: 12, opacity: 0.88, margin: '4px 0 0' }}>
                De sueños a dueños
              </p>
            </div>
            <button style={{
              alignSelf: 'flex-start', padding: '6px 14px',
              borderRadius: 4, fontSize: 13, fontWeight: 600,
              background: '#37FFDB', color: '#3200C1', border: 0, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              Ver propiedades
            </button>
          </div>

          {/* Banner 3 — Tasación (indigo-tint claro) */}
          <div style={{
            height: 132, borderRadius: 10, overflow: 'hidden',
            background: '#EAF2FC',
            padding: 16,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#3200C1', margin: 0, lineHeight: 1.35 }}>
                ¿Estás por comprar un depto o casa?
              </p>
              <p style={{ fontSize: 12, color: '#343A40', margin: '4px 0 0', lineHeight: 1.35 }}>
                Tásala 100% online por $9.990
              </p>
            </div>
            <button style={{
              alignSelf: 'flex-start', padding: '6px 14px',
              borderRadius: 4, fontSize: 13, fontWeight: 600,
              background: '#3200C1', color: '#fff', border: 0, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              Tasar propiedad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
