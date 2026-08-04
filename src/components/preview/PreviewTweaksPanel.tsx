import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sliders, RotateCcw, X } from 'lucide-react';
import type { Property } from '../../types/property';
import type {
  PreviewVariant, PreviewOrigin, DrawerSize, ModalColumns, MapPanelSize, MapReplaceView, BackgroundMode,
  PreviewToggles,
} from './previewTypes';
import { VARIANT_LABELS, ORIGIN_LABELS } from './previewTypes';
import type { PropertyPreviewController } from './usePropertyPreview';

const INDIGO = '#3200C1';
const DIVIDER = '#E5E5E5';
const FG1 = '#343A40';
const FG3 = '#666666';

type ExperienceState = 'none' | 'preview' | 'contact' | 'contact-sent' | 'gallery-expanded' | 'loading' | 'error';

const EXPERIENCE_OPTIONS: { value: ExperienceState; label: string }[] = [
  { value: 'none', label: 'Sin propiedad seleccionada' },
  { value: 'preview', label: 'Preview abierta' },
  { value: 'contact', label: 'Formulario de contacto' },
  { value: 'contact-sent', label: 'Contacto enviado' },
  { value: 'gallery-expanded', label: 'Galería expandida' },
  { value: 'loading', label: 'Estado de carga' },
  { value: 'error', label: 'Error al cargar' },
];

const CONTENT_TOGGLES: { key: keyof PreviewToggles; label: string }[] = [
  { key: 'similar', label: 'Propiedades similares' },
  { key: 'descriptionExpanded', label: 'Descripción expandida' },
  { key: 'clpEquivalent', label: 'Equivalente en pesos' },
  { key: 'prevNext', label: 'Navegación anterior/siguiente' },
];

interface PreviewTweaksPanelProps {
  controller: PropertyPreviewController;
  properties: Property[];
}

export function PreviewTweaksPanel({ controller, properties }: PreviewTweaksPanelProps) {
  const [open, setOpen] = useState(false);

  const ensureOpen = (origin: PreviewOrigin) => {
    if (!controller.propertyId) {
      const fallbackId = properties[0]?.id;
      if (fallbackId) controller.open(fallbackId, origin);
    }
  };

  const applyExperience = (state: ExperienceState) => {
    switch (state) {
      case 'none':
        controller.close();
        return;
      case 'preview':
        ensureOpen('card');
        controller.setStage('preview');
        controller.setLoadState('idle');
        controller.setGalleryExpanded(false);
        return;
      case 'contact':
        ensureOpen('card');
        controller.setStage('contact');
        controller.setLoadState('idle');
        return;
      case 'contact-sent':
        ensureOpen('card');
        controller.setStage('contact-sent');
        controller.setLoadState('idle');
        return;
      case 'gallery-expanded':
        ensureOpen('card');
        controller.setStage('preview');
        controller.setLoadState('idle');
        controller.setGalleryExpanded(true);
        return;
      case 'loading':
        ensureOpen('card');
        controller.setLoadState('loading');
        return;
      case 'error':
        ensureOpen('card');
        controller.setLoadState('error');
        return;
    }
  };

  const currentExperience: ExperienceState = !controller.propertyId
    ? 'none'
    : controller.loadState === 'loading' ? 'loading'
    : controller.loadState === 'error' ? 'error'
    : controller.galleryExpanded ? 'gallery-expanded'
    : controller.stage;

  const applyOrigin = (o: PreviewOrigin) => {
    ensureOpen(o);
    controller.setOrigin(o);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Comparar variantes de ficha resumida"
        style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 1400,
          width: 44, height: 44, borderRadius: '50%', background: INDIGO, border: 0,
          boxShadow: '0 2px 12px rgba(50,0,193,0.25)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Sliders size={18} color="#37FFDB" />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 1400, width: 268,
      background: '#fff', border: `1px solid ${DIVIDER}`, borderRadius: 12,
      boxShadow: '0 8px 32px rgba(50,0,193,0.2)', maxHeight: '82vh', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px', position: 'sticky', top: 0, background: '#fff' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', margin: 0 }}>Comparar ficha resumida</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: INDIGO, margin: '2px 0 0' }}>{VARIANT_LABELS[controller.variant]}</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Cerrar panel" style={{ border: 0, background: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={15} color={FG3} />
        </button>
      </div>

      <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Section title="Variante de visualización">
          <SegmentedGroup<PreviewVariant>
            options={(['drawer', 'modal', 'map-panel', 'map-replace'] as PreviewVariant[]).map(v => ({ value: v, label: VARIANT_LABELS[v] }))}
            value={controller.variant}
            onChange={controller.setVariant}
            stacked
          />
        </Section>

        <Section title="Estado de la experiencia">
          <SegmentedGroup<ExperienceState>
            options={EXPERIENCE_OPTIONS}
            value={currentExperience}
            onChange={applyExperience}
            stacked
          />
        </Section>

        <Section title="Origen de la selección">
          <SegmentedGroup<PreviewOrigin>
            options={(['card', 'ver-mas', 'marker', 'map-preview'] as PreviewOrigin[]).map(o => ({ value: o, label: ORIGIN_LABELS[o] }))}
            value={controller.origin}
            onChange={applyOrigin}
            stacked
          />
        </Section>

        <Section title="Configuración del contenedor">
          {controller.variant === 'drawer' && (
            <SegmentedGroup<DrawerSize>
              options={[{ value: 'compact', label: 'Compacto' }, { value: 'amplio', label: 'Amplio' }]}
              value={controller.drawerSize}
              onChange={(v: DrawerSize) => controller.setDrawerSize(v)}
            />
          )}
          {controller.variant === 'modal' && (
            <SegmentedGroup<ModalColumns>
              options={[{ value: 1, label: '1 columna' }, { value: 2, label: '2 columnas' }]}
              value={controller.modalColumns}
              onChange={(v: ModalColumns) => controller.setModalColumns(v)}
            />
          )}
          {controller.variant === 'map-panel' && (
            <SegmentedGroup<MapPanelSize>
              options={[{ value: 'compact', label: 'Compacto' }, { value: 'expanded', label: 'Expandido' }]}
              value={controller.mapPanelSize}
              onChange={(v: MapPanelSize) => controller.setMapPanelSize(v)}
            />
          )}
          {controller.variant === 'map-replace' && (
            <SegmentedGroup<MapReplaceView>
              options={[{ value: 'ficha', label: 'Vista ficha' }, { value: 'mapa', label: 'Vista mapa' }]}
              value={controller.mapReplaceView}
              onChange={(v: MapReplaceView) => controller.setMapReplaceView(v)}
            />
          )}
        </Section>

        <Section title="Comportamiento del fondo">
          <SegmentedGroup<BackgroundMode>
            options={[
              { value: 'interactive', label: 'Totalmente interactivo' },
              { value: 'blocked', label: 'Visible pero bloqueado' },
              { value: 'overlay', label: 'Overlay tenue' },
            ]}
            value={controller.background}
            onChange={(v: BackgroundMode) => controller.setBackground(v)}
            stacked
          />
        </Section>

        <Section title="Contenido mostrado">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CONTENT_TOGGLES.map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: FG1, cursor: 'pointer' }}>
                <input type="checkbox" checked={controller.toggles[key]} onChange={() => controller.toggle(key)} />
                {label}
              </label>
            ))}
          </div>
        </Section>

        <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: `1px solid ${DIVIDER}` }}>
          <button
            onClick={controller.reset}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 10px', borderRadius: 6, border: `1px solid ${DIVIDER}`, background: '#fff', color: FG1, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <RotateCcw size={12} /> Restablecer
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: 0, background: INDIGO, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cerrar panel
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: FG1, margin: '0 0 6px' }}>{title}</p>
      {children}
    </div>
  );
}

function SegmentedGroup<T extends string | number>({
  options, value, onChange, stacked = false,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  stacked?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: 4,
      border: `1px solid ${DIVIDER}`, borderRadius: 6, overflow: 'hidden', padding: stacked ? 3 : 0,
    }}>
      {options.map(o => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          style={{
            flex: stacked ? undefined : 1,
            textAlign: stacked ? 'left' : 'center',
            padding: '6px 9px', border: 0, borderRadius: stacked ? 4 : 0,
            fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 120ms',
            background: value === o.value ? INDIGO : 'transparent',
            color: value === o.value ? '#fff' : '#666',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
