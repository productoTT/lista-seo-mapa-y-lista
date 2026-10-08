import { useRef, useEffect, useId, type KeyboardEvent } from 'react';
import { Sparkles, Send, Building2, X } from 'lucide-react';
import type { AlternativeMeta, ChatMsg } from '../types';

// ── Badge de identificación de alternativa ─────────────────

const BADGE_TONES: Record<AlternativeMeta['badgeTone'], string> = {
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  success: 'bg-tt-indigo-50 text-tt-indigo border border-tt-indigo-200',
  info: 'bg-tt-indigo-50 text-tt-indigo border border-tt-indigo-200',
  neutral: 'bg-gray-100 text-gray-700 border border-gray-300',
};

export function AltBadge({ meta }: { meta: AlternativeMeta }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${BADGE_TONES[meta.badgeTone]}`}
    >
      {meta.badgeTone === 'success' && <Sparkles size={12} aria-hidden="true" />}
      {meta.badge}
    </span>
  );
}

// ── Mensaje de chat ─────────────────────────────────────────

interface ChatBubbleProps {
  msg: ChatMsg;
  onChip?: (label: string) => void;
  dense?: boolean;
}

export function ChatBubble({ msg, onChip, dense }: ChatBubbleProps) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={[
          'max-w-[86%] rounded-2xl px-4 leading-snug',
          dense ? 'py-2 text-[13px]' : 'py-2.5 text-sm',
          isUser
            ? 'bg-tt-indigo text-white rounded-br-sm'
            : 'bg-white text-tt-ink border border-tt-divider rounded-bl-sm',
        ].join(' ')}
      >
        {!isUser && (
          <span className="mr-1.5 inline-flex align-text-bottom text-tt-indigo">
            <Sparkles size={13} aria-hidden="true" />
          </span>
        )}
        {msg.text}
      </div>

      {msg.chips && msg.chips.length > 0 && (
        <div className={`mt-2 flex flex-wrap gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {msg.chips.map(chip => (
            <ChipButton
              key={chip}
              label={chip}
              onClick={() => onChip?.(chip)}
              muted={msg.chipsAnswered}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Chip clicable (respuesta rápida / recuperación) ─────────

export function ChipButton({
  label, onClick, muted,
}: { label: string; onClick: () => void; muted?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={muted}
      aria-disabled={muted}
      className={[
        'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
        muted
          ? 'border-tt-divider text-gray-400 bg-gray-50 cursor-default'
          : 'border-tt-indigo-200 text-tt-indigo bg-tt-indigo-50 hover:bg-tt-indigo hover:text-white cursor-pointer',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ── Chips de criterios activos ──────────────────────────────

export function CriteriaChips({ criteria, dense }: { criteria: string[]; dense?: boolean }) {
  if (criteria.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0" aria-label="Criterios activos de la búsqueda">
      {criteria.map(c => (
        <li
          key={c}
          className={`rounded-md bg-tt-indigo-50 text-tt-indigo font-bold ${dense ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
        >
          {c}
        </li>
      ))}
    </ul>
  );
}

// ── Fila de propiedad compacta (sin card-in-card) ───────────

export function PropertyRow({
  title, specs, priceUF,
}: { title: string; specs: string; priceUF: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-tt-divider bg-white px-3 py-2.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-tt-indigo-50">
        <Building2 size={16} className="text-tt-indigo" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-tt-ink">{title}</p>
        <p className="m-0 truncate text-xs text-tt-ink-2">{specs}</p>
      </div>
      <p className="m-0 flex-shrink-0 text-sm font-extrabold text-tt-indigo">{priceUF}</p>
    </div>
  );
}

// ── Campo de escritura único ─────────────────────────────────

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  label: string;
  autoFocus?: boolean;
}

export function Composer({ value, onChange, onSubmit, placeholder, label, autoFocus }: ComposerProps) {
  const ref = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSubmit();
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-tt-divider bg-white px-2 py-2">
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <input
        ref={ref}
        id={inputId}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-2 py-1.5 text-sm text-tt-ink outline-none placeholder:text-gray-400"
      />
      <button
        type="button"
        onClick={onSubmit}
        aria-label="Enviar mensaje"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-tt-indigo text-white transition-opacity hover:opacity-90"
      >
        <Send size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

// ── Botón cerrar genérico ────────────────────────────────────

export function CloseIconButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-tt-ink-2 hover:bg-gray-100"
    >
      <X size={16} aria-hidden="true" />
    </button>
  );
}

// ── Encabezado pequeño reutilizado dentro de superficies conversacionales ──

export function ConversationToolbar({
  onNewConversation, onBack, backLabel,
}: { onNewConversation: () => void; onBack?: () => void; backLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-tt-ink-2 hover:text-tt-indigo"
        >
          ← {backLabel ?? 'Volver'}
        </button>
      ) : <span />}
      <button
        type="button"
        onClick={onNewConversation}
        className="text-xs font-bold text-tt-indigo hover:underline"
      >
        Nueva conversación
      </button>
    </div>
  );
}
