import { ChevronUp, Share2, MessageCircle, Rss, Play } from 'lucide-react';

const INDIGO = '#3200C1';
const MINT = '#37FFDB';

const FOOTER_COLS = [
  {
    title: 'Nosotros',
    links: ['Quiénes somos', 'Noticias', 'Trabaja con nosotros', 'Publicidad en TocToc'],
  },
  {
    title: 'Ayuda',
    links: ['Centro de ayuda', 'Contáctanos', 'Política de privacidad', 'Términos de uso'],
  },
  {
    title: 'Personas',
    links: ['Comprar propiedad', 'Arrendar propiedad', 'Departamentos', 'Casas'],
  },
  {
    title: 'Empresas',
    links: ['Publicar propiedad', 'Planes y precios', 'CRM Inmobiliario', 'API de datos'],
  },
];

export function ToctocFooter() {
  return (
    <>
      {/* ── Subir strip ── */}
      <div
        style={{
          background: '#221160',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 0',
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', padding: '4px 16px',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <ChevronUp size={16} />
          Subir
        </button>
      </div>

      {/* ── TOCTOC footer ── */}
      <footer style={{ background: INDIGO, color: '#fff' }}>
        <div className="seo-container" style={{ paddingTop: 40, paddingBottom: 16 }}>

          {/* Top row: logo + social */}
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 24, marginBottom: 36,
            }}
          >
            {/* Logo */}
            <div>
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                  fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em',
                  marginBottom: 8,
                }}
              >
                <span style={{ color: '#fff' }}>Toc</span>
                <span style={{ color: MINT }}>Toc</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, maxWidth: 220, lineHeight: 1.5 }}>
                El portal inmobiliario más completo de Chile.
              </p>
            </div>

            {/* Social + contact */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Síguenos
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[Share2, MessageCircle, Rss, Play].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(55,255,219,0.25)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  >
                    <Icon size={15} style={{ color: '#fff' }} />
                  </a>
                ))}
              </div>
              <a
                href="mailto:hola@toctoc.com"
                style={{ fontSize: 12, color: MINT, textDecoration: 'none' }}
              >
                hola@toctoc.com
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 24,
              paddingTop: 28,
              borderTop: '1px solid rgba(255,255,255,0.12)',
              marginBottom: 32,
            }}
          >
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <p
                  style={{
                    fontSize: 12, fontWeight: 700, color: MINT,
                    margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}
                >
                  {col.title}
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom: CCS + legal */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            {/* CCS seal placeholder */}
            <div
              style={{
                padding: '5px 10px', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.06em',
              }}
            >
              CCS
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              © {new Date().getFullYear()} TocToc.com — Todos los derechos reservados
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}
