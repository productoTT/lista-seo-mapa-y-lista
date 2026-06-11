import { useEffect, useRef, useState } from 'react';
import type { Property, SortOption } from '../../types/property';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';
import { SortBar } from './SortBar';
import { EmptyState } from './EmptyState';

interface PropertyListProps {
  properties: Property[];
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  hoveredId: string | null;
  onHoverCard: (id: string | null) => void;
}

export function PropertyList({ properties, sort, onSortChange, hoveredId, onHoverCard }: PropertyListProps) {
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll to highlighted card when hovered from map
  useEffect(() => {
    if (hoveredId && cardRefs.current[hoveredId]) {
      cardRefs.current[hoveredId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hoveredId]);

  return (
    <div className="flex flex-col h-full">
      <SortBar value={sort} onChange={onSortChange} count={properties.length} />
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-4 space-y-4">
            {properties.map(p => (
              <div
                key={p.id}
                ref={el => { cardRefs.current[p.id] = el; }}
              >
                <PropertyCard
                  property={p}
                  isHighlighted={hoveredId === p.id}
                  onMouseEnter={onHoverCard}
                  onMouseLeave={() => onHoverCard(null)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
