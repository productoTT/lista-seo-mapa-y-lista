import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, SquarePen, Sparkles, X } from 'lucide-react';
import type { Property } from '../../types/property';
import type { SearchCriteria } from '../../search/criteria';
import { activeCriteria, criterionLabel, diffCriteria, searchSentence } from '../../search/criteria';
import { bedroomsText } from '../../data/propertyFacts';
import { formatPriceUF, formatRent } from '../../data/mockProperties';
import type { AssistantView } from '../../assistant/handoff';
import type { AssistantAction } from '../../assistant/engine';
import { describeCriteria, sentence, suggestions } from '../../assistant/engine';
import type { AssistantStore, ChatMessage } from '../../assistant/useAssistant';
import './assistant.css';

const VIEW_LABEL: Record<AssistantView, string> = { inicio: 'el inicio', resultados: 'tus resultados', ficha: 'la ficha' };

interface Props {
  assistant: AssistantStore;
  view: AssistantView;
  applied: SearchCriteria;
  draft: SearchCriteria | null;
  data: Property[];
  onApply: (criteria: SearchCriteria) => void;
  onRemoveFilter: (key: string) => void;
  onClearApplied: () => void;
  onViewProperty: (id: string) => void;
}

/**
 * Panel del asistente (spec §14). Superpuesto y sin velo: la página sigue usable detrás.
 * Las respuestas son SIMULADAS por reglas (src/assistant/engine.ts). Nada cambia la búsqueda aplicada
 * hasta que la persona elige "Ver N resultados" o "Limpiar también mis filtros".
 */
export function AssistantPanel({ assistant: a, view, applied, draft, data, onApply, onRemoveFilter, onClearApplied, onViewProperty }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  // Mantiene visible lo último del hilo.
  useEffect(() => {
    const t = threadRef.current;
    if (t) t.scrollTop = t.scrollHeight;
  }, [a.messages.length, a.typing]);

  const filters = activeCriteria(applied, { exclude: ['operation'] });
  const byId = (id: string) => data.find(p => p.id === id);

  function onPanelKey(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Escape') { e.stopPropagation(); a.minimize(); }
  }

  function onComposerKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); a.send(a.composer); }
  }

  const act = (x: AssistantAction) => a.runAction(x, onClearApplied);

  return (
    <aside className={`ap${a.wide ? ' ap-wide' : ''}`} role="complementary" aria-labelledby="ap-title" onKeyDown={onPanelKey}>
      <div className="ap-head">
        <button type="button" className="ap-ibtn" onClick={() => setConfirmNew(true)} aria-label="Nueva conversación" title="Nueva conversación">
          <SquarePen size={18} aria-hidden="true" />
        </button>
        <h2 id="ap-title"><Sparkles size={16} aria-hidden="true" className="ap-title-icon" />Asistente de búsqueda</h2>
        <button type="button" className="ap-ibtn ap-hide-mobile" onClick={a.toggleWide} aria-pressed={a.wide}
          aria-label={a.wide ? 'Reducir panel' : 'Ampliar panel'} title={a.wide ? 'Reducir' : 'Ampliar'}>
          {a.wide ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
        </button>
        <button type="button" className="ap-ibtn" onClick={a.minimize} aria-label="Minimizar asistente. La conversación se conserva." title="Minimizar">
          <Minus size={18} aria-hidden="true" />
        </button>
      </div>

      {confirmNew && (
        <div className="ap-confirm" role="alertdialog" aria-labelledby="ap-confirm-t" aria-describedby="ap-confirm-d">
          <p id="ap-confirm-t"><strong>¿Empezar una conversación nueva?</strong></p>
          <p id="ap-confirm-d">Como invitado, la conversación actual no se guarda. Tus filtros aplicados no cambian.</p>
          <div className="ap-row">
            <button type="button" className="ap-btn ap-btn-primary" autoFocus onClick={() => { a.newConversation(); setConfirmNew(false); inputRef.current?.focus(); }}>
              Empezar una nueva
            </button>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setConfirmNew(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <details className="ap-context" open={a.filtersOpen} onToggle={e => a.setFiltersOpen((e.target as HTMLDetailsElement).open)}>
        <summary>
          <span>Estás en {VIEW_LABEL[view]}</span>
          <span className="ap-context-count">Tus filtros ({filters.length})</span>
        </summary>
        <p className="ap-context-sentence">{sentence(searchSentence(applied))}</p>
        {filters.length > 0 ? (
          <ul className="ap-chips">
            {filters.map(f => (
              <li key={f.key} className="ap-chip">
                {f.label}
                <button type="button" aria-label={`Quitar ${f.label} de tus filtros`} onClick={() => onRemoveFilter(f.key)}>
                  <X size={12} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="ap-muted">Sin filtros además de la operación.</p>}
        <small className="ap-muted">Son los filtros de tu búsqueda actual. El asistente trabaja sobre una copia en borrador.</small>
      </details>

      <div className="ap-thread" ref={threadRef} role="log" aria-label="Conversación con el asistente" aria-live="polite">
        <div className="ap-msg ap-ai">
          <span className="ap-who">Asistente</span>
          <p>{view === 'resultados'
            ? 'Cuéntame qué quieres afinar y te muestro opciones. Cuando quieras verlas todas, las abro en la lista.'
            : 'Hola. Cuéntame con tus palabras qué estás buscando: comuna, dormitorios, cercanía al metro, patio, mascotas… Te muestro algunas opciones y, si quieres, abrimos todos los resultados.'}</p>
        </div>
        {a.messages.map(m => (
          <Message key={m.id} m={m} applied={applied} view={view} byId={byId}
            onApply={onApply} onAction={act} onRetry={a.retry} onViewProperty={onViewProperty} />
        ))}
        {a.typing && <p className="ap-typing" role="status">Escribiendo…</p>}
      </div>

      <div className="ap-sugg" role="group" aria-label="Sugerencias">
        {suggestions(a.hasConversation, draft).map(s => (
          <button key={s.label} type="button" onClick={() => a.send(s.text)}>{s.label}</button>
        ))}
      </div>

      <form className="ap-composer" onSubmit={e => { e.preventDefault(); a.send(a.composer); }}>
        <label htmlFor="ap-input" className="ap-sr">Escribe al asistente</label>
        <textarea id="ap-input" ref={inputRef} rows={1} value={a.composer} placeholder="Describe lo que estás buscando"
          onChange={e => a.setComposer(e.target.value)} onKeyDown={onComposerKey} aria-describedby="ap-composer-note" />
        <button type="submit" className="ap-btn ap-btn-primary" disabled={!a.composer.trim() || a.typing}>Enviar</button>
        <small id="ap-composer-note">Respuestas simuladas. No escribas tu RUT ni datos financieros en el chat.</small>
      </form>
    </aside>
  );
}

// ── Mensajes ──────────────────────────────────────────────

interface MessageProps {
  m: ChatMessage;
  applied: SearchCriteria;
  view: AssistantView;
  byId: (id: string) => Property | undefined;
  onApply: (c: SearchCriteria) => void;
  onAction: (a: AssistantAction) => void;
  onRetry: (id: string, r: { text: string; masked: boolean }) => void;
  onViewProperty: (id: string) => void;
}

function Message({ m, applied, view, byId, onApply, onAction, onRetry, onViewProperty }: MessageProps) {
  if (m.role === 'note') return <p className="ap-note">{m.text}</p>;
  if (m.role === 'user') {
    return (
      <div className="ap-msg ap-user">
        <span className="ap-sr">Tú: </span>{m.text}
        {m.masked && <span className="ap-masked">Datos personales ocultos y no guardados</span>}
      </div>
    );
  }
  const actions = 'actions' in m && m.actions?.length ? (
    <div className="ap-row ap-actions">
      {m.actions.map(x => <button key={x.label} type="button" className="ap-btn ap-btn-outline" onClick={() => onAction(x)}>{x.label}</button>)}
    </div>
  ) : null;

  if (m.kind === 'error') {
    return (
      <div className="ap-msg ap-ai" role="alert">
        <span className="ap-who">Asistente</span>
        <p>{m.text}</p>
        <button type="button" className="ap-btn ap-btn-outline" onClick={() => onRetry(m.id, m.retry)}>Reintentar</button>
      </div>
    );
  }
  if (m.kind !== 'search') {
    return (
      <div className="ap-msg ap-ai">
        <span className="ap-who">Asistente</span>
        <p>{m.text}</p>
        {actions}
      </div>
    );
  }

  const same = diffCriteria(applied, m.criteria).length === 0;
  const changes = diffCriteria(applied, m.criteria);
  const label = m.total === 1 ? 'Ver 1 resultado' : `Ver ${m.total} resultados`;
  return (
    <div className="ap-msg ap-ai">
      <span className="ap-who">Asistente</span>
      <p>{m.text}</p>
      <Carousel ids={m.resultIds} total={m.total} byId={byId} onViewProperty={onViewProperty} />
      <p>{m.follow}</p>
      {same && view === 'resultados'
        ? <p className="ap-status">Estos son los resultados que estás viendo en la lista.</p>
        : <button type="button" className="ap-btn ap-btn-primary" onClick={() => onApply(m.criteria)}>{label}</button>}
      <details className="ap-criteria">
        <summary>Criterios de esta búsqueda</summary>
        <p>{sentence(describeCriteria(m.criteria))}</p>
        {!same && (
          <>
            <p>Al abrirla en la lista, tus filtros quedarán así:</p>
            <ul>
              {changes.map(c => (
                <li key={c.key}>
                  <span className={`ap-kind ap-kind-${c.kind}`}>{c.kind === 'add' ? 'Agrega' : c.kind === 'remove' ? 'Quita' : 'Cambia'}</span>{' '}
                  {c.kind === 'remove' ? criterionLabel(applied, c.key) : c.kind === 'replace'
                    ? `${criterionLabel(applied, c.key)} → ${criterionLabel(m.criteria, c.key)}`
                    : criterionLabel(m.criteria, c.key)}
                </li>
              ))}
            </ul>
          </>
        )}
      </details>
    </div>
  );
}

function Carousel({ ids, total, byId, onViewProperty }: { ids: string[]; total: number; byId: (id: string) => Property | undefined; onViewProperty: (id: string) => void }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="ap-car" role="region" aria-roledescription="carrusel" aria-label={`${ids.length} propiedades sugeridas`}>
      <button type="button" className="ap-car-nav ap-car-prev" onClick={() => scroll(-1)} aria-label="Anteriores"><ChevronLeft size={16} aria-hidden="true" /></button>
      <ul className="ap-car-track" ref={track}>
        {ids.map((id, i) => {
          const p = byId(id);
          if (!p) return null;
          const beds = bedroomsText(p, true);
          return (
            <li key={id} className="ap-card" aria-label={`${i + 1} de ${ids.length}`}>
              <img src={p.imageUrl} alt="" />
              <div className="ap-card-body">
                <span className="ap-card-type">{p.isNewProject ? 'Proyecto nuevo · ' : ''}{p.operation === 'venta' ? 'Venta' : 'Arriendo'}</span>
                <strong>{p.title}</strong>
                <span className="ap-card-loc">{p.zone}</span>
                <span className="ap-card-price">{p.operation === 'arriendo' ? formatRent(p.price) : formatPriceUF(p.priceUF)}</span>
                <span className="ap-card-specs">
                  {[beds, `${p.bathrooms} ${p.bathrooms > 1 ? 'baños' : 'baño'}`, `${p.sqm} m²`, p.metroWalkMin !== undefined ? `metro ${p.metroWalkMin} min` : null].filter(Boolean).join(' · ')}
                </span>
                <button type="button" className="ap-btn ap-btn-outline ap-btn-sm" onClick={() => onViewProperty(id)}>Ver propiedad</button>
              </div>
            </li>
          );
        })}
      </ul>
      <button type="button" className="ap-car-nav ap-car-next" onClick={() => scroll(1)} aria-label="Siguientes"><ChevronRight size={16} aria-hidden="true" /></button>
      {total > ids.length && <p className="ap-car-count">Vista previa: {ids.length} de {total} resultados.</p>}
    </div>
  );
}
