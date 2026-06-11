import { X, Bed, Bath, Maximize2, ArrowRight } from 'lucide-react';
import type { Property } from '../../types/property';
import { formatPriceUF, formatRent } from '../../data/mockProperties';
import { CommercialBadge } from '../ui/CommercialBadge';

interface MapPinCardProps {
  property: Property;
  onClose: () => void;
  onViewFull: (id: string) => void;
}

export function MapPinCard({ property, onClose, onViewFull }: MapPinCardProps) {
  const { id, imageUrl, address, zone, bedrooms, bathrooms, sqm, priceUF, price, operation, commercialStatus, isNewProject } = property;
  const priceDisplay = operation === 'arriendo' ? formatRent(price) : formatPriceUF(priceUF);
  const priceClp = operation === 'venta' && price >= 1_000_000
    ? `$${(price / 1_000_000).toFixed(1).replace('.', ',')} mill.`
    : null;

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2"
      style={{ zIndex: 800, width: 296 }}
      onClick={e => e.stopPropagation()}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 8px 32px rgba(34,17,96,0.18)' }}
      >
        {/* Image */}
        <div className="relative" style={{ height: 120 }}>
          <img src={imageUrl} alt={address} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-opacity hover:opacity-80"
            style={{ background: '#fff' }}
          >
            <X size={13} style={{ color: '#343A40' }} />
          </button>
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            <CommercialBadge status={commercialStatus} compact />
            {isNewProject && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#3200C1', color: '#37FFDB', fontSize: 9 }}>
                PROYECTO
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-base font-extrabold leading-tight" style={{ color: '#3200C1' }}>
            {priceDisplay}
          </p>
          {priceClp && (
            <p className="text-xs" style={{ color: '#666' }}>{priceClp}</p>
          )}
          <p className="text-sm font-semibold mt-1 truncate" style={{ color: '#343A40' }}>{address}</p>
          <p className="text-xs" style={{ color: '#666' }}>{zone}</p>

          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#666' }}>
            {bedrooms > 0 && (
              <span className="flex items-center gap-1"><Bed size={11} /> {bedrooms} dorm.</span>
            )}
            <span className="flex items-center gap-1"><Bath size={11} /> {bathrooms}</span>
            <span className="flex items-center gap-1"><Maximize2 size={11} /> {sqm} m²</span>
          </div>

          <button
            onClick={() => onViewFull(id)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#3200C1', color: '#fff' }}
          >
            Ver propiedad <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
