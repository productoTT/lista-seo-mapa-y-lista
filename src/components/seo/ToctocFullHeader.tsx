import logoSrc from '../../assets/logo-toctoc.svg';

interface ToctocFullHeaderProps {
  onGoHome: () => void;
  activeNav?: string;
}

const NAV_ITEMS = [
  { label: 'Comprar', caret: true },
  { label: 'Arrendar', caret: true },
  { label: 'Crédito Hipotecario', caret: false },
  { label: 'Subsidios', caret: false },
  { label: 'Tasar Propiedades', caret: false },
  { label: 'Inversionista', caret: false },
];

export function ToctocFullHeader({ onGoHome, activeNav = 'Comprar' }: ToctocFullHeaderProps) {
  return (
    <div style={{ background: '#fff', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>

      {/* ── Top bar — fondo full-width, contenido en seo-container ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E5E5' }}>
        <div
          className="seo-container"
          style={{ height: 64, display: 'flex', alignItems: 'center', gap: 24 }}
        >
          {/* Logo real */}
          <button
            onClick={onGoHome}
            style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', flexShrink: 0 }}
          >
            <img src={logoSrc} alt="TOCTOC" style={{ height: 28, display: 'block' }} />
          </button>

          {/* Personas / Empresas */}
          <div style={{ display: 'flex', gap: 22, marginLeft: 4 }}>
            {['Personas', 'Empresas'].map(tab => (
              <button
                key={tab}
                style={{
                  border: 0, background: 'transparent',
                  fontSize: 14, cursor: 'pointer',
                  padding: '6px 0',
                  borderBottom: tab === 'Personas' ? '2px solid #3200C1' : '2px solid transparent',
                  color: tab === 'Personas' ? '#3200C1' : '#343A40',
                  fontWeight: tab === 'Personas' ? 700 : 400,
                  fontFamily: 'inherit',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Asistente IA button */}
          <div style={{ marginLeft: 8, position: 'relative' }}>
            <button
              style={{
                border: '1.5px solid #3200C1',
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: 13,
                fontWeight: 600,
                color: '#3200C1',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              Asistente IA ✨
            </button>
            <span
              style={{
                position: 'absolute',
                top: -8,
                right: -6,
                background: '#37FFDB',
                color: '#3200C1',
                fontSize: 9,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 10,
                lineHeight: 1.4,
                letterSpacing: '0.03em',
              }}
            >
              Nuevo
            </span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 14 }}>
            <button style={{ border: 0, background: 'transparent', color: '#343A40', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
              Ayuda
            </button>
            <button style={{ border: 0, background: 'transparent', color: '#343A40', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
              Iniciar sesión
            </button>
            <button style={{
              background: '#37FFDB', color: '#3200C1',
              border: 0, borderRadius: 4,
              padding: '8px 22px',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Publicar
            </button>
          </div>
        </div>
      </div>

      {/* ── Purple subnav — fondo full-width, links en seo-container ── */}
      <div style={{ background: '#3200C1' }}>
        <div
          className="seo-container"
          style={{ height: 50, display: 'flex', alignItems: 'center', gap: 0 }}
        >
          {NAV_ITEMS.map(({ label, caret }) => {
            const isActive = label === activeNav;
            return (
              <button
                key={label}
                style={{
                  border: 0, background: 'transparent',
                  color: isActive ? '#37FFDB' : 'rgba(255,255,255,0.88)',
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  padding: '0 16px', height: 50,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  borderBottom: isActive ? '2px solid #37FFDB' : '2px solid transparent',
                  whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0,
                }}
              >
                {label}
                {caret && <span style={{ fontSize: 10, opacity: 0.8 }}>▾</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
