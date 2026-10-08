import { useState, type Dispatch, type SetStateAction } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { HomeChrome } from '../shared/backdrops';
import { ChatBubble, Composer, PropertyRow } from '../shared/ui';
import { createAltActions } from '../shared/actions';
import { getConversation, PROPERTIES, RESULT_COUNT } from '../content';
import type { AltState, Device } from '../types';

interface Props {
  device: Device;
  state: AltState;
  setState: Dispatch<SetStateAction<AltState>>;
}

/**
 * Alternativa 1 — Solución actual: chat de gran tamaño embebido en el Home.
 * Se muestra tal como se probó internamente: mensajes arriba, campo abajo,
 * y el espacio vacío se conserva a propósito (no se corrige) para que sirva
 * de referencia de lo que NO se recomienda escalar.
 */
export function Alt1CurrentState({ device, state, setState }: Props) {
  const [tab, setTab] = useState<'clasica' | 'ia'>('ia');
  const actions = createAltActions(state, setState);
  const messages = getConversation(state.scenario);

  const tabs = (
    <div className="mb-3 flex gap-0" role="tablist" aria-label="Tipo de búsqueda">
      {([
        { key: 'clasica' as const, label: 'Búsqueda clásica' },
        { key: 'ia' as const, label: 'Búsqueda con IA' },
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
  );

  const classicBar = (
    <div className="flex h-[52px] items-center rounded-[10px] bg-white px-4 shadow-[0_4px_24px_rgba(20,0,80,0.22)]">
      <Search size={15} className="mr-2 text-tt-ink-2" aria-hidden="true" />
      <span className="text-sm text-gray-400">Ingresa comuna o ciudad</span>
    </div>
  );

  const chatHeightClass = device === 'mobile' ? 'h-[420px]' : 'h-[560px]';

  const bigChat = (
    <div
      className={`flex ${chatHeightClass} flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_24px_rgba(20,0,80,0.22)]`}
      aria-label="Chat de búsqueda con IA"
    >
      <div className="flex items-center gap-2 border-b border-tt-divider px-4 py-3">
        <Sparkles size={16} className="text-tt-indigo" aria-hidden="true" />
        <p className="m-0 text-sm font-bold text-tt-ink">Asistente de búsqueda</p>
      </div>

      {/* Cuerpo: espacio vacío intencional cuando hay pocos mensajes */}
      <div className="flex flex-1 flex-col justify-end gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-400">
            <Sparkles size={28} className="mb-3 opacity-40" aria-hidden="true" />
            <p className="m-0 text-sm">Cuéntame qué buscas y te ayudo a encontrarlo.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} msg={m} onChip={actions.chip} />
        ))}

        {/* Resultados mostrados como burbuja adicional dentro del mismo chat: sin superficie estructurada propia. */}
        {state.scenario === 'resultados' && (
          <div className="flex flex-col gap-2 rounded-2xl border border-tt-divider bg-tt-indigo-50/40 p-3">
            <p className="m-0 text-xs font-bold text-tt-ink-2">{RESULT_COUNT} propiedades encontradas</p>
            {PROPERTIES.map(p => <PropertyRow key={p.id} {...p} />)}
          </div>
        )}
      </div>

      <div className="border-t border-tt-divider p-3">
        <Composer
          value={state.draft}
          onChange={actions.setDraft}
          onSubmit={actions.submit}
          placeholder="Ej: Departamento en Ñuñoa, 2 dormitorios, hasta 5.000 UF"
          label="Escribe tu búsqueda"
        />
      </div>
    </div>
  );

  return (
    <HomeChrome
      device={device}
      heroContent={
        <div>
          {tabs}
          {tab === 'clasica' ? classicBar : bigChat}
        </div>
      }
    />
  );
}
