import { Key, TrendingUp, Building2 } from 'lucide-react';
import { ToctocFullHeader } from '../seo/ToctocFullHeader';
import type { SearchCriteria } from '../../search/criteria';
import { DEFAULT_CRITERIA } from '../../search/criteria';
import { HomeSearch, type HomeSearchProps } from '../home/HomeSearch';

// ── Constants ─────────────────────────────────────────────

// Comunas reconocidas por el combobox de ubicación.
const COMMUNES = [
  'Ñuñoa', 'Providencia', 'Las Condes', 'Vitacura', 'Santiago Centro',
  'Miraflores', 'La Florida', 'Peñalolén', 'La Reina', 'Macul',
  'San Miguel', 'Estación Central', 'Maipú', 'Pudahuel', 'Quilicura',
  'Lo Barnechea', 'Huechuraba', 'Conchalí', 'Recoleta', 'Independencia',
];

// "Búsquedas sugeridas" del combobox cuando no hay recientes (comunas populares).
const POPULAR = ['Ñuñoa', 'Providencia', 'Las Condes'];

const FREQUENT: { label: string; criteria: Partial<SearchCriteria> }[] = [
  { label: 'Departamentos en venta en Ñuñoa', criteria: { operation: 'venta', propertyType: 'departamento', comunas: ['Ñuñoa'] } },
  { label: 'Departamentos en arriendo en Providencia', criteria: { operation: 'arriendo', propertyType: 'departamento', comunas: ['Providencia'] } },
  { label: 'Casas en venta en Peñalolén', criteria: { operation: 'venta', propertyType: 'casa', comunas: ['Peñalolén'] } },
  { label: 'Casas en venta en La Florida', criteria: { operation: 'venta', propertyType: 'casa', comunas: ['La Florida'] } },
];

const INDIGO = 'var(--tt-indigo)';

// ── Main component ────────────────────────────────────────

type HomeScreenProps = Omit<HomeSearchProps, 'comunas' | 'popular'> & {
  /** Ejecuta una búsqueda completa (búsquedas frecuentes). */
  onRunSearch: (criteria: SearchCriteria) => void;
};

/**
 * Home: buscador tradicional con entrada progresiva al asistente (bloque 2).
 * Las pestañas Clásica/IA y la búsqueda IA que aplicaba filtros automáticamente se reemplazaron.
 */
export function HomeScreen({ onRunSearch, ...search }: HomeScreenProps) {
  const { onSearch } = search;
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F5', fontFamily: 'inherit' }}>

      {/* ── Commercial strip ─────────────────────────────── */}
      <div style={{ background: '#EEEDF8', padding: '9px 0' }}>
        <div className="seo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#343A40' }}>
            Si ya tienes tu <strong>SUBSIDIO</strong> ¡Tenemos la mejor opción para usarlo!
          </span>
          <button
            style={{
              border: 0, borderRadius: 6,
              padding: '5px 14px', fontSize: 12, fontWeight: 700,
              color: '#fff', background: '#221160', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Ver más
          </button>
        </div>
      </div>

      {/* ── Full TOCTOC header ────────────────────────────── */}
      <ToctocFullHeader onGoHome={() => {}} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        style={{
          background: INDIGO,
          padding: '56px 16px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            color: '#fff',
            fontSize: 34,
            fontWeight: 800,
            margin: '0 0 36px',
            textAlign: 'center',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          Hola, busca aquí tu próximo hogar
        </h1>


        <HomeSearch {...search} comunas={COMMUNES} popular={POPULAR} />
      </section>


      {/* ── Below-hero sections ───────────────────────────── */}


      {/* Quick categories */}
      <section style={{ padding: '48px 16px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#343A40',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          ¿Qué estás buscando?
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              icon: Key,
              label: 'Comprar',
              sub: 'Departamentos y casas en venta',
              action: () => onSearch({ operation: 'venta' }),
            },
            {
              icon: TrendingUp,
              label: 'Arrendar',
              sub: 'Arriendo residencial y comercial',
              action: () => onSearch({ operation: 'arriendo' }),
            },
            {
              icon: Building2,
              label: 'Proyectos nuevos',
              sub: 'Edificios y condominios en construcción',
              // Antes abría la búsqueda IA anterior; ahora es una búsqueda directa de proyectos nuevos.
              action: () => onSearch({ operation: 'venta', status: ['nueva'] }),
            },
          ].map(({ icon: Icon, label, sub, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '20px',
                borderRadius: 12,
                border: '1px solid #E5E5E5',
                background: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(50,0,193,0.10)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#EAF2FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={INDIGO} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#343A40' }}>{label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>


      {/* Búsquedas frecuentes (spec §5) */}
      <section aria-labelledby="home-frecuentes" style={{ padding: '0 16px 48px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <h2 id="home-frecuentes" style={{ fontSize: 20, fontWeight: 700, color: 'var(--tt-ink)', margin: '0 0 16px', textAlign: 'center' }}>
          Búsquedas frecuentes
        </h2>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
          {FREQUENT.map(f => (
            <li key={f.label}>
              <button type="button" className="home-frequent" onClick={() => onRunSearch({ ...DEFAULT_CRITERIA, ...f.criteria })}>
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Commercial banners */}
      <section style={{ background: '#fff', borderTop: '1px solid #E5E5E5', padding: '32px 16px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { title: 'Subsidio Habitacional', desc: 'Encuentra propiedades que se ajusten a tu subsidio disponible.', cta: 'Ver propiedades' },
            { title: 'Crédito Hipotecario', desc: 'Simula y compara las mejores tasas para tu crédito.', cta: 'Simular crédito' },
            { title: 'Tasa tu propiedad', desc: 'Conoce el valor de mercado de tu inmueble gratis.', cta: 'Tasar ahora' },
          ].map(({ title, desc, cta }) => (
            <div
              key={title}
              style={{
                padding: '20px 24px',
                borderRadius: 10,
                background: '#EAF2FC',
                border: '1px solid #d0dcee',
              }}
            >
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: INDIGO }}>{title}</p>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#444', lineHeight: 1.5 }}>{desc}</p>
              <button
                style={{
                  border: 0,
                  background: INDIGO,
                  color: '#fff',
                  padding: '7px 16px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer stats */}
      <section
        style={{
          marginTop: 'auto',
          borderTop: '1px solid #E5E5E5',
          background: '#fff',
          padding: '24px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {[
            ['40.000+', 'propiedades activas'],
            ['15 años', 'en el mercado chileno'],
            ['Búsqueda IA', 'tecnología semántica'],
          ].map(([num, label]) => (
            <div key={num}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: INDIGO }}>{num}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
