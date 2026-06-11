import { useMemo, useState } from 'react';
import type { Filters, MapBounds, Property, SortOption } from '../types/property';
import { DEFAULT_FILTERS } from '../types/property';
import { mockProperties } from '../data/mockProperties';

function sortProperties(props: Property[], sort: SortOption): Property[] {
  const arr = [...props];
  switch (sort) {
    case 'price_asc': return arr.sort((a, b) => a.priceUF - b.priceUF);
    case 'price_desc': return arr.sort((a, b) => b.priceUF - a.priceUF);
    case 'newest': return arr.sort((a, b) => b.listedAt - a.listedAt);
    case 'sqm_desc': return arr.sort((a, b) => b.sqm - a.sqm);
    default: return arr.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export function usePropertyFilter() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('relevant');
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  const filtered = useMemo(() => {
    let result = mockProperties.filter(p => {
      if (p.priceUF < filters.priceMinUF || p.priceUF > filters.priceMaxUF) return false;
      if (filters.bedrooms !== null && p.bedrooms !== filters.bedrooms) return false;
      if (filters.propertyType && p.type !== filters.propertyType) return false;
      if (filters.zone && p.zone !== filters.zone) return false;
      if (filters.operation && p.operation !== filters.operation) return false;
      if (mapBounds) {
        if (p.lat > mapBounds.north || p.lat < mapBounds.south) return false;
        if (p.lng > mapBounds.east || p.lng < mapBounds.west) return false;
      }
      return true;
    });
    return sortProperties(result, sort);
  }, [filters, sort, mapBounds]);

  const newCount = filtered.filter(p => p.badges.includes('new')).length;
  const pricedropCount = filtered.filter(p => p.badges.includes('price_drop')).length;

  return {
    filters,
    setFilters,
    sort,
    setSort,
    filtered,
    mapBounds,
    setMapBounds,
    newCount,
    pricedropCount,
  };
}
