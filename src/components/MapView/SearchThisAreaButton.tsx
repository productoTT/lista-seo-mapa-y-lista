import { Search } from 'lucide-react';

interface SearchThisAreaButtonProps {
  onSearch: () => void;
  onClear: () => void;
  isActive: boolean;
}

export function SearchThisAreaButton({ onSearch, onClear, isActive }: SearchThisAreaButtonProps) {
  if (!isActive) return null;
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
      <button
        onClick={onSearch}
        className="flex items-center gap-2 bg-white text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-150 hover:shadow-xl"
      >
        <Search size={15} className="text-blue-600" />
        Buscar en esta zona
      </button>
      <button
        onClick={onClear}
        className="bg-white text-gray-500 text-sm px-3 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-150"
      >
        ✕
      </button>
    </div>
  );
}
