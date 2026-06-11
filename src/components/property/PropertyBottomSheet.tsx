import { useState } from 'react';
import { ChevronUp, ChevronDown, Phone, Bed, Bath, Maximize2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Property } from '../../types/property';
import { CommercialBadge } from '../ui/CommercialBadge';
import { formatPriceUF, formatRent } from '../../data/mockProperties';

interface PropertyBottomSheetProps {
  properties: Property[];
  activeIndex: number;
  onChangeIndex: (i: number) => void;
  onContact: (id: string) => void;
  onViewFull: (id: string) => void;
}

export function PropertyBottomSheet({ properties, activeIndex, onChangeIndex, onContact, onViewFull }: PropertyBottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const property = properties[activeIndex];

  if (!property || properties.length === 0) return null;

  const { id, imageUrl, priceUF, price, address, zone, bedrooms, bathrooms, sqm, commercialStatus, operation } = property;
  const priceDisplay = operation === 'arriendo' ? formatRent(price) : formatPriceUF(priceUF);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 transition-all duration-300"
      style={{ zIndex: 1200 }}
    >
      <div
        className="rounded-t-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 -4px 24px rgba(34,17,96,0.12)' }}
      >
        {/* Drag handle */}
        <button
          className="w-full flex items-center justify-center py-2"
          onClick={() => setExpanded(s => !s)}
        >
          <div className="w-10 h-1 rounded-full" style={{ background: '#E5E5E5' }} />
        </button>

        {/* Collapsed: card strip */}
        {!expanded ? (
          <div className="px-4 pb-4">
            <div className="flex items-start gap-3">
              <img src={imageUrl} alt={address} className="w-20 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CommercialBadge status={commercialStatus} compact />
                </div>
                <p className="text-base font-extrabold" style={{ color: '#3200C1' }}>{priceDisplay}</p>
                <p className="text-sm truncate" style={{ color: '#343A40' }}>{address}</p>
                <p className="text-xs" style={{ color: '#666' }}>{zone}</p>
              </div>
              <button
                onClick={() => setExpanded(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{ borderColor: '#E5E5E5', background: '#F9F9F9' }}
              >
                <ChevronUp size={16} style={{ color: '#3200C1' }} />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => onChangeIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="w-9 h-9 rounded-xl flex items-center justify-center border disabled:opacity-30"
                style={{ borderColor: '#E5E5E5' }}
              >
                <ChevronLeft size={16} style={{ color: '#343A40' }} />
              </button>
              <p className="text-xs font-semibold" style={{ color: '#666' }}>
                {activeIndex + 1} de {properties.length}
              </p>
              <button
                onClick={() => onChangeIndex(Math.min(properties.length - 1, activeIndex + 1))}
                disabled={activeIndex === properties.length - 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center border disabled:opacity-30"
                style={{ borderColor: '#E5E5E5' }}
              >
                <ChevronRight size={16} style={{ color: '#343A40' }} />
              </button>
            </div>
          </div>
        ) : (
          // Expanded panel
          <div className="px-4 pb-6" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-extrabold" style={{ color: '#3200C1' }}>{priceDisplay}</p>
              <button onClick={() => setExpanded(false)}>
                <ChevronDown size={20} style={{ color: '#343A40' }} />
              </button>
            </div>

            <img src={imageUrl} alt={address} className="w-full h-40 object-cover rounded-xl mb-3" />

            <p className="text-sm font-semibold" style={{ color: '#343A40' }}>{address}</p>
            <p className="text-sm" style={{ color: '#666' }}>{zone}</p>

            <div className="flex gap-4 mt-3 text-sm" style={{ color: '#666' }}>
              {bedrooms > 0 && <span className="flex items-center gap-1.5"><Bed size={14} /> {bedrooms} dorm.</span>}
              <span className="flex items-center gap-1.5"><Bath size={14} /> {bathrooms} baño{bathrooms !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1.5"><Maximize2 size={14} /> {sqm}m²</span>
            </div>

            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => onContact(id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                style={{ background: '#3200C1', color: '#fff' }}
              >
                <Phone size={15} /> Contactar
              </button>
              <button
                onClick={() => onViewFull(id)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm border"
                style={{ borderColor: '#3200C1', color: '#3200C1' }}
              >
                Ficha <ArrowRight size={14} />
              </button>
            </div>

            {/* Nav between cards */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => onChangeIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="flex items-center gap-1 text-sm font-bold disabled:opacity-30"
                style={{ color: '#3200C1' }}
              >
                <ChevronLeft size={15} /> Anterior
              </button>
              <p className="text-xs" style={{ color: '#666' }}>{activeIndex + 1} / {properties.length}</p>
              <button
                onClick={() => onChangeIndex(Math.min(properties.length - 1, activeIndex + 1))}
                disabled={activeIndex === properties.length - 1}
                className="flex items-center gap-1 text-sm font-bold disabled:opacity-30"
                style={{ color: '#3200C1' }}
              >
                Siguiente <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
