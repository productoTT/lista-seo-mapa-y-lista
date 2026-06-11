import { Bed, Bath, Maximize2 } from 'lucide-react';
import type { Property } from '../../types/property';
import { Badge } from '../ui/Badge';
import { formatPrice } from '../../data/mockProperties';

interface PropertyCardProps {
  property: Property;
  isHighlighted: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export function PropertyCard({ property, isHighlighted, onMouseEnter, onMouseLeave }: PropertyCardProps) {
  const { id, price, address, zone, bedrooms, bathrooms, sqm, badges, imageUrl } = property;

  return (
    <div
      onMouseEnter={() => onMouseEnter(id)}
      onMouseLeave={onMouseLeave}
      className={`bg-white rounded-xl overflow-hidden border transition-all duration-150 cursor-pointer hover:shadow-md ${
        isHighlighted
          ? 'border-blue-500 shadow-md shadow-blue-100 ring-1 ring-blue-400'
          : 'border-gray-100'
      }`}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={address}
          className="w-full h-44 object-cover"
          loading="lazy"
        />
        {badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
            {badges.map(b => <Badge key={b} type={b} />)}
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-lg font-bold text-blue-600 leading-tight">{formatPrice(price)}</p>
        <p className="text-sm text-gray-700 font-medium mt-0.5 truncate">{address}</p>
        <p className="text-xs text-gray-400 mt-0.5">{zone}</p>
        <div className="flex items-center gap-4 mt-3 text-gray-500 text-xs">
          {bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed size={13} className="text-gray-400" /> {bedrooms} dorm.
            </span>
          )}
          <span className="flex items-center gap-1">
            <Bath size={13} className="text-gray-400" /> {bathrooms} baño{bathrooms !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={13} className="text-gray-400" /> {sqm} m²
          </span>
        </div>
      </div>
    </div>
  );
}
