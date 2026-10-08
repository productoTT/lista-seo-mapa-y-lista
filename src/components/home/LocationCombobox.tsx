import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import type { SearchCriteria } from '../../search/criteria';
import { activeCriteria, canonicalComuna, searchSentence } from '../../search/criteria';

const MAX_SUGGESTIONS = 3;

const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

type Option =
  | { kind: 'recent'; id: string; group: string; label: string; sub: string; criteria: SearchCriteria }
  | { kind: 'comuna'; id: string; group?: string; label: string; comuna: string }
  | { kind: 'ai'; id: string; label: string; sub: string; firstMessage?: string; comuna?: string };

export interface LocationComboboxProps {
  value: string;
  onChange: (text: string) => void;
  /** Búsquedas efectivamente ejecutadas, la más reciente primero. */
  recents: SearchCriteria[];
  comunas: string[];
  popular: string[];
  onPickComuna: (comuna: string) => void;
  onPickRecent: (criteria: SearchCriteria) => void;
  /** `firstMessage`: descripción libre. `comuna`: comuna reconocida, para "En [comuna], …". */
  onPickAssistant: (opts: { firstMessage?: string; comuna?: string }) => void;
}

/**
 * Combobox de ubicación del Home (spec §5): hasta tres sugerencias y, al final, la sección fija del asistente.
 * Elegir una comuna solo la escribe en el campo; elegir una búsqueda reciente la ejecuta;
 * la sección del asistente traspasa el texto sin interpretarlo.
 */
export function LocationCombobox({
  value, onChange, recents, comunas, popular, onPickComuna, onPickRecent, onPickAssistant,
}: LocationComboboxProps) {
  const uid = useId();
  const listId = `${uid}-lista`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const options = useMemo<Option[]>(() => {
    const text = value.trim();
    const opts: Option[] = [];
    if (!text) {
      recents.slice(0, MAX_SUGGESTIONS).forEach((c, i) => {
        const extra = activeCriteria(c, { exclude: ['operation', 'propertyType'] })
          .filter(x => !x.key.startsWith('comuna:')).map(x => x.label);
        opts.push({
          kind: 'recent', id: `${uid}-r${i}`, group: 'Búsquedas recientes', criteria: c,
          label: searchSentence(c), sub: extra.length ? extra.join(', ') : 'Sin filtros adicionales',
        });
      });
      // No repite como sugerida una comuna que ya es, por sí sola, una búsqueda reciente.
      const recentComunas = new Set(recents.slice(0, MAX_SUGGESTIONS).filter(c => c.comunas.length === 1).map(c => c.comunas[0]));
      popular.forEach((comuna, i) => {
        if (opts.length < MAX_SUGGESTIONS && !recentComunas.has(comuna)) {
          opts.push({ kind: 'comuna', id: `${uid}-p${i}`, group: 'Búsquedas sugeridas', label: `${comuna}, Región Metropolitana`, comuna });
        }
      });
    } else {
      const t = norm(text);
      comunas
        .filter(c => norm(c).includes(t))
        .sort((a, b) => Number(norm(b).startsWith(t)) - Number(norm(a).startsWith(t)))
        .slice(0, MAX_SUGGESTIONS)
        .forEach((comuna, i) => opts.push({ kind: 'comuna', id: `${uid}-c${i}`, label: `${comuna}, Región Metropolitana`, comuna }));
    }
    const exact = text ? comunas.find(c => norm(c) === norm(text)) : undefined;
    const free = text && !exact ? text : '';
    opts.push({
      kind: 'ai', id: `${uid}-ia`, label: 'Describe lo que buscas con IA',
      firstMessage: free || undefined,
      comuna: exact,
      sub: free ? `Se abrirá el asistente con “${free}”`
        : exact ? `Se abrirá el asistente con “En ${exact}, …” listo para completar`
        : 'Conversa con el asistente para encontrar lo que buscas. Por ejemplo: cerca del metro y con patio.',
    });
    return opts;
  }, [value, recents, comunas, popular, uid]);

  const current = Math.min(active, options.length - 1);

  function pick(o: Option) {
    setOpen(false);
    if (o.kind === 'recent') onPickRecent(o.criteria);
    else if (o.kind === 'comuna') { onPickComuna(canonicalComuna(o.comuna, comunas)); inputRef.current?.focus(); }
    else onPickAssistant({ firstMessage: o.firstMessage, comuna: o.comuna });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); setActive(0); } else setActive(a => Math.min(a + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      // Con texto o con una opción elegida a propósito, Enter toma la opción activa.
      // Sin texto y sin moverse, Enter envía el formulario (Buscar).
      if (open && (value.trim() || current > 0)) { e.preventDefault(); pick(options[current]); }
      else setOpen(false);
    } else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); setOpen(false); }
    }
  }

  // Agrupa las opciones consecutivas con el mismo grupo para la semántica de listbox.
  const groups: { label?: string; items: Option[] }[] = [];
  options.forEach(o => {
    const g = o.kind === 'ai' ? undefined : o.group;
    const last = groups[groups.length - 1];
    if (last && last.label === g && o.kind !== 'ai') last.items.push(o);
    else groups.push({ label: g, items: [o] });
  });

  const renderOption = (o: Option) => {
    const idx = options.indexOf(o);
    const Icon = o.kind === 'ai' ? Sparkles : o.kind === 'recent' ? Clock : MapPin;
    return (
      <li
        key={o.id}
        id={o.id}
        role="option"
        aria-selected={idx === current}
        className={`hs-option${o.kind === 'ai' ? ' hs-option-ai' : ''}${o.kind === 'ai' && options.length === 1 ? ' hs-option-only' : ''}`}
        onMouseDown={e => e.preventDefault()}
        onMouseEnter={() => setActive(idx)}
        onClick={() => pick(o)}
      >
        <Icon size={16} className="hs-option-icon" aria-hidden="true" />
        <span className="hs-option-text">
          {o.kind === 'ai' ? <strong>{o.label}</strong> : o.label}
          {'sub' in o && o.sub && <span className="hs-option-sub">{o.sub}</span>}
        </span>
      </li>
    );
  };

  return (
    <div className="hs-field hs-field-location">
      <label htmlFor={`${uid}-input`} className="hs-label">Ubicación</label>
      <input
        ref={inputRef}
        id={`${uid}-input`}
        className="hs-input"
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? options[current]?.id : undefined}
        placeholder="Comuna o describe lo que necesitas"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => { setOpen(true); setActive(0); }}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <ul id={listId} role="listbox" aria-label="Sugerencias de ubicación y asistente" className="hs-listbox" hidden={!open}>
        {groups.map((g, i) => g.label ? (
          <li key={`g${i}`} role="presentation">
            <span className="hs-group-label" aria-hidden="true">{g.label}</span>
            <ul role="group" aria-label={g.label} className="hs-group">{g.items.map(renderOption)}</ul>
          </li>
        ) : g.items.map(renderOption))}
      </ul>
    </div>
  );
}
