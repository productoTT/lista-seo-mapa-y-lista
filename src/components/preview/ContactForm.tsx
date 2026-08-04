import { ArrowLeft, Send } from 'lucide-react';
import type { ContactFormValues } from './previewTypes';

const INDIGO = '#3200C1';
const INDIGO_DARK = '#24018A';
const FG1 = '#343A40';
const FG3 = '#666666';
const DIVIDER = '#E5E5E5';

interface ContactFormProps {
  values: ContactFormValues;
  onChange: (partial: Partial<ContactFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  propertyTitle: string;
}

const fieldStyle = {
  width: '100%', border: `1px solid ${DIVIDER}`, borderRadius: 8,
  padding: '10px 12px', fontSize: 14, color: FG1, fontFamily: 'inherit', outline: 'none',
};

export function ContactForm({ values, onChange, onSubmit, onCancel, propertyTitle }: ContactFormProps) {
  const canSubmit = values.name.trim() !== '' && values.email.trim() !== '' && values.phone.trim() !== '';

  return (
    <div>
      <button
        onClick={onCancel}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, background: 'none', color: INDIGO, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 12, fontFamily: 'inherit' }}
      >
        <ArrowLeft size={14} /> Volver a la propiedad
      </button>

      <p style={{ fontSize: 14, fontWeight: 800, color: FG1, margin: '0 0 2px' }}>Contactar al anunciante</p>
      <p style={{ fontSize: 12, color: FG3, margin: '0 0 14px' }}>Sobre: {propertyTitle}</p>

      <form
        onSubmit={e => { e.preventDefault(); if (canSubmit) onSubmit(); }}
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: FG1 }}>Nombre</span>
          <input
            required
            value={values.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Tu nombre completo"
            style={fieldStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: FG1 }}>Email</span>
          <input
            required
            type="email"
            value={values.email}
            onChange={e => onChange({ email: e.target.value })}
            placeholder="tucorreo@ejemplo.com"
            style={fieldStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: FG1 }}>Teléfono</span>
          <input
            required
            type="tel"
            value={values.phone}
            onChange={e => onChange({ phone: e.target.value })}
            placeholder="+56 9 1234 5678"
            style={fieldStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: FG1 }}>Mensaje</span>
          <textarea
            value={values.message}
            onChange={e => onChange({ message: e.target.value })}
            placeholder="Me interesa esta propiedad, ¿podríamos coordinar una visita?"
            rows={3}
            style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            marginTop: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: canSubmit ? INDIGO : '#C9C4E8', color: '#fff', border: 0, borderRadius: 8,
            padding: '11px 16px', fontSize: 14, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', transition: 'background-color 150ms',
          }}
          onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = INDIGO_DARK; }}
          onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = INDIGO; }}
        >
          <Send size={14} /> Enviar mensaje
        </button>
      </form>
    </div>
  );
}
