// Traspaso al asistente: qué texto y qué contexto recibe cuando se abre desde una entrada.
// El asistente conversacional se construye en el bloque 3. Este módulo solo define el contrato
// y no reutiliza la lógica anterior que interpretaba el texto y aplicaba filtros automáticamente.

import type { SearchCriteria } from '../search/criteria';

export type AssistantEntry =
  /** Sección "Describe lo que buscas con IA" del combobox de ubicación. */
  | 'combobox'
  /** Enlace "Cuéntaselo al asistente" bajo el buscador. */
  | 'enlace-home'
  /** Buscar con un texto que no es una comuna. */
  | 'buscar-texto-libre';

export type AssistantView = 'inicio' | 'resultados' | 'ficha';

export interface AssistantHandoff {
  entry: AssistantEntry;
  /** Texto que se envía como primer mensaje (la persona escribió una descripción). */
  firstMessage?: string;
  /** Texto que queda escrito en el campo, listo para completar ("En Ñuñoa, "). No se envía solo. */
  prefill?: string;
  /** Contexto con que parte la conversación. Desde el inicio: solo operación y tipo. */
  context: {
    view: AssistantView;
    draft: SearchCriteria;
  };
}

/** Texto para el campo cuando la persona ya eligió una comuna. */
export function comunaPrefill(comuna: string): string {
  return `En ${comuna}, `;
}
