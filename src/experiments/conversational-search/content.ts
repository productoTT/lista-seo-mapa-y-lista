// Guion fijo de conversación usado por las 5 alternativas.
// Los mismos textos y datos se muestran sin importar la alternativa,
// para que la comparación sea justa (misma consulta, mismos resultados).

import type { ChatMsg, ScenarioKey, SimpleProperty } from './types';

export const USER_MSG_1 = 'Busco un departamento en Ñuñoa, con 2 dormitorios y hasta 5.000 UF.';
export const ASSISTANT_MSG_1 = '¿Qué te importa más para ordenar los resultados?';
export const STEP1_CHIPS = ['Cerca del metro', 'Pet friendly', 'Terraza'];

export const USER_MSG_2 = 'Prefiero que sea pet friendly y esté cerca del metro.';
export const ASSISTANT_MSG_2 =
  'Encontré 12 propiedades. Priorizo cercanía al metro y luego precio. Puedes seguir afinando sin perder estos resultados.';

export const CRITERIA_PARTIAL = ['Ñuñoa', '2 dormitorios', 'Hasta 5.000 UF'];
export const CRITERIA_FULL = ['Ñuñoa', '2 dormitorios', 'Hasta 5.000 UF', 'Pet friendly', 'Cerca del metro'];

export const RESULT_COUNT = 12;

export const PROPERTIES: SimpleProperty[] = [
  { id: 'p1', title: 'Departamento en Ñuñoa', specs: '2 dormitorios · 2 baños · Metro Chile España', priceUF: 'UF 4.890' },
  { id: 'p2', title: 'Departamento en Macul', specs: '2 dormitorios · Pet friendly · Terraza', priceUF: 'UF 4.620' },
  { id: 'p3', title: 'Departamento en Providencia', specs: '1 dormitorio · 1 baño · Cercano a parques', priceUF: 'UF 4.990' },
];

export const NORESULTS_USER_MSG = 'Casa en Ñuñoa, 4 dormitorios, piscina y hasta 4.000 UF.';
export const NORESULTS_ASSISTANT_MSG =
  'No encontré propiedades que cumplan todos los criterios. Podemos mantener Ñuñoa y subir el presupuesto, buscar en comunas cercanas o quitar alguna condición.';
export const NORESULTS_OPTIONS = ['Subir hasta 5.000 UF', 'Buscar en Macul', 'Quitar piscina', 'Editar criterios'];

export const IA_PLACEHOLDER = 'Ej: Departamento tranquilo, cerca del metro y pet friendly';

/** Transcripción acumulada de la conversación positiva (Ñuñoa) hasta el escenario dado. */
export function getConversation(scenario: ScenarioKey): ChatMsg[] {
  if (scenario === 'inicio') return [];

  if (scenario === 'conversacion') {
    return [
      { role: 'user', text: USER_MSG_1 },
      { role: 'assistant', text: ASSISTANT_MSG_1, chips: STEP1_CHIPS },
    ];
  }

  if (scenario === 'resultados') {
    return [
      { role: 'user', text: USER_MSG_1 },
      { role: 'assistant', text: ASSISTANT_MSG_1, chips: STEP1_CHIPS, chipsAnswered: true },
      { role: 'user', text: USER_MSG_2 },
      { role: 'assistant', text: ASSISTANT_MSG_2 },
    ];
  }

  // sin-resultados: hilo independiente, misma sesión de asistente distinta necesidad.
  return [
    { role: 'user', text: NORESULTS_USER_MSG },
    { role: 'assistant', text: NORESULTS_ASSISTANT_MSG, chips: NORESULTS_OPTIONS },
  ];
}

/** Criterios visibles derivados de la conversación en el escenario dado. */
export function getCriteria(scenario: ScenarioKey): string[] {
  if (scenario === 'inicio') return [];
  if (scenario === 'conversacion') return CRITERIA_PARTIAL;
  if (scenario === 'resultados') return CRITERIA_FULL;
  return ['Ñuñoa', '4 dormitorios', 'Piscina', 'Hasta 4.000 UF'];
}

/** Avanza el escenario cuando el usuario envía texto o elige una respuesta rápida. */
export function nextScenario(current: ScenarioKey): ScenarioKey {
  if (current === 'inicio') return 'conversacion';
  if (current === 'conversacion') return 'resultados';
  if (current === 'sin-resultados') return 'resultados';
  return 'resultados';
}
