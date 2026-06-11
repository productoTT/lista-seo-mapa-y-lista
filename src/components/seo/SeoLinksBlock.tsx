const COLUMNS = [
  {
    title: 'Comprar',
    links: [
      'Casas en venta Santiago',
      'Casas en venta Las Condes',
      'Casas en venta Providencia',
      'Casas en venta Ñuñoa',
      'Casas en venta La Florida',
      'Casas en venta Vitacura',
    ],
  },
  {
    title: 'Arrendar',
    links: [
      'Casas en arriendo Santiago',
      'Casas en arriendo Las Condes',
      'Casas en arriendo Providencia',
      'Casas en arriendo Ñuñoa',
      'Casas en arriendo La Florida',
      'Casas en arriendo Vitacura',
    ],
  },
  {
    title: 'Departamentos en venta',
    links: [
      'Dptos. en venta Santiago',
      'Dptos. en venta Las Condes',
      'Dptos. en venta Providencia',
      'Dptos. en venta Ñuñoa',
      'Dptos. en venta Miraflores',
      'Dptos. en venta La Reina',
    ],
  },
  {
    title: 'Departamentos en arriendo',
    links: [
      'Dptos. en arriendo Santiago',
      'Dptos. en arriendo Las Condes',
      'Dptos. en arriendo Providencia',
      'Dptos. en arriendo Ñuñoa',
      'Dptos. en arriendo Miraflores',
      'Dptos. en arriendo La Reina',
    ],
  },
  {
    title: 'Casas en venta',
    links: [
      'Casas 3 dorm. en venta',
      'Casas 4 dorm. en venta',
      'Casas con jardín en venta',
      'Casas con piscina en venta',
      'Casas nuevas en venta',
      'Casas en venta hasta 3.000 UF',
    ],
  },
  {
    title: 'Casas en arriendo',
    links: [
      'Casas 3 dorm. en arriendo',
      'Casas 4 dorm. en arriendo',
      'Casas amobladas en arriendo',
      'Casas con jardín en arriendo',
      'Casas temporada',
      'Casas en arriendo hasta 500 UF',
    ],
  },
];

export function SeoLinksBlock() {
  return (
    <div style={{ background: '#fff', borderTop: '1px solid #E5E5E5' }}>
      <div className="seo-container" style={{ paddingTop: 40, paddingBottom: 48 }}>
        <h2
          style={{
            fontSize: 18, fontWeight: 700, color: '#343A40',
            margin: '0 0 28px', lineHeight: 1.2,
          }}
        >
          Lo más buscado
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 24,
          }}
        >
          {COLUMNS.map(col => (
            <div key={col.title}>
              <p
                style={{
                  fontSize: 12, fontWeight: 700, color: '#3200C1',
                  margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em',
                }}
              >
                {col.title}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {col.links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        fontSize: 12, color: '#555',
                        textDecoration: 'none', lineHeight: 1.4,
                        display: 'block',
                        transition: 'color 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#3200C1')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
