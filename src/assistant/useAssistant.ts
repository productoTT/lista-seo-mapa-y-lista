import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { Property } from '../types/property';
import type { SearchCriteria } from '../search/criteria';
import { DEFAULT_CRITERIA } from '../search/criteria';
import type { AssistantView } from './handoff';
import type { AssistantAction, AssistantReply } from './engine';
import { maskPersonalData, proposeSearch, respond } from './engine';

export type ChatMessage =
  | { id: string; role: 'user'; text: string; masked: boolean }
  | ({ id: string; role: 'assistant' } & AssistantReply)
  | { id: string; role: 'assistant'; kind: 'error'; text: string; retry: { text: string; masked: boolean } }
  | { id: string; role: 'note'; text: string };

/** Respuesta simulada: demora fija para mostrar el estado de carga. */
const RESPONSE_DELAY_MS = 700;

/**
 * Simulación de error controlada por URL (sin controles visibles):
 * `?simular=error-asistente` hace fallar la primera respuesta de la sesión.
 */
const simulateErrorOnce = () => new URLSearchParams(window.location.search).get('simular') === 'error-asistente';

interface Deps {
  data: Property[];
  view: AssistantView;
  applied: SearchCriteria;
  draft: SearchCriteria | null;
  setDraft: (c: SearchCriteria) => void;
  discardDraft: () => void;
}

/** Estado de la conversación. Vive en la app (no en el panel) para conservarse al minimizar y navegar. */
export function useAssistant(deps: Deps) {
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [composer, setComposer] = useState('');
  /** "Tus filtros (N)" abierto o cerrado: se mantiene al minimizar y navegar. */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const seq = useRef(0);
  const errorPending = useRef(simulateErrorOnce());
  // Referencias a lo último renderizado, para las respuestas que llegan después de la demora simulada.
  const depsRef = useRef(deps);
  const messagesRef = useRef(messages);
  useLayoutEffect(() => { depsRef.current = deps; messagesRef.current = messages; });

  const nextId = () => `m${++seq.current}`;
  const hasConversation = messages.some(m => m.role === 'user');

  /** Borrador vigente o, si no existe, el de partida según la vista (spec §14). */
  const baseDraft = useCallback((): SearchCriteria => {
    const d = depsRef.current;
    if (d.draft) return d.draft;
    if (d.view === 'inicio') return { ...DEFAULT_CRITERIA, operation: d.applied.operation, propertyType: d.applied.propertyType };
    return d.applied;
  }, []);

  const pushReply = useCallback((run: () => { reply: AssistantReply; draft?: SearchCriteria }, retry: { text: string; masked: boolean }) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      if (errorPending.current) {
        errorPending.current = false;
        setMessages(ms => [...ms, { id: nextId(), role: 'assistant', kind: 'error', text: 'No pude procesar tu mensaje. No cambié nada de tu búsqueda.', retry }]);
        return;
      }
      const { reply, draft } = run();
      if (draft) depsRef.current.setDraft(draft);
      setMessages(ms => [...ms, { id: nextId(), role: 'assistant', ...reply }]);
    }, RESPONSE_DELAY_MS);
  }, []);

  /** Envía un mensaje. Los datos personales se ocultan antes de guardarlo: el original no se conserva. */
  const send = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const { text, masked } = maskPersonalData(trimmed);
    setComposer('');
    setMessages(ms => [...ms, { id: nextId(), role: 'user', text, masked }]);
    const turnBase = messagesRef.current.filter(m => m.role === 'assistant' && 'kind' in m && m.kind === 'search').length;
    pushReply(() => {
      const d = depsRef.current;
      return respond(text, masked, { draft: baseDraft(), applied: d.applied, view: d.view, data: d.data, turn: turnBase });
    }, { text, masked });
  }, [baseDraft, pushReply]);

  /** Acciones de las respuestas. Ninguna cambia la búsqueda aplicada salvo "clear-applied", que es explícita. */
  const runAction = useCallback((a: AssistantAction, onClearApplied: () => void) => {
    if (a.kind === 'send') { send(a.text); return; }
    if (a.kind === 'clear-applied') { onClearApplied(); return; }
    setMessages(ms => [...ms, { id: nextId(), role: 'user', text: a.label.replace(/\s*\(\d+\)$/, ''), masked: false }]);
    pushReply(() => proposeSearch(a.criteria, depsRef.current.data), { text: a.label, masked: false });
  }, [send, pushReply]);

  const retry = useCallback((msgId: string, r: { text: string; masked: boolean }) => {
    setMessages(ms => ms.filter(m => m.id !== msgId));
    pushReply(() => {
      const d = depsRef.current;
      return respond(r.text, r.masked, { draft: baseDraft(), applied: d.applied, view: d.view, data: d.data, turn: 0 });
    }, r);
  }, [baseDraft, pushReply]);

  /** Notas del hilo (cambio de vista, filtros editados a mano). Solo con una conversación en curso. */
  const addNote = useCallback((text: string) => {
    setMessages(ms => {
      if (!ms.some(m => m.role === 'user')) return ms;
      const last = ms[ms.length - 1];
      if (last?.role === 'note' && last.text === text) return ms;
      return [...ms, { id: nextId(), role: 'note', text }];
    });
  }, []);

  /** Inicia otro hilo. Distinto de minimizar (conserva) y de eliminar (historial, bloque posterior). */
  const newConversation = useCallback(() => {
    setMessages([]);
    setComposer('');
    depsRef.current.discardDraft();
  }, []);

  return {
    open, wide, messages, typing, composer, hasConversation, filtersOpen,
    setComposer, setFiltersOpen,
    openPanel: (o: { prefill?: string; firstMessage?: string } = {}) => {
      setOpen(true);
      if (o.prefill !== undefined) setComposer(o.prefill);
      if (o.firstMessage) send(o.firstMessage);
    },
    minimize: () => setOpen(false),
    toggleWide: () => setWide(w => !w),
    send, runAction, retry, addNote, newConversation,
  };
}

export type AssistantStore = ReturnType<typeof useAssistant>;
