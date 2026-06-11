import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { SearchInterpretation } from '../../types/property';
import { TocTocLogo } from '../ui/TocTocLogo';

interface InterpretingScreenProps {
  query: string;
  interpretation: SearchInterpretation;
  onContinue: () => void;
}

export function InterpretingScreen({ query, interpretation, onContinue }: InterpretingScreenProps) {
  const [showChips, setShowChips] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowChips(true), 600);
    const t2 = setTimeout(onContinue, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onContinue]);

  const chips = [
    interpretation.operation,
    interpretation.propertyType,
    interpretation.zone,
    interpretation.bedrooms,
    interpretation.maxPrice,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9F9F9' }}>
      <header className="flex items-center px-6 py-4 bg-white border-b" style={{ borderColor: '#E5E5E5' }}>
        <TocTocLogo />
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center shadow-lg"
          style={{ background: '#fff', boxShadow: '0 4px 24px rgba(34,17,96,0.08)' }}
        >
          {/* Pulsing icon */}
          <div className="flex items-center justify-center mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: '#EAF2FC',
                animation: 'pulse 1.2s ease-in-out infinite',
              }}
            >
              <Sparkles size={26} style={{ color: '#3200C1' }} />
            </div>
          </div>

          <h2
            className="text-xl font-extrabold mb-2"
            style={{ color: '#343A40' }}
          >
            Entendiendo tu búsqueda
          </h2>
          <p className="text-sm mb-4" style={{ color: '#666' }}>
            Estamos interpretando lo que necesitas
          </p>

          {/* Original query */}
          <div
            className="rounded-lg px-4 py-3 text-sm mb-6 italic"
            style={{ background: '#F4F4F4', color: '#343A40' }}
          >
            "{query}"
          </div>

          {/* Chips */}
          <div
            className="transition-all duration-500"
            style={{ opacity: showChips ? 1 : 0, transform: showChips ? 'translateY(0)' : 'translateY(8px)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#666' }}>
              Entendimos:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {chips.map(chip => (
                <span
                  key={chip}
                  className="text-sm font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: '#EAF2FC', color: '#3200C1' }}
                >
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-xs" style={{ color: '#666' }}>
              Puedes ajustar estos criterios cuando quieras.
            </p>
          </div>

          <button
            onClick={onContinue}
            className="mt-6 flex items-center gap-2 mx-auto font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
            style={{ background: '#3200C1', color: '#fff' }}
          >
            Ver resultados <ArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}
