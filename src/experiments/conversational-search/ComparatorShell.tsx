import { useEffect, useState } from 'react';
import { ControlBar } from './ControlBar';
import { DeviceFrame } from './DeviceFrame';
import { Alt1CurrentState } from './alternatives/Alt1CurrentState';
import { Alt2ProgressiveEntry } from './alternatives/Alt2ProgressiveEntry';
import { Alt3ContextPanel } from './alternatives/Alt3ContextPanel';
import { Alt4DedicatedRoute } from './alternatives/Alt4DedicatedRoute';
import { Alt5FloatingButton } from './alternatives/Alt5FloatingButton';
import { ALTERNATIVES, SCENARIOS, DEFAULT_ALT_STATE, type AlternativeId, type AltState, type Device } from './types';

type AltStateMap = Record<AlternativeId, AltState>;

function initialAltStates(): AltStateMap {
  return {
    actual: { ...DEFAULT_ALT_STATE },
    progresiva: { ...DEFAULT_ALT_STATE },
    panel: { ...DEFAULT_ALT_STATE },
    ruta: { ...DEFAULT_ALT_STATE },
    flotante: { ...DEFAULT_ALT_STATE },
  };
}

const ALT_COMPONENTS: Record<AlternativeId, typeof Alt1CurrentState> = {
  actual: Alt1CurrentState,
  progresiva: Alt2ProgressiveEntry,
  panel: Alt3ContextPanel,
  ruta: Alt4DedicatedRoute,
  flotante: Alt5FloatingButton,
};

export function ComparatorShell() {
  const [activeAlt, setActiveAlt] = useState<AlternativeId>('actual');
  const [device, setDevice] = useState<Device>('desktop');
  const [altStates, setAltStates] = useState<AltStateMap>(initialAltStates);
  const [liveMessage, setLiveMessage] = useState('');

  const currentMeta = ALTERNATIVES.find(a => a.id === activeAlt)!;
  const currentScenario = altStates[activeAlt].scenario;

  useEffect(() => {
    const scenarioLabel = SCENARIOS.find(s => s.key === currentScenario)?.label ?? currentScenario;
    const deviceLabel = device === 'desktop' ? 'escritorio' : 'móvil';
    setLiveMessage(`Mostrando "${currentMeta.title}" en ${deviceLabel}. Escenario: ${scenarioLabel}.`);
  }, [activeAlt, device, currentScenario, currentMeta.title]);

  function setAltState(id: AlternativeId, updater: (s: AltState) => AltState) {
    setAltStates(prev => ({ ...prev, [id]: updater(prev[id]) }));
  }

  return (
    <div className="min-h-screen bg-[#EDEDF2]">
      <ControlBar
        activeAlt={activeAlt}
        onAltChange={setActiveAlt}
        device={device}
        onDeviceChange={setDevice}
        scenario={currentScenario}
        onScenarioChange={s =>
          setAltState(activeAlt, prev => ({ ...prev, scenario: s, panelOpen: s !== 'inicio' ? true : prev.panelOpen }))
        }
      />

      <div aria-live="polite" role="status" className="sr-only">{liveMessage}</div>

      <main>
        {ALTERNATIVES.map(meta => {
          const Component = ALT_COMPONENTS[meta.id];
          const isActive = activeAlt === meta.id;
          return (
            <div key={meta.id} hidden={!isActive}>
              <DeviceFrame device={device}>
                <Component
                  device={device}
                  state={altStates[meta.id]}
                  setState={updater => setAltState(meta.id, typeof updater === 'function' ? updater : () => updater)}
                />
              </DeviceFrame>
            </div>
          );
        })}
      </main>
    </div>
  );
}
