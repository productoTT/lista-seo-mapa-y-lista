import { Monitor, Smartphone } from 'lucide-react';
import { AltBadge } from './shared/ui';
import { ALTERNATIVES, SCENARIOS, type AlternativeId, type Device, type ScenarioKey } from './types';

interface ControlBarProps {
  activeAlt: AlternativeId;
  onAltChange: (id: AlternativeId) => void;
  device: Device;
  onDeviceChange: (d: Device) => void;
  scenario: ScenarioKey;
  onScenarioChange: (s: ScenarioKey) => void;
}

export function ControlBar({
  activeAlt, onAltChange, device, onDeviceChange, scenario, onScenarioChange,
}: ControlBarProps) {
  const meta = ALTERNATIVES.find(a => a.id === activeAlt)!;

  return (
    <div className="sticky top-0 z-50 border-b border-gray-700 bg-[#15102b] px-4 py-3 text-white sm:px-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-white/50">
              Comparador · Búsqueda conversacional
            </p>
            <AltBadge meta={meta} />
          </div>
          <p className="m-0 max-w-md text-xs text-white/60">{meta.summary}</p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="ctrl-alternativa" className="text-[11px] font-bold uppercase tracking-wide text-white/50">
              Alternativa
            </label>
            <select
              id="ctrl-alternativa"
              value={activeAlt}
              onChange={e => onAltChange(e.target.value as AlternativeId)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-tt-mint"
            >
              {ALTERNATIVES.map(a => (
                <option key={a.id} value={a.id} className="text-tt-ink">
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span id="ctrl-dispositivo-label" className="text-[11px] font-bold uppercase tracking-wide text-white/50">
              Dispositivo
            </span>
            <div className="flex gap-1 rounded-lg border border-white/20 bg-white/10 p-1" role="group" aria-labelledby="ctrl-dispositivo-label">
              {([
                { key: 'desktop' as const, label: 'Escritorio', Icon: Monitor },
                { key: 'mobile' as const, label: 'Móvil', Icon: Smartphone },
              ]).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={device === key}
                  onClick={() => onDeviceChange(key)}
                  className={[
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors',
                    device === key ? 'bg-tt-mint text-tt-indigo' : 'text-white/70 hover:bg-white/10',
                  ].join(' ')}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ctrl-escenario" className="text-[11px] font-bold uppercase tracking-wide text-white/50">
              Escenario
            </label>
            <select
              id="ctrl-escenario"
              value={scenario}
              onChange={e => onScenarioChange(e.target.value as ScenarioKey)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-tt-mint"
            >
              {SCENARIOS.map(s => (
                <option key={s.key} value={s.key} className="text-tt-ink">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
