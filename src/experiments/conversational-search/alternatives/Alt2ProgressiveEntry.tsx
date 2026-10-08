import { useState, type Dispatch, type SetStateAction } from 'react';
import { Sparkles, Search, Map, ArrowLeft } from 'lucide-react';
import { ChromeHeader, HomeChrome } from '../shared/backdrops';
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
 * Alternativa 2 — Entrada progresiva (recomendada).
 * Home compacto hasta el primer mensaje; luego se expande a una superficie
 * dedicada: dos columnas en desktop, vista completa en mobile.
 */
export function Alt2ProgressiveEntry({ device, state, setState }: Props) {
  const [tab, setTab] = useState<'clasica' | 'ia'>('ia');
  const actions = createAltActions(state, setState);
  const expanded = state.scenario !== 'inicio';
  const messages = getConversation(state.scenario);
  const criteria = getCriteria(state.scenario);
  const noResults = state.scenario === 'sin-resultados';
  const showResults = state.scenario === 'resultados';

  if (!expanded) {
    return (
      <HomeChrome
        device={device}
        heroContent={
          <div>
            <div className="mb-3 flex gap-0" role="tablist" aria-label="Tipo de búsqueda">
              {([
                { key: 'clasica' as const, label: 'Búsqueda tradicional' },
                { key: 'ia' as const, label: 'Conversar con IA' },
              ]).map(t => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    'border-b-2 px-4 py-2 text-sm font-bold transition-colors',
                    tab === t.key ? 'border-white text-white' : 'border-transparent text-white/60',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'clasica' ? (
              <div className="flex h-[52px] items-center rounded-[10px] bg-white px-4 shadow-[0_4px_24px_rgba(20,0,80,0.22)]">
                <Search size={15} className="mr-2 text-tt-ink-2" aria-hidden="true" />
                <span className="text-sm text-gray-400">Ingresa comuna o ciudad</span>
              </div>
            ) : (
              <div className="rounded-[10px] bg-white p-3 shadow-[0_4px_24px_rgba(20,0,80,0.22)]">
                <label htmlFor="alt2-intro" className="sr-only">Describe lo que buscas</label>
                <div className="flex items-center gap-2 rounded-lg border border-tt-divider px-3 py-2.5">
                  <Sparkles size={15} className="flex-shrink-0 text-tt-indigo" aria-hidden="true" />
                  <input
                    id="alt2-intro"
                    type="text"
                    value={state.draft}
                    onChange={e => actions.setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && state.draft.trim()) actions.start(); }}
                    placeholder="Ej: Departamento tranquilo, cerca del metro y pet friendly"
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-tt-ink outline-none placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={actions.start}
                  className="mt-3 w-full rounded-lg bg-tt-mint py-2.5 text-sm font-bold text-tt-indigo hover:opacity-90"
                >
                  Comenzar
                </button>
              </div>
            )}
          </div>
        }
      />
    );
  }

  const resultsPanel = (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      <div>
        <p className="m-0 text-sm font-extrabold text-tt-ink">
          {noResults ? '0 propiedades' : `${RESULT_COUNT} propiedades`}
        </p>
        <div className="mt-2"><CriteriaChips criteria={criteria} /></div>
      </div>

      {noResults ? (
        <div className="rounded-lg border border-dashed border-tt-divider bg-white p-4 text-center">
          <p className="m-0 text-xs text-tt-ink-2">Ajusta los criterios conversando a la izquierda para ver propiedades.</p>
        </div>
      ) : showResults ? (
        <>
          <div className="flex flex-col gap-2">
            {PROPERTIES.map(p => <PropertyRow key={p.id} {...p} />)}
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-tt-divider bg-white py-2 text-xs font-bold text-tt-indigo"
          >
            <Map size={14} aria-hidden="true" /> Ver mapa
          </button>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-center text-xs text-tt-ink-2">
          Responde la pregunta del asistente para ver propiedades relevantes.
        </div>
      )}
    </div>
  );

  const conversationPanel = (
    <div className="flex h-full flex-col">
      <div className="border-b border-tt-divider p-3">
        <ConversationToolbar onNewConversation={actions.newConversation} onBack={actions.goHome} backLabel="Home" />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m, i) => <ChatBubble key={i} msg={m} onChip={actions.chip} />)}
        {device === 'mobile' && showResults && (
          <div className="mt-1 flex flex-col gap-2 rounded-xl bg-tt-indigo-50/40 p-3">
            <p className="m-0 text-xs font-bold text-tt-ink-2">Propiedades sugeridas</p>
            {PROPERTIES.slice(0, 2).map(p => <PropertyRow key={p.id} {...p} />)}
            <button type="button" className="text-xs font-bold text-tt-indigo hover:underline">
              Ver lista completa (12)
            </button>
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

  if (device === 'mobile') {
    return (
      <div className="flex h-full min-h-[560px] flex-col bg-[#F5F5F5]">
        <div className="flex items-center gap-2 border-b border-tt-divider bg-white px-3 py-2.5">
          <button type="button" onClick={actions.goHome} aria-label="Volver al Home" className="flex h-9 w-9 items-center justify-center rounded-lg text-tt-ink">
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <p className="m-0 text-sm font-bold text-tt-ink">Conversar con IA</p>
        </div>
        {conversationPanel}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-[#F5F5F5]">
      <ChromeHeader device="desktop" onGoHome={actions.goHome} />
      <div className="mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_1.05fr]">
        <div className="min-h-[520px] overflow-hidden rounded-[10px] border border-tt-divider bg-white">{conversationPanel}</div>
        <div className="min-h-[520px] overflow-hidden rounded-[10px] border border-tt-divider bg-[#FAFAFA]">{resultsPanel}</div>
      </div>
    </div>
  );
}
