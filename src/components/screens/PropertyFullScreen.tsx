import { ArrowLeft, Bed, Bath, Maximize2, Phone, Heart } from 'lucide-react';
import type { Property } from '../../types/property';
import { CommercialBadge } from '../ui/CommercialBadge';
import { formatPriceUF, formatRent, mockProperties } from '../../data/mockProperties';
import { PropertyResultCard } from '../results/PropertyResultCard';

interface PropertyFullScreenProps {
  property: Property;
  savedProperties: Set<string>;
  onBack: () => void;
  onContact: (id: string) => void;
  onSave: (id: string) => void;
  onSelectSimilar: (id: string) => void;
}

const EXTRA_IMAGES = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80',
];

export function PropertyFullScreen({ property, savedProperties, onBack, onContact, onSave, onSelectSimilar }: PropertyFullScreenProps) {
  const { id, title, imageUrl, priceUF, price, address, zone, bedrooms, bathrooms, sqm, sqmTotal, description, commercialStatus, isNewProject, operation } = property;
  const priceDisplay = operation === 'arriendo' ? formatRent(price) : formatPriceUF(priceUF);

  const similar = mockProperties
    .filter(p => p.id !== id && p.zone === zone)
    .slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: '#F9F9F9' }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 border-b"
        style={{ background: '#fff', borderColor: '#E5E5E5' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70"
          style={{ color: '#3200C1' }}
        >
          <ArrowLeft size={18} />
          Volver a resultados
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onContact(id)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: '#3200C1', color: '#fff' }}
        >
          <Phone size={14} />
          Contactar
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Gallery */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden" style={{ height: 320 }}>
          <div className="col-span-2 row-span-1">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-2">
            {EXTRA_IMAGES.slice(0, 2).map((img, i) => (
              <img key={i} src={img} alt="" className="w-full flex-1 object-cover" style={{ height: '50%' }} />
            ))}
          </div>
        </div>

        {/* Title + badges */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <CommercialBadge status={commercialStatus} />
              {isNewProject && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#3200C1', color: '#37FFDB', fontSize: 10 }}>
                  PROYECTO NUEVO
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#343A40' }}>{title}</h1>
            <p className="text-base mt-0.5" style={{ color: '#666' }}>{address}, {zone}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold" style={{ color: '#3200C1' }}>{priceDisplay}</p>
            <p className="text-xs mt-0.5" style={{ color: '#666' }}>
              {operation === 'venta' ? 'Precio de venta' : 'Arriendo mensual'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-4 p-4 rounded-2xl border"
          style={{ background: '#EAF2FC', borderColor: '#B2D0FF' }}
        >
          {bedrooms > 0 && (
            <div className="flex items-center gap-3">
              <Bed size={24} style={{ color: '#3200C1' }} />
              <div>
                <p className="text-xl font-extrabold" style={{ color: '#343A40' }}>{bedrooms}</p>
                <p className="text-xs" style={{ color: '#666' }}>Dormitorios</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Bath size={24} style={{ color: '#3200C1' }} />
            <div>
              <p className="text-xl font-extrabold" style={{ color: '#343A40' }}>{bathrooms}</p>
              <p className="text-xs" style={{ color: '#666' }}>Baños</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Maximize2 size={24} style={{ color: '#3200C1' }} />
            <div>
              <p className="text-xl font-extrabold" style={{ color: '#343A40' }}>{sqm}m²</p>
              <p className="text-xs" style={{ color: '#666' }}>Útiles / {sqmTotal}m² total</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl p-5 border" style={{ background: '#fff', borderColor: '#E5E5E5' }}>
          <h2 className="font-extrabold text-lg mb-3" style={{ color: '#343A40' }}>Descripción</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#343A40' }}>{description}</p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: '#666' }}>
            Esta propiedad se ubica en una de las zonas más cotizadas de {zone}, con excelente acceso a transporte público, comercio, servicios y áreas verdes. El edificio cuenta con las comodidades que necesitas para una vida cómoda y conectada.
          </p>
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <button
            onClick={() => onContact(id)}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base"
            style={{ background: '#3200C1', color: '#fff' }}
          >
            <Phone size={18} />
            Contactar al anunciante
          </button>
          <button
            onClick={() => onSave(id)}
            className="w-14 h-14 rounded-xl flex items-center justify-center border"
            style={savedProperties.has(id)
              ? { background: '#FFF0F0', borderColor: '#FCA5A5' }
              : { background: '#F9F9F9', borderColor: '#E5E5E5' }
            }
          >
            <Heart size={20} style={{ color: savedProperties.has(id) ? '#EF4444' : '#343A40' }} />
          </button>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <div>
            <h2 className="font-extrabold text-lg mb-4" style={{ color: '#343A40' }}>
              Propiedades similares en {zone}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {similar.map(p => (
                <PropertyResultCard
                  key={p.id}
                  property={p}
                  isSaved={savedProperties.has(p.id)}
                  onSelect={onSelectSimilar}
                  onSave={onSave}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features post-MVP teaser */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: '#F9F9F9', borderColor: '#E5E5E5' }}
        >
          <h3 className="font-bold text-sm mb-3" style={{ color: '#666' }}>Próximamente</h3>
          <div className="flex flex-wrap gap-2">
            {['Dibujar zona', 'Buscar cerca de metro', 'Buscar por tiempo de viaje', 'Capas de precio UF/m²', 'Comparar zonas'].map(f => (
              <span key={f} className="text-xs font-semibold px-3 py-1.5 rounded-full border" style={{ borderColor: '#E5E5E5', color: '#999', background: '#fff' }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
