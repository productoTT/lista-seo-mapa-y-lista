import type { Dispatch, SetStateAction } from 'react';
import { ArrowLeft, Sparkles, Map } from 'lucide-react';
import { TocTocLogo } from '../../../components/ui/TocTocLogo';
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

/**
 * Alternativa 4 — Ruta dedicada: la búsqueda conversacional vive en una
 * página independiente, sin el chrome completo del Home (solo logo + volver).
 */
export function Alt4DedicatedRoute({ device, state, setState }: Props) {
  const actions = createAltActions(state, setState);
  const messages = getConversation(state.scenario);
  const criteria = getCriteria(state.scenario);
  const noResults = state.scenario === 'sin-resultados';
  const showResults = state.scenario === 'resultados';

  if (state.scenario === 'inicio') {
    return (
      <HomeChrome
        device={device}
        heroContent={
          <div className="flex flex-col items-center gap-3">
            <p className="m-0 text-center text-sm text-white/85">
              Describe lo que buscas y te acompañamos con preguntas hasta encontrarlo.
            </p>
            <button
              type="button"
              onClick={actions.start}
              className="flex items-center gap-2 rounded-lg bg-tt-mint px-6 py-3 text-sm font-bold text-tt-indigo hover:opacity-90"
            >
              <Sparkles size={16} aria-hidden="true" /> Buscar conversando
            </button>
          </div>
        }
      />
    );
  }

  const dedicatedHeader = (
    <div className="flex items-center gap-3 border-b border-tt-divider bg-white px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={actions.goHome}
        aria-label="Volver"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-tt-ink hover:bg-gray-100"
      >
        <ArrowLeft size={18} aria-hidden="true" />
      </button>
      <TocTocLogo />
      <span className="mx-1 h-5 w-px bg-tt-divider" aria-hidden="true" />
      <h1 className="m-0 truncate text-sm font-extrabold text-tt-ink sm:text-base">Tu búsqueda con IA</h1>
    </div>
  );

  const conversationCol = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-tt-divider px-4 py-2">
        <ConversationToolbar onNewConversation={actions.newConversation} />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m, i) => <ChatBubble key={i} msg={m} onChip={actions.chip} />)}

        {device === 'mobile' && (
          <div className="mt-1">
            {noResults ? (
              <p className="m-0 rounded-lg bg-tt-indigo-50/40 p-3 text-xs text-tt-ink-2">
                Prueba una de las opciones de arriba para seguir buscando.
              </p>
            ) : showResults ? (
              <div className="flex flex-col gap-2 rounded-xl bg-tt-indigo-50/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="m-0 text-xs font-bold text-tt-ink-2">{RESULT_COUNT} propiedades</p>
                  <CriteriaChips criteria={criteria} dense />
                </div>
                {PROPERTIES.map(p => <PropertyRow key={p.id} {...p} />)}
                <div className="flex gap-2">
                  <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-tt-divider py-2 text-xs font-bold text-tt-indigo">
                    <Map size={13} aria-hidden="true" /> Mapa
                  </button>
                  <button type="button" className="flex-1 rounded-md bg-tt-indigo py-2 text-xs font-bold text-white">
                    Ver lista
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="border-t border-tt-divider p-3">
        <Composer
          value={state.draft}
          onChange={actions.setDraft}
          onSubmit={actions.submit}
          placeholder="Sigue afinando tu búsqueda…"
          label="Escribe tu búsqueda"
        />
      </div>
    </div>
  );

  const resultsCol = (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto border-l border-tt-divider bg-[#FAFAFA] p-4">
      <div className="flex items-center justify-between">
        <p className="m-0 text-sm font-extrabold text-tt-ink">{noResults ? '0 propiedades' : `${RESULT_COUNT} propiedades`}</p>
      </div>
      <CriteriaChips criteria={criteria} />
      {noResults ? (
        <div className="rounded-lg border border-dashed border-tt-divider bg-white p-4 text-center text-xs text-tt-ink-2">
          Sin resultados todavía. Usa las opciones sugeridas en la conversación.
        </div>
      ) : showResults ? (
        <>
          <div className="flex flex-col gap-2">{PROPERTIES.map(p => <PropertyRow key={p.id} {...p} />)}</div>
          <div className="flex gap-2">
            <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-tt-divider bg-white py-2 text-xs font-bold text-tt-indigo">
              <Map size={13} aria-hidden="true" /> Ver mapa
            </button>
            <button type="button" className="flex-1 rounded-md bg-tt-indigo py-2 text-xs font-bold text-white">
              Ver lista completa
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-center text-xs text-tt-ink-2">
          Aún no hay criterios suficientes para mostrar propiedades.
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-full flex-col bg-white">
      {dedicatedHeader}
      {device === 'mobile' ? (
        <div className="flex min-h-0 flex-1 flex-col">{conversationCol}</div>
      ) : (
        <div className="mx-auto grid min-h-0 w-full max-w-[1200px] flex-1 grid-cols-1 lg:grid-cols-[1fr_1fr]">
          {conversationCol}
          {resultsCol}
        </div>
      )}
    </div>
  );
}
