import type { SortOption } from '../../types/property';

const options: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Más relevantes' },
  { value: 'price_asc', label: 'Mejor precio' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'sqm_desc', label: 'Mayor superficie' },
];

interface SortBarProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
  count: number;
}

export function SortBar({ value, onChange, count }: SortBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
      <span className="text-sm text-gray-500">{count} resultado{count !== 1 ? 's' : ''}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortOption)}
        className="text-sm text-gray-700 font-medium border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
