import { Bed, Bath, Maximize2 } from 'lucide-react';
import type { Property } from '../../types/property';
import { Badge } from '../ui/Badge';
import { formatPrice } from '../../data/mockProperties';

export function PropertyPreviewCard({ property }: { property: Property }) {
  const { price, address, zone, bedrooms, bathrooms, sqm, badges, imageUrl } = property;
  return (
    <div className="w-52">
      <div className="relative">
        <img src={imageUrl} alt={address} className="w-full h-28 object-cover" />
        {badges.length > 0 && (
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            {badges.slice(0, 2).map(b => <Badge key={b} type={b} />)}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-base font-bold text-blue-600">{formatPrice(price)}</p>
        <p className="text-xs text-gray-600 truncate mt-0.5">{address}</p>
        <p className="text-xs text-gray-400">{zone}</p>
        <div className="flex gap-3 mt-2 text-xs text-gray-500">
          {bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed size={11} />{bedrooms}</span>}
          <span className="flex items-center gap-0.5"><Bath size={11} />{bathrooms}</span>
          <span className="flex items-center gap-0.5"><Maximize2 size={11} />{sqm}m²</span>
        </div>
      </div>
    </div>
  );
}
