import { Phone, Heart, HeartOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ContactForm } from './ContactForm';
import type { PropertyPreviewController } from './usePropertyPreview';

const INDIGO = '#3200C1';
const INDIGO_DARK = '#24018A';
const INDIGO_50 = '#EAF2FC';
const FG1 = '#343A40';
const FG3 = '#666666';
const PINK = '#F05C89';
const DIVIDER = '#E5E5E5';
const SURFACE = '#fff';

interface PreviewActionsProps {
  propertyId: string;
  propertyTitle: string;
  controller: PropertyPreviewController;
  isSaved: boolean;
  onSave: (id: string) => void;
  onViewFull: (id: string) => void;
  compact?: boolean;
}

export function PreviewActions({ propertyId, propertyTitle, controller, isSaved, onSave, onViewFull, compact = false }: PreviewActionsProps) {
  const { stage } = controller;

  if (stage === 'contact') {
    return (
      <ContactForm
        values={controller.contactForm}
        onChange={controller.updateContactForm}
        onSubmit={controller.submitContact}
        onCancel={controller.backToInfo}
        propertyTitle={propertyTitle}
      />
    );
  }

  if (stage === 'contact-sent') {
    return (
      <div style={{ textAlign: 'center', padding: '12px 4px' }}>
        <CheckCircle2 size={32} color={INDIGO} style={{ marginBottom: 8 }} />
        <p style={{ fontSize: 14, fontWeight: 800, color: FG1, margin: '0 0 4px' }}>¡Mensaje enviado!</p>
        <p style={{ fontSize: 12, color: FG3, margin: '0 0 14px' }}>El anunciante te contactará pronto para coordinar los siguientes pasos.</p>
        <button
          onClick={controller.backToInfo}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: SURFACE, color: INDIGO, border: 0, borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 0 0 1px ${INDIGO} inset`, fontFamily: 'inherit' }}
        >
          Volver a la propiedad
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={controller.startContact}
          style={{
            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: INDIGO, color: '#fff', border: 0, borderRadius: 8, padding: '11px 14px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = INDIGO_DARK)}
          onMouseLeave={e => (e.currentTarget.style.background = INDIGO)}
        >
          <Phone size={14} /> Contactar al anunciante
        </button>
        {compact && (
          <button
            onClick={() => onSave(propertyId)}
            aria-label={isSaved ? 'Quitar de guardados' : 'Guardar propiedad'}
            style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 8, background: isSaved ? '#FFF0F0' : '#F9F9F9', border: `1px solid ${isSaved ? '#FCA5A5' : DIVIDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isSaved ? <HeartOff size={15} color={PINK} /> : <Heart size={15} color={INDIGO} />}
          </button>
        )}
      </div>
      <button
        onClick={() => onViewFull(propertyId)}
        style={{
          width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: SURFACE, color: INDIGO, border: 0, borderRadius: 8, padding: '10px 14px',
          fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 0 0 1px ${INDIGO} inset`, fontFamily: 'inherit',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = INDIGO_50)}
        onMouseLeave={e => (e.currentTarget.style.background = SURFACE)}
      >
        Ver ficha completa <ArrowRight size={14} />
      </button>
    </div>
  );
}
