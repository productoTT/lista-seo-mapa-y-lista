import type { Dispatch, SetStateAction } from 'react';
import { Sparkles, Search, ArrowLeft, X } from 'lucide-react';
import { HomeChrome } from '../shared/backdrops';
import { ChatBubble, Composer, CriteriaChips, PropertyRow, ConversationToolbar } from '../shared/ui';
import { createAltActions } from '../shared/actions';
import { getConversation, getCriteria, PROPERTIES, RESULT_COUNT } from '../content';
import type { AltState, Device } from '../types';

interface Props {
  device: Device;
  state: AltState;
  setState: Dispatch<SetStateAction<AltState>>;
}

/** Encabezado del panel: en mobile es "volver" (única salida, sin duplicar con otra barra); en desktop es "cerrar" un widget flotante. */
function PanelHeader({ device, onClose }: { device: Device; onClose: () => void }) {
  if (device === 'mobile') {
    return (
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-tt-divider px-3 py-2.5">
        <button type="button" onClick={onClose} aria-label="Volver al Home" className="flex h-9 w-9 items-center justify-center rounded-lg text-tt-ink">
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <Sparkles size={15} className="text-tt-indigo" aria-hidden="true" />
        <p className="m-0 text-sm font-bold text-tt-ink">Asistente de búsqueda</p>
      </div>
    );
  }
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-tt-divider px-4 py-3">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-tt-indigo" aria-hidden="true" />
        <p className="m-0 text-sm font-bold text-tt-ink">Asistente de búsqueda</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Cerrar asistente de búsqueda" className="flex h-8 w-8 items-center justify-center rounded-lg text-tt-ink-2 hover:bg-gray-100">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Alternativa 5 — Botón flotante: Home tradicional sin cambios; el asistente
 * es un canal secundario que no compite con el buscador principal.
 */
export function Alt5FloatingButton({ device, state, setState }: Props) {
  const actions = createAltActions(state, setState);
  const messages = getConversation(state.scenario);
  const criteria = getCriteria(state.scenario);
  const noResults = state.scenario === 'sin-resultados';
  const showResults = state.scenario === 'resultados';

  const panelContent = (
    <>
      <PanelHeader device={device} onClose={actions.closePanel} />
      <div className="border-b border-tt-divider px-4 py-2">
        <ConversationToolbar onNewConversation={actions.newConversation} />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {criteria.length > 0 && <CriteriaChips criteria={criteria} dense />}
        {messages.length === 0 && (
          <p className="m-0 text-xs text-tt-ink-2">Un canal opcional: cuéntame qué buscas si prefieres conversar en vez de usar el buscador.</p>
        )}
        {messages.map((m, i) => <ChatBubble key={i} msg={m} onChip={actions.chip} dense />)}
        {showResults && (
          <div className="flex flex-col gap-2">
            <p className="m-0 text-xs font-bold text-tt-ink-2">{RESULT_COUNT} propiedades</p>
            {PROPERTIES.map(p => <PropertyRow key={p.id} {...p} />)}
          </div>
        )}
        {noResults && (
          <p className="m-0 text-xs text-tt-ink-2">Elige una opción para ajustar la búsqueda.</p>
        )}
      </div>
      <div className="border-t border-tt-divider p-3">
        <Composer
          value={state.draft}
          onChange={actions.setDraft}
          onSubmit={actions.submit}
          placeholder="Ej: Departamento tranquilo, cerca del metro"
          label="Escribe tu búsqueda"
        />
      </div>
    </>
  );

  const home = (
    <HomeChrome
      device={device}
      heroContent={
        <div className="flex h-[52px] items-center rounded-[10px] bg-white px-4 shadow-[0_4px_24px_rgba(20,0,80,0.22)]">
          <Search size={15} className="mr-2 text-tt-ink-2" aria-hidden="true" />
          <span className="text-sm text-gray-400">Ingresa comuna o ciudad</span>
        </div>
      }
    />
  );

  if (device === 'mobile') {
    return (
      <div className="relative min-h-full">
        {home}
        {!state.panelOpen && (
          <button
            type="button"
            onClick={actions.openPanel}
            aria-label="Abrir asistente de búsqueda"
            className="absolute bottom-5 right-4 z-20 flex items-center gap-2 rounded-full bg-tt-indigo px-4 py-3 text-sm font-bold text-white shadow-lg"
          >
            <Sparkles size={16} aria-hidden="true" />
          </button>
        )}
        {state.panelOpen && (
          <div className="absolute inset-0 z-30 flex flex-col bg-white">{panelContent}</div>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-[720px] overflow-hidden">
      {home}
      {!state.panelOpen && (
        <button
          type="button"
          onClick={actions.openPanel}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-full bg-tt-indigo px-5 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90"
        >
          <Sparkles size={16} aria-hidden="true" /> Asistente de búsqueda
        </button>
      )}
      {state.panelOpen && (
        <div
          role="dialog"
          aria-label="Asistente de búsqueda"
          className="absolute bottom-6 right-6 z-20 flex h-[520px] w-[380px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-tt-divider bg-white shadow-2xl"
        >
          {panelContent}
        </div>
      )}
    </div>
  );
}
