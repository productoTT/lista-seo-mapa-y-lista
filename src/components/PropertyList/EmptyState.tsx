import { SearchX } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <SearchX size={28} className="text-gray-400" />
      </div>
      <h3 className="text-gray-700 font-semibold text-base mb-1">Sin resultados</h3>
      <p className="text-gray-400 text-sm max-w-xs">
        No encontramos propiedades con estos filtros. Intenta ampliar el rango de precio o cambiar la zona.
      </p>
    </div>
  );
}
