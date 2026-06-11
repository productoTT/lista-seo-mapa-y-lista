// Legacy FiltersBar — replaced by ResultsHeader
// Kept to avoid import errors in legacy code paths
import type { Filters } from '../../types/property';

interface FiltersBarProps {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  resultCount: number;
}

export function FiltersBar(_props: FiltersBarProps) {
  return null;
}
