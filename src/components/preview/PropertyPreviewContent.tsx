import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { Bed, Bath, Maximize2, Car, Package, Heart, HeartOff, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Property } from '../../types/property';
import { formatPriceUF, formatRent } from '../../data/mockProperties';
import { PropertyGallery } from './PropertyGallery';
import { PreviewActions } from './PreviewActions';
import type { PropertyPreviewController } from './usePropertyPreview';

const INDIGO = '#3200C1';
const FG1 = '#343A40';
const FG3 = '#666666';
const PINK = '#F05C89';
const DIVIDER = '#E5E5E5';
const SURFACE = '#fff';
const DESCRIPTION_LIMIT = 220;

interface PropertyPreviewContentProps {
  property: Property;
  controller: PropertyPreviewController;
  isSaved: boolean;
  onSave: (id: string) => void;
  onViewFull: (id: string) => void;
  allProperties: Property[];
  onSelectSimilar: (id: string) => void;
  compact?: boolean;
  galleryHeight?: number;
  hideActions?: boolean;
  hideGallery?: boolean;
}

export function PropertyPreviewContent({
  property, controller, isSaved, onSave, onViewFull, allProperties, onSelectSimilar,
  compact = false, galleryHeight, hideActions = false, hideGallery = false,
}: PropertyPreviewContentProps) {
  const { loadState, toggles, stage } = controller;
  const images = property.images && property.images.length > 0 ? property.images : [property.imageUrl];
  const isRent = property.operation === 'arriendo';
  const pricePrimary = isRent ? formatRent(property.price) : formatPriceUF(property.priceUF);
  const priceSecondary = toggles.clpEquivalent
    ? (isRent ? `≈ ${formatPriceUF(property.priceUF)}` : `$${property.price.toLocaleString('es-CL')}`)
    : null;

  if (loadState === 'loading') {
    return <PreviewSkeleton compact={compact} />;
  }

  if (loadState === 'error') {
    return (
      <div style={{ padding: compact ? 16 : 24, textAlign: 'center' }}>
        <AlertTriangle size={28} color="#EF4444" style={{ marginBottom: 10 }} />
        <p style={{ fontSize: 14, fontWeight: 800, color: FG1, margin: '0 0 4px' }}>No pudimos cargar esta propiedad</p>
        <p style={{ fontSize: 12, color: FG3, margin: '0 0 14px' }}>Ocurrió un problema al obtener la información. Intenta nuevamente.</p>
        <button
          onClick={controller.retry}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: INDIGO, color: '#fff', border: 0, borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <RefreshCw size={13} /> Reintentar
        </button>
      </div>
    );
  }

  const similar = toggles.similar
    ? allProperties.filter(p => p.id !== property.id && p.zone === property.zone).slice(0, 2)
    : [];

  const descriptionText = property.description?.trim() || '';
  const isLongDescription = descriptionText.length > DESCRIPTION_LIMIT;
  const shownDescription = !descriptionText
    ? null
    : (toggles.descriptionExpanded || !isLongDescription)
      ? descriptionText
      : `${descriptionText.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`;

  return (
    <div style={{ padding: compact ? 14 : 20, display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
      {!hideGallery && (
        <PropertyGallery
          images={images}
          title={property.title}
          index={controller.galleryIndex}
          onIndexChange={controller.setGalleryIndex}
          expanded={false}
          onToggleExpanded={() => controller.setGalleryExpanded(true)}
          height={galleryHeight ?? (compact ? 160 : 260)}
        />
      )}

      {/* ── Info principal ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <p style={{ fontSize: compact ? 15 : 17, fontWeight: 800, color: FG1, margin: 0, lineHeight: 1.3 }}>{property.title}</p>
            <p style={{ fontSize: 12, color: FG3, margin: '2px 0 0' }}>{property.address}</p>
            <p style={{ fontSize: 12, color: FG3, margin: 0 }}>{property.zone} · {isRent ? 'Arriendo' : 'Venta'}</p>
          </div>
          {!compact && (
            <button
              onClick={() => onSave(property.id)}
              aria-label={isSaved ? 'Quitar de guardados' : 'Guardar propiedad'}
              style={{
                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                background: isSaved ? '#FFF0F0' : '#F9F9F9', border: `1px solid ${isSaved ? '#FCA5A5' : DIVIDER}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isSaved ? <HeartOff size={15} color={PINK} /> : <Heart size={15} color={INDIGO} />}
            </button>
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: compact ? 19 : 24, fontWeight: 800, color: INDIGO, letterSpacing: '-0.01em' }}>{pricePrimary}</span>
          {priceSecondary && <span style={{ fontSize: 12, color: FG3, marginLeft: 8 }}>{priceSecondary}</span>}
        </div>
      </div>

      {/* ── Specs ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 10 : 16, padding: `${compact ? 8 : 12}px 0`, borderTop: `1px solid ${DIVIDER}`, borderBottom: `1px solid ${DIVIDER}` }}>
        {property.bedrooms > 0 && <Spec icon={<Bed size={15} color={INDIGO} />} value={property.bedrooms} label="dorm." />}
        {property.bathrooms > 0 && <Spec icon={<Bath size={15} color={INDIGO} />} value={property.bathrooms} label="baños" />}
        <Spec icon={<Maximize2 size={15} color={INDIGO} />} value={`${property.sqm}m²`} label={`útil${!compact ? ` / ${property.sqmTotal}m² tot.` : ''}`} />
        {!!property.parkingSpots && <Spec icon={<Car size={15} color={INDIGO} />} value={property.parkingSpots} label="estac." />}
        {!!property.storageUnits && <Spec icon={<Package size={15} color={INDIGO} />} value={property.storageUnits} label="bodega" />}
      </div>

      {/* ── Descripción ── */}
      <div>
        {shownDescription ? (
          <p style={{ fontSize: 13, lineHeight: 1.55, color: FG1, margin: 0 }}>
            {shownDescription}
            {isLongDescription && (
              <button
                onClick={() => controller.toggle('descriptionExpanded')}
                style={{ display: 'inline', marginLeft: 6, border: 0, background: 'none', color: INDIGO, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
              >
                {toggles.descriptionExpanded ? 'Leer menos' : 'Leer más'}
              </button>
            )}
          </p>
        ) : (
          <p style={{ fontSize: 13, fontStyle: 'italic', color: FG3, margin: 0 }}>Sin descripción disponible para esta propiedad.</p>
        )}
      </div>

      {/* ── Acciones / contacto ── */}
      {!hideActions && (
        <PreviewActions
          propertyId={property.id}
          propertyTitle={property.title}
          controller={controller}
          isSaved={isSaved}
          onSave={onSave}
          onViewFull={onViewFull}
          compact={compact}
        />
      )}

      {/* ── Propiedades similares ── */}
      {similar.length > 0 && stage === 'preview' && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: FG1, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Propiedades similares
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {similar.map(s => (
              <button
                key={s.id}
                onClick={() => onSelectSimilar(s.id)}
                style={{
                  display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left',
                  border: `1px solid ${DIVIDER}`, borderRadius: 8, padding: 8, background: SURFACE, cursor: 'pointer',
                }}
              >
                <img src={s.imageUrl} alt={s.title} style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: FG1, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</p>
                  <p style={{ fontSize: 12, fontWeight: 800, color: INDIGO, margin: '2px 0 0' }}>
                    {s.operation === 'arriendo' ? formatRent(s.price) : formatPriceUF(s.priceUF)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {controller.galleryExpanded && createPortal(
        <div
          onClick={() => controller.setGalleryExpanded(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(17,10,40,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 900 }}>
            <PropertyGallery
              images={images}
              title={property.title}
              index={controller.galleryIndex}
              onIndexChange={controller.setGalleryIndex}
              expanded
              onToggleExpanded={() => controller.setGalleryExpanded(false)}
              height={560}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Spec({ icon, value, label }: { icon: ReactNode; value: string | number; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: FG1 }}>
      {icon} <strong style={{ fontWeight: 700 }}>{value}</strong> {label}
    </span>
  );
}

function PreviewSkeleton({ compact }: { compact: boolean }) {
  const bar = (w: string, h = 12) => (
    <div style={{ width: w, height: h, borderRadius: 6, background: '#EDEBF7' }} />
  );
  return (
    <div style={{ padding: compact ? 14 : 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ height: compact ? 160 : 260, borderRadius: 10, background: '#EDEBF7' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bar('70%', 16)}
        {bar('45%')}
        {bar('30%')}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {bar('60px')}{bar('60px')}{bar('60px')}
      </div>
      {bar('100%', 60)}
      {bar('100%', 42)}
    </div>
  );
}
