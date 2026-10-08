import type { ReactNode } from 'react';
import type { Device } from './types';

/**
 * Simula el dispositivo seleccionado sin usar marcos de teléfono decorativos:
 * en móvil, constriñe el ancho a 390px (se encoge más en pantallas angostas
 * reales) y da un contenedor con altura definida para poder simular capas
 * (paneles, hojas) posicionadas con `absolute` en vez de `fixed`.
 */
export function DeviceFrame({ device, children }: { device: Device; children: ReactNode }) {
  if (device === 'desktop') {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="flex w-full justify-center bg-[#EDEDF2] px-2 py-4">
      <div className="w-full max-w-[390px] overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
        <div className="relative h-[760px] max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
