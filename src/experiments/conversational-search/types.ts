// Tipos compartidos del experimento "Búsqueda conversacional".
// Aislado del resto de la app: no reutiliza Screen/ViewMode del buscador real
// porque este experimento no navega la app real, solo la simula.

export type AlternativeId = 'actual' | 'progresiva' | 'panel' | 'ruta' | 'flotante';

export type Device = 'desktop' | 'mobile';

export type ScenarioKey = 'inicio' | 'conversacion' | 'resultados' | 'sin-resultados';

export interface AlternativeMeta {
  id: AlternativeId;
  title: string;
  badge: string;
  badgeTone: 'warning' | 'success' | 'info' | 'neutral';
  summary: string;
}

export const ALTERNATIVES: AlternativeMeta[] = [
  {
    id: 'actual',
    title: 'Solución actual',
    badge: 'Estado actual · No escalar',
    badgeTone: 'warning',
    summary: 'Chat de gran tamaño embebido en el Home. Referencia de lo probado internamente.',
  },
  {
    id: 'progresiva',
    title: 'Entrada progresiva',
    badge: 'Recomendada',
    badgeTone: 'success',
    summary: 'Entrada compacta en el Home que se expande a una superficie dedicada tras el primer mensaje.',
  },
  {
    id: 'panel',
    title: 'Panel contextual',
    badge: 'Mejor para refinar resultados',
    badgeTone: 'info',
    summary: 'La conversación acompaña una lista de resultados existente sin reemplazarla.',
  },
  {
    id: 'ruta',
    title: 'Ruta dedicada',
    badge: 'Alta profundidad',
    badgeTone: 'info',
    summary: 'La búsqueda conversacional vive en una página independiente.',
  },
  {
    id: 'flotante',
    title: 'Botón flotante',
    badge: 'Canal secundario',
    badgeTone: 'neutral',
    summary: 'Home tradicional sin cambios; el asistente es un canal secundario.',
  },
];

export const SCENARIOS: { key: ScenarioKey; label: string }[] = [
  { key: 'inicio', label: 'Inicio' },
  { key: 'conversacion', label: 'Conversación' },
  { key: 'resultados', label: 'Resultados' },
  { key: 'sin-resultados', label: 'Sin resultados' },
];

export interface AltState {
  scenario: ScenarioKey;
  panelOpen: boolean;
  draft: string;
}

export const DEFAULT_ALT_STATE: AltState = {
  scenario: 'inicio',
  panelOpen: false,
  draft: '',
};

export interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
  chips?: string[];
  chipsAnswered?: boolean;
}

export interface SimpleProperty {
  id: string;
  title: string;
  specs: string;
  priceUF: string;
}
