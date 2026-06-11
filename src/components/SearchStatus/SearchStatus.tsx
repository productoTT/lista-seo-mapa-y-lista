import { TrendingDown, Sparkles } from 'lucide-react';

interface SearchStatusProps {
  count: number;
  zone: string;
  newCount: number;
  priceDropCount: number;
}

export function SearchStatus({ count, zone, newCount, priceDropCount }: SearchStatusProps) {
  return (
    <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-3 text-sm border border-gray-100">
      <span className="font-semibold text-gray-800">
        {count.toLocaleString()} propiedades
        {zone ? ` en ${zone}` : ''}
      </span>
      {newCount > 0 && (
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <Sparkles size={13} />
          {newCount} nuevas
        </span>
      )}
      {priceDropCount > 0 && (
        <span className="flex items-center gap-1 text-amber-600 font-medium">
          <TrendingDown size={13} />
          {priceDropCount} bajaron precio
        </span>
      )}
    </div>
  );
}
