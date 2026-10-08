import { useState, type Dispatch, type SetStateAction } from 'react';
import { Sparkles, ChevronUp } from 'lucide-react';
import { ResultsBackdrop } from '../shared/backdrops';
import { ChatBubble, Composer, CriteriaChips, CloseIconButton, ConversationToolbar } from '../shared/ui';
import { createAltActions } from '../shared/actions';
import { getConversation, getCriteria, PROPERTIES } from '../content';
import type { AltState, Device } from '../types';

interface Props {
  device: Device;
  state: AltState;
  setState: Dispatch<SetStateAction<AltState>>;
}

function backdropData(scenario: AltState['scenario']) {
  if (scenario === 'inicio') return { count: 48, label: 'Departamentos en Venta', properties: PROPERTIES };
  if (scenario === 'conversacion') return { count: 48, label: 'Departamentos en Ñuñoa', properties: PROPERTIES };
  if (scenario === 'resultados') return { count: 12, label: 'Departamentos en Ñuñoa · Pet friendly · Cerca del metro', properties: PROPERTIES };
  return { count: 0, label: 'Casas en Ñuñoa · 4 dorm · Piscina', properties: [] };
}

/**
 * Alternativa 3 — Panel contextual: la conversación acompaña una lista de
 * resultados existente. En desktop, panel lateral que no la reemplaza.
 * En mobile, hoja inferior expandible sobre el mismo listado.
 */
export function Alt3ContextPanel({ device, state, setState }: Props) {
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const actions = createAltActions(state, setState);
  const messages = getConversation(state.scenario);
  const criteria = getCriteria(state.scenario);
  const { count, label, properties } = backdropData(state.scenario);

  const panelBody = (
    <>
      <div className="flex items-center justify-between border-b border-tt-divider px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-tt-indigo" aria-hidden="true" />
          <p className="m-0 text-sm font-bold text-tt-ink">Asistente de búsqueda</p>
        </div>
        <CloseIconButton onClick={actions.closePanel} label="Cerrar panel de conversación" />
      </div>

      <div className="border-b border-tt-divider px-4 py-2">
        <ConversationToolbar onNewConversation={actions.newConversation} />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {criteria.length > 0 && <CriteriaChips criteria={criteria} dense />}
        {messages.length === 0 && (
          <p className="m-0 text-xs text-tt-ink-2">Cuéntame qué buscas y ajusto la lista sin salir de esta página.</p>
        )}
        {messages.map((m, i) => <ChatBubble key={i} msg={m} onChip={actions.chip} dense />)}
      </div>

      <div className="border-t border-tt-divider p-3">
        <Composer
          value={state.draft}
          onChange={actions.setDraft}
          onSubmit={actions.submit}
          placeholder="Ej: que sea pet friendly y cerca del metro"
          label="Escribe tu búsqueda"
        />
      </div>
    </>
  );

  if (device === 'mobile') {
    return (
      <div className="relative min-h-full">
        <ResultsBackdrop resultCount={count} criteriaLabel={label} properties={properties} device={device} />

        {!state.panelOpen && (
          <button
            type="button"
            onClick={actions.openPanel}
            className="absolute bottom-5 right-4 z-20 flex items-center gap-2 rounded-full bg-tt-indigo px-4 py-3 text-sm font-bold text-white shadow-lg"
          >
            <Sparkles size={15} aria-hidden="true" /> Conversar con IA
          </button>
        )}

        {state.panelOpen && (
          <div className="absolute inset-0 z-30 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={actions.closePanel} aria-hidden="true" />
            <div
              className={[
                'relative z-10 flex flex-col rounded-t-2xl bg-white shadow-2xl transition-[height] duration-200',
                sheetExpanded ? 'h-[92%]' : 'h-[68%]',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => setSheetExpanded(v => !v)}
                aria-label={sheetExpanded ? 'Contraer panel' : 'Expandir panel'}
                className="flex w-full flex-col items-center gap-1 pt-2.5 pb-1"
              >
                <span className="h-1 w-9 rounded-full bg-gray-300" />
                <ChevronUp size={14} className={`text-gray-400 transition-transform ${sheetExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <div className="flex min-h-0 flex-1 flex-col">{panelBody}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-[720px] overflow-hidden">
      <ResultsBackdrop resultCount={count} criteriaLabel={label} properties={properties} device={device} />

      {!state.panelOpen && (
        <button
          type="button"
          onClick={actions.openPanel}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-full bg-tt-indigo px-5 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90"
        >
          <Sparkles size={16} aria-hidden="true" /> Conversar con IA
        </button>
      )}

      {state.panelOpen && (
        <div
          className="absolute right-0 top-0 z-20 flex h-full w-[380px] max-w-[92vw] flex-col border-l border-tt-divider bg-white shadow-2xl"
          role="complementary"
          aria-label="Panel de conversación con IA"
        >
          {panelBody}
        </div>
      )}
    </div>
  );
}
