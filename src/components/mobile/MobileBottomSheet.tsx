import { useState, useRef, useEffect, useCallback } from 'react';
import { Map, ChevronUp } from 'lucide-react';
import type { Property, SortOption, Filters, AdvancedFilters, SearchInterpretation } from '../../types/property';
import { DEFAULT_ADVANCED_FILTERS } from '../../types/property';
import { PropertyResultCard } from '../results/PropertyResultCard';
import { ContextualBanner, insertBanners } from '../results/ContextualBanner';
import { Paginator } from '../seo/Paginator';
import { MOBILE_HEADER_HEIGHT } from './MobileHeader';
import { MobileFilterPills } from './MobileFilterPills';
import { MobileBannerSlider } from './MobileBannerSlider';

export type SheetState = 'collapsed' | 'half' | 'expanded';
export const SHEET_PEEK_HEIGHT = 80;

const INDIGO = '#3200C1';
const SNAP_TRANSITION = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Relevancia' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'sqm_desc', label: 'Mayor m²' },
];

interface MobileBottomSheetProps {
  properties: Property[];
  savedProperties: Set<string>;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  onSelect: (id: string) => void;
  onSave: (id: string) => void;
  sheetState: SheetState;
  onSheetStateChange: (s: SheetState) => void;
  filters: Filters;
  advancedFilters: AdvancedFilters;
  onFiltersChange: (f: Partial<Filters>) => void;
  onAdvancedFiltersChange: (f: Partial<AdvancedFilters>) => void;
  query: string;
  interpretation: SearchInterpretation | null;
}

function buildResultTitle(filters: Filters, interpretation: SearchInterpretation | null, _query: string): string {
  let type = '';
  let operation = '';
  let zone = '';

  if (interpretation) {
    type = interpretation.propertyType || '';
    operation = interpretation.operation || '';
    zone = interpretation.zone || '';
  } else {
    if (filters.propertyType) {
      const map: Record<string, string> = { departamento: 'Departamentos', casa: 'Casas', oficina: 'Oficinas' };
      type = map[filters.propertyType] || '';
    }
    operation = filters.operation === 'arriendo' ? 'Arriendo' : 'Venta';
    zone = filters.zone;
  }

  const parts: string[] = [];
  parts.push(type || 'Propiedades');
  parts.push(`en ${operation || 'Venta'}`);
  if (zone) parts.push(`en ${zone}`);
  return parts.join(' ');
}

export function MobileBottomSheet({
  properties, savedProperties, sort, onSortChange, onSelect, onSave,
  sheetState, onSheetStateChange,
  filters, advancedFilters, onFiltersChange, onAdvancedFiltersChange,
  query: _query, interpretation,
}: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startY: number;
    startTranslate: number;
    lastY: number;
    lastTime: number;
    active: boolean;
  } | null>(null);

  const [containerHeight, setContainerHeight] = useState(
    () => (typeof window !== 'undefined' ? window.innerHeight - MOBILE_HEADER_HEIGHT : 700)
  );

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const getSnapY = useCallback(
    (state: SheetState): number => {
      switch (state) {
        case 'collapsed': return Math.max(0, containerHeight - SHEET_PEEK_HEIGHT);
        case 'half': return Math.round(containerHeight * 0.50);
        case 'expanded': return 0;
      }
    },
    [containerHeight]
  );

  const applySnap = useCallback(
    (state: SheetState, animate = true) => {
      onSheetStateChange(state);
      if (sheetRef.current) {
        sheetRef.current.style.transition = animate ? SNAP_TRANSITION : 'none';
        sheetRef.current.style.transform = `translateY(${getSnapY(state)}px)`;
      }
    },
    [onSheetStateChange, getSnapY]
  );

  // Sync transform when state or height changes
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = SNAP_TRANSITION;
      sheetRef.current.style.transform = `translateY(${getSnapY(sheetState)}px)`;
    }
  }, [sheetState, getSnapY]);

  // ── Drag handlers ──────────────────────────────────────────

  const beginDrag = (clientY: number, el: HTMLElement, pointerId: number) => {
    el.setPointerCapture(pointerId);
    dragRef.current = {
      startY: clientY,
      startTranslate: getSnapY(sheetState),
      lastY: clientY,
      lastTime: Date.now(),
      active: true,
    };
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  };

  const moveDrag = (clientY: number) => {
    if (!dragRef.current?.active || !sheetRef.current) return;
    const dy = clientY - dragRef.current.startY;
    const raw = dragRef.current.startTranslate + dy;
    const maxY = containerHeight - SHEET_PEEK_HEIGHT;
    const clamped = Math.max(0, Math.min(maxY, raw));
    sheetRef.current.style.transform = `translateY(${clamped}px)`;
    dragRef.current.lastY = clientY;
    dragRef.current.lastTime = Date.now();
  };

  const endDrag = (clientY: number) => {
    if (!dragRef.current?.active) return;
    const drag = dragRef.current;
    dragRef.current = null;

    const elapsed = Math.max(1, Date.now() - drag.lastTime);
    const velocity = (clientY - drag.lastY) / elapsed; // px/ms; positive = down

    let next: SheetState;

    if (Math.abs(velocity) > 0.35) {
      // Flick gesture
      if (velocity > 0) {
        next = sheetState === 'expanded' ? 'half' : 'collapsed';
      } else {
        next = sheetState === 'collapsed' ? 'half' : 'expanded';
      }
    } else {
      // Snap to nearest position
      const current = drag.startTranslate + (clientY - drag.startY);
      const d = {
        collapsed: Math.abs(current - getSnapY('collapsed')),
        half: Math.abs(current - getSnapY('half')),
        expanded: Math.abs(current - getSnapY('expanded')),
      };
      const min = Math.min(d.collapsed, d.half, d.expanded);
      next = min === d.expanded ? 'expanded' : min === d.half ? 'half' : 'collapsed';
    }

    applySnap(next);
  };

  // Handle: always drags the sheet
  const onHandlePD = (e: React.PointerEvent) => {
    beginDrag(e.clientY, e.currentTarget as HTMLElement, e.pointerId);
  };
  const onHandlePM = (e: React.PointerEvent) => {
    if (dragRef.current?.active) moveDrag(e.clientY);
  };
  const onHandlePU = (e: React.PointerEvent) => {
    if (dragRef.current?.active) endDrag(e.clientY);
  };

  // Content: drags sheet when not expanded; in expanded, supports scroll-at-top + drag-down
  const pendingCloseRef = useRef<number | null>(null);
  const onContentPD = (e: React.PointerEvent) => {
    if (sheetState !== 'expanded') {
      beginDrag(e.clientY, e.currentTarget as HTMLElement, e.pointerId);
      return;
    }
    // Expanded: start a pending close if at scroll top
    const atTop = !scrollRef.current || scrollRef.current.scrollTop === 0;
    if (atTop) {
      pendingCloseRef.current = e.clientY;
    }
  };
  const onContentPM = (e: React.PointerEvent) => {
    if (pendingCloseRef.current !== null) {
      const dy = e.clientY - pendingCloseRef.current;
      if (dy > 10) {
        // Confirmed downward gesture from scroll top → convert to sheet drag
        beginDrag(pendingCloseRef.current, e.currentTarget as HTMLElement, e.pointerId);
        pendingCloseRef.current = null;
      } else if (dy < -5) {
        pendingCloseRef.current = null; // going up → cancel
      }
    }
    if (dragRef.current?.active && sheetState !== 'expanded') {
      moveDrag(e.clientY);
    } else if (dragRef.current?.active) {
      moveDrag(e.clientY);
    }
  };
  const onContentPU = (e: React.PointerEvent) => {
    pendingCloseRef.current = null;
    if (dragRef.current?.active) endDrag(e.clientY);
  };

  const items = insertBanners(properties);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: MOBILE_HEADER_HEIGHT,
        left: 0, right: 0, bottom: 0,
        overflow: 'hidden',
        zIndex: 100,
        pointerEvents: 'none', // container is pass-through to the map
      }}
    >
      {/* Pill "Mapa" — only when expanded */}
      {sheetState === 'expanded' && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%', transform: 'translateX(-50%)',
            zIndex: 150,
            pointerEvents: 'auto',
            animation: 'fadeScaleIn 0.18s ease',
          }}
        >
          <button
            onClick={() => applySnap('collapsed')}
            aria-label="Ver mapa"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: INDIGO, color: '#fff',
              border: 'none', borderRadius: 24,
              padding: '9px 20px',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(50,0,193,0.40)',
            }}
          >
            <Map size={14} />
            Mapa
          </button>
        </div>
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="region"
        aria-label="Lista de resultados"
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: '100%',
          background: '#fff',
          borderRadius: '18px 18px 0 0',
          boxShadow: '0 -4px 24px rgba(34,17,96,0.12)',
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${getSnapY(sheetState)}px)`,
          transition: SNAP_TRANSITION,
          pointerEvents: 'auto',
          willChange: 'transform',
        }}
      >
        {/* Drag handle strip — always captures drag */}
        <div
          onPointerDown={onHandlePD}
          onPointerMove={onHandlePM}
          onPointerUp={onHandlePU}
          onPointerCancel={onHandlePU}
          style={{
            padding: '10px 16px 10px',
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
            flexShrink: 0,
            minHeight: 44,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {/* Visual indicator */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#DDD' }} />
          </div>

          {/* Collapsed: peek label (also tappable) */}
          {sheetState === 'collapsed' && (
            <button
              onClick={() => applySnap('half')}
              aria-label="Ver listado de propiedades"
              style={{
                width: '100%', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', padding: '2px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <ChevronUp size={16} style={{ color: '#AAA' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#343A40' }}>
                Ver {properties.length.toLocaleString('es-CL')} propiedades
              </span>
            </button>
          )}

          {/* Half / expanded: count + sort + filter pills */}
          {sheetState !== 'collapsed' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#343A40', margin: 0 }}>
                  {properties.length.toLocaleString('es-CL')} propiedades
                </p>
                <select
                  value={sort}
                  onChange={e => onSortChange(e.target.value as SortOption)}
                  style={{
                    fontSize: 11, fontWeight: 600,
                    border: '1px solid #E5E5E5', borderRadius: 6,
                    padding: '4px 8px', outline: 'none', cursor: 'pointer',
                    color: '#343A40', background: '#fff', fontFamily: 'inherit',
                  }}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <MobileFilterPills
                filters={filters}
                advancedFilters={advancedFilters || DEFAULT_ADVANCED_FILTERS}
                onFiltersChange={onFiltersChange}
                onAdvancedFiltersChange={onAdvancedFiltersChange}
              />
            </>
          )}
        </div>

        {/* Divider */}
        {sheetState !== 'collapsed' && (
          <div style={{ height: 1, background: '#F0F0F0', flexShrink: 0 }} />
        )}

        {/* Scrollable list */}
        <div
          ref={scrollRef}
          onPointerDown={onContentPD}
          onPointerMove={onContentPM}
          onPointerUp={onContentPU}
          onPointerCancel={onContentPU}
          style={{
            flex: 1,
            overflowY: sheetState === 'expanded' ? 'auto' : 'hidden',
            overscrollBehavior: 'contain',
            touchAction: sheetState === 'expanded' ? 'pan-y' : 'none',
            background: '#F5F5F5',
          }}
        >
          <div style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Result title */}
            {sheetState !== 'collapsed' && (
              <h2 style={{
                fontSize: 16, fontWeight: 800, color: '#343A40',
                margin: 0, lineHeight: 1.3,
              }}>
                {buildResultTitle(filters, interpretation, _query)}
              </h2>
            )}

            {/* Banner slider — appears before cards */}
            {sheetState !== 'collapsed' && <MobileBannerSlider />}

            {items.map((item, i) => {
              if ('__banner' in item) {
                return <ContextualBanner key={`banner-${i}`} variant={item.variant} />;
              }
              const p = item as Property;
              return (
                <PropertyResultCard
                  key={p.id}
                  property={p}
                  layout="vertical"
                  isHighlighted={false}
                  isSaved={savedProperties.has(p.id)}
                  onSelect={onSelect}
                  onSave={onSave}
                  onHoverEnter={() => {}}
                  onHoverLeave={() => {}}
                />
              );
            })}

            {properties.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#343A40' }}>Sin resultados</p>
                <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  Ajusta los filtros para ver más propiedades.
                </p>
              </div>
            )}

            {properties.length > 0 && <Paginator />}
            {/* Safe area bottom buffer */}
            <div style={{ height: 'max(24px, env(safe-area-inset-bottom))' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
