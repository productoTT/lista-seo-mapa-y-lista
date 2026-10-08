import type { ReactNode } from 'react';
import { Key, TrendingUp, Building2, SlidersHorizontal, Menu } from 'lucide-react';
import { ToctocFullHeader } from '../../../components/seo/ToctocFullHeader';
import { TocTocLogo } from '../../../components/ui/TocTocLogo';
import type { Device, SimpleProperty } from '../types';

const INDIGO = '#3200C1';

// ── Encabezado compartido, consciente del dispositivo ───────
// Desktop reutiliza ToctocFullHeader (header real) tal cual, envuelto en un
// contenedor con scroll horizontal propio como red de seguridad ante anchos
// reales muy angostos. Su navegación completa no está pensada para 390px,
// así que en móvil usamos una versión compacta (logo + menú) en su lugar,
// evitando que la nav de escritorio quede cortada.
export function ChromeHeader({ device, onGoHome }: { device: Device; onGoHome?: () => void }) {
  if (device === 'mobile') {
    return (
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-tt-divider bg-white px-4">
        <TocTocLogo onClick={onGoHome} />
        <button type="button" aria-label="Abrir menú" className="flex h-9 w-9 items-center justify-center rounded-lg text-tt-ink">
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <ToctocFullHeader onGoHome={onGoHome ?? (() => {})} />
    </div>
  );
}

// ── Home real (header + hero + secciones estáticas) ─────────
// El resto del Home se reconstruye de forma liviana y no-interactiva: solo
// es telón de fondo del experimento, el Home real (HomeScreen.tsx) no se
// toca ni se reusa por dentro.

export function HomeChrome({ heroContent, device, compact }: { heroContent: ReactNode; device: Device; compact?: boolean }) {
  return (
    <div className="flex min-h-full flex-col bg-[#F5F5F5]">
      {!compact && device === 'desktop' && (
        <div className="bg-[#EEEDF8] px-3 py-2 text-center text-xs text-tt-ink">
          Si ya tienes tu <strong>SUBSIDIO</strong> ¡Tenemos la mejor opción para usarlo!
        </div>
      )}
      <ChromeHeader device={device} />

      <section className="flex flex-col items-center bg-tt-indigo px-4 py-10">
        <h1 className="m-0 mb-7 max-w-xl text-center text-[26px] font-extrabold leading-tight text-white sm:text-[32px]">
          Hola, busca aquí tu próximo hogar
        </h1>
        <div className="w-full max-w-[720px]">{heroContent}</div>
      </section>

      {!compact && device === 'desktop' && <HomeBelowSections />}
    </div>
  );
}

function HomeBelowSections() {
  const categories = [
    { icon: Key, label: 'Comprar', sub: 'Departamentos y casas en venta' },
    { icon: TrendingUp, label: 'Arrendar', sub: 'Arriendo residencial y comercial' },
    { icon: Building2, label: 'Proyectos nuevos', sub: 'Edificios y condominios en construcción' },
  ];
  return (
    <section className="mx-auto w-full max-w-[1000px] px-4 py-10">
      <h2 className="mb-6 text-center text-lg font-bold text-tt-ink">¿Qué estás buscando?</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {categories.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-start gap-4 rounded-xl border border-tt-divider bg-white p-5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-tt-indigo-50">
              <Icon size={20} color={INDIGO} />
            </div>
            <div>
              <p className="m-0 text-[15px] font-bold text-tt-ink">{label}</p>
              <p className="m-1 mt-1 text-[13px] text-tt-ink-2">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Backdrop de página de resultados (para Alternativa 3) ───

interface ResultsBackdropProps {
  resultCount: number;
  criteriaLabel: string;
  properties: SimpleProperty[];
  device: Device;
}

export function ResultsBackdrop({ resultCount, criteriaLabel, properties, device }: ResultsBackdropProps) {
  return (
    <div className="flex min-h-full flex-col bg-[#F5F5F5]">
      <ChromeHeader device={device} />

      <div className="border-b border-tt-divider bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="m-0 text-base font-extrabold text-tt-ink">{criteriaLabel}</h1>
            <p className="m-0 mt-0.5 text-xs text-tt-ink-2">
              {resultCount} {resultCount === 1 ? 'propiedad' : 'propiedades'}
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-tt-divider px-3 py-1.5 text-xs font-bold text-tt-ink"
          >
            <SlidersHorizontal size={13} aria-hidden="true" /> Filtros
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-tt-divider bg-white py-16 text-center">
            <p className="m-0 text-sm font-bold text-tt-ink">Sin propiedades para estos filtros</p>
            <p className="m-0 mt-1 text-xs text-tt-ink-2">Ajusta los criterios desde el panel de conversación.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map(p => (
              <BackdropCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BackdropCard({ property }: { property: SimpleProperty }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-tt-divider bg-white">
      <div className="h-[120px] w-full bg-gradient-to-br from-tt-indigo-50 to-tt-indigo-100" />
      <div className="p-3">
        <p className="m-0 text-[13px] font-bold text-tt-ink">{property.title}</p>
        <p className="m-0 mt-1 text-[11px] text-tt-ink-2">{property.specs}</p>
        <p className="m-0 mt-2 text-sm font-extrabold text-tt-indigo">{property.priceUF}</p>
      </div>
    </div>
  );
}
