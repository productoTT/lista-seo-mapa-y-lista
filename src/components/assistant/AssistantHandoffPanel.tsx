import { useEffect, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { AssistantHandoff } from '../../assistant/handoff';
import { searchSentence } from '../../search/criteria';
import './assistant-handoff.css';

const ENTRY_LABEL: Record<AssistantHandoff['entry'], string> = {
  combobox: 'Sección “Describe lo que buscas con IA” del buscador',
  'enlace-home': 'Enlace “Cuéntaselo al asistente”',
  'buscar-texto-libre': 'Buscar con una descripción que no es una comuna',
};

const VIEW_LABEL = { inicio: 'el inicio', resultados: 'tus resultados', ficha: 'una ficha' } as const;

interface Props {
  handoff: AssistantHandoff;
  onClose: () => void;
}

/**
 * Vista previa del traspaso al asistente (bloque 2).
 * El asistente conversacional se construye en el bloque 3: aquí no hay respuestas ni conversación,
 * solo se muestra qué texto y qué contexto recibirá. No cambia la búsqueda aplicada.
 * Panel sin velo, como define la spec para el asistente; en mobile se ancla abajo.
 */
export function AssistantHandoffPanel({ handoff, onClose }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const opener = useRef<Element | null>(document.activeElement);

  useEffect(() => {
    const el = handoff.prefill ? inputRef.current : headingRef.current;
    el?.focus();
    if (handoff.prefill && inputRef.current) {
      const n = inputRef.current.value.length;
      inputRef.current.setSelectionRange(n, n);
    }
  }, [handoff]);

  useEffect(() => {
    const returnTo = opener.current;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (returnTo instanceof HTMLElement && document.contains(returnTo)) returnTo.focus();
    };
  }, [onClose]);

  const { draft } = handoff.context;

  return (
    <aside className="ah" role="complementary" aria-labelledby="ah-title">
      <div className="ah-head">
        <Sparkles size={18} className="ah-icon" aria-hidden="true" />
        <h2 id="ah-title" ref={headingRef} tabIndex={-1}>Asistente de búsqueda</h2>
        <button type="button" className="ah-close" onClick={onClose} aria-label="Cerrar vista previa del asistente">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="ah-body">
        <p className="ah-notice" role="note">
          <strong>Vista previa del traspaso.</strong> El asistente todavía no responde: se construye en el siguiente bloque.
          Aquí se muestra qué recibirá. Tu búsqueda no cambió.
        </p>

        <dl className="ah-facts">
          <dt>Entrada</dt>
          <dd>{ENTRY_LABEL[handoff.entry]}</dd>
          <dt>Contexto</dt>
          <dd>Estás en {VIEW_LABEL[handoff.context.view]} · {searchSentence(draft)}</dd>
          {handoff.firstMessage && (
            <>
              <dt>Primer mensaje que se enviará</dt>
              <dd className="ah-quote">{handoff.firstMessage}</dd>
            </>
          )}
        </dl>

        {handoff.prefill !== undefined && (
          <div className="ah-composer">
            <label htmlFor="ah-input">Texto listo para completar</label>
            <textarea id="ah-input" ref={inputRef} rows={2} defaultValue={handoff.prefill} />
            <button type="button" disabled aria-describedby="ah-send-note">Enviar</button>
            <small id="ah-send-note">El envío se habilita cuando el asistente esté construido.</small>
          </div>
        )}

        <p className="ah-privacy">No escribas tu RUT ni datos financieros en el chat.</p>
      </div>
    </aside>
  );
}
