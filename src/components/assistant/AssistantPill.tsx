import { forwardRef } from 'react';
import { Sparkles } from 'lucide-react';
import './assistant.css';

interface Props {
  active: boolean;
  /** Distancia al borde inferior; sube en resultados para no tapar el botón de ajustes existente. */
  bottom: number;
  onOpen: () => void;
}

/** Ícono flotante del asistente minimizado. Con conversación activa muestra un punto y "Conversación activa · Abrir". */
export const AssistantPill = forwardRef<HTMLButtonElement, Props>(function AssistantPill({ active, bottom, onOpen }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={`ap-pill${active ? ' ap-pill-active' : ''}`}
      style={{ bottom }}
      onClick={onOpen}
      aria-label={active ? 'Conversación activa con el asistente. Abrir' : 'Abrir asistente de búsqueda'}
    >
      <Sparkles size={22} aria-hidden="true" />
      {active && <span className="ap-pill-dot" aria-hidden="true" />}
      <span className="ap-pill-tip" aria-hidden="true">
        {active ? <>Conversación activa <span>· Abrir</span></> : 'Asistente de búsqueda'}
      </span>
    </button>
  );
});
