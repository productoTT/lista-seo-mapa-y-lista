import { X, Bed, Bath, Maximize2, Heart, HeartOff, Calculator, ArrowRight, Phone } from 'lucide-react';
import type { Property } from '../../types/property';
import { CommercialBadge } from '../ui/CommercialBadge';
import { formatPriceUF, formatRent } from '../../data/mockProperties';

interface PropertyDrawerProps {
  property: Property | null;
  isSaved: boolean;
  onClose: () => void;
  onSave: (id: string) => void;
  onContact: (id: string) => void;
  onViewFull: (id: string) => void;
}

export function PropertyDrawer({ property, isSaved, onClose, onSave, onContact, onViewFull }: PropertyDrawerProps) {
  if (!property) return null;

  const { id, imageUrl, title, priceUF, price, address, zone, bedrooms, bathrooms, sqm, sqmTotal, description, commercialStatus, isNewProject, operation } = property;
  const priceDisplay = operation === 'arriendo' ? formatRent(price) : formatPriceUF(priceUF);
  const estimatedMonthly = Math.round(priceUF * 0.006 * 7.5); // rough UF * rate * valor UF en miles

  return (
    <>
      {/* Overlay — z-index 1200 clears Leaflet's max (~700) */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={onClose}
        style={{ zIndex: 1200, backdropFilter: 'blur(1px)' }}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 bottom-0 bg-white overflow-y-auto flex flex-col"
        style={{ zIndex: 1201,
          width: 420,
          maxWidth: '100vw',
          boxShadow: '-4px 0 24px rgba(34,17,96,0.12)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Hero image */}
        <div className="relative shrink-0" style={{ height: 220 }}>
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all hover:scale-110"
            style={{ background: '#fff' }}
          >
            <X size={16} style={{ color: '#343A40' }} />
          </button>
          <div className="absolute top-3 left-3 flex gap-1.5">
            <CommercialBadge status={commercialStatus} />
            {isNewProject && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#3200C1', color: '#37FFDB', fontSize: 10 }}>
                PROYECTO
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-4 space-y-4">
          <div>
            <p className="text-2xl font-extrabold" style={{ color: '#3200C1' }}>{priceDisplay}</p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#343A40' }}>{address}</p>
            <p className="text-sm" style={{ color: '#666' }}>{zone}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 py-3 border-t border-b" style={{ borderColor: '#E5E5E5' }}>
            {bedrooms > 0 && (
              <div className="flex items-center gap-2">
                <Bed size={18} style={{ color: '#3200C1' }} />
                <div>
                  <p className="text-base font-extrabold" style={{ color: '#343A40' }}>{bedrooms}</p>
                  <p className="text-xs" style={{ color: '#666' }}>dormitorios</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Bath size={18} style={{ color: '#3200C1' }} />
              <div>
                <p className="text-base font-extrabold" style={{ color: '#343A40' }}>{bathrooms}</p>
                <p className="text-xs" style={{ color: '#666' }}>baños</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Maximize2 size={18} style={{ color: '#3200C1' }} />
              <div>
                <p className="text-base font-extrabold" style={{ color: '#343A40' }}>{sqm}m²</p>
                <p className="text-xs" style={{ color: '#666' }}>útiles / {sqmTotal}m² total</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: '#343A40' }}>{description}</p>

          {/* CTA buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={() => onContact(id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: '#3200C1', color: '#fff' }}
            >
              <Phone size={15} />
              Contactar
            </button>
            <button
              onClick={() => onSave(id)}
              className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
              style={isSaved
                ? { background: '#FFF0F0', borderColor: '#FCA5A5' }
                : { background: '#F9F9F9', borderColor: '#E5E5E5' }
              }
            >
              {isSaved
                ? <HeartOff size={18} style={{ color: '#EF4444' }} />
                : <Heart size={18} style={{ color: '#343A40' }} />
              }
            </button>
          </div>

          {/* Mortgage module */}
          {operation === 'venta' && (
            <div
              className="rounded-xl p-4"
              style={{ background: '#EAF2FC' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={16} style={{ color: '#3200C1' }} />
                <p className="text-sm font-bold" style={{ color: '#3200C1' }}>Simula tu dividendo</p>
              </div>
              <p className="text-xs mb-3" style={{ color: '#24018A' }}>
                Dividendo estimado con pie del 20% a 20 años:
              </p>
              <p className="text-xl font-extrabold" style={{ color: '#3200C1' }}>
                ${estimatedMonthly.toLocaleString('es-CL')} k/mes
              </p>
              <p className="text-xs mt-1" style={{ color: '#666' }}>
                Cálculo referencial. Sujeto a evaluación bancaria.
              </p>
            </div>
          )}

          {/* View full */}
          <button
            onClick={() => onViewFull(id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all hover:bg-tt-indigo-50"
            style={{ borderColor: '#3200C1', color: '#3200C1' }}
          >
            Ver ficha completa <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
