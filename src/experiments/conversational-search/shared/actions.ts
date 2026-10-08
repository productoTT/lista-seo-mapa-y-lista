import type { Dispatch, SetStateAction } from 'react';
import { nextScenario } from '../content';
import { DEFAULT_ALT_STATE, type AltState } from '../types';

/**
 * Fábrica de acciones compartidas por las 5 alternativas: enviar mensaje,
 * elegir chip, nueva conversación, volver, abrir/cerrar panel.
 * Centraliza la lógica de avance de escenario para que las 5 alternativas
 * se comporten de forma consistente ante las mismas interacciones.
 */
export function createAltActions(state: AltState, setState: Dispatch<SetStateAction<AltState>>) {
  return {
    setDraft(v: string) {
      setState(s => ({ ...s, draft: v }));
    },
    submit() {
      if (!state.draft.trim()) return;
      setState(s => ({ ...s, scenario: nextScenario(s.scenario), draft: '', panelOpen: true }));
    },
    chip(label: string) {
      if (state.scenario === 'conversacion') {
        setState(s => ({ ...s, scenario: 'resultados' }));
        return;
      }
      if (state.scenario === 'sin-resultados') {
        if (label === 'Editar criterios') return;
        setState(s => ({ ...s, scenario: 'resultados' }));
      }
    },
    start() {
      setState(s => ({ ...s, scenario: 'conversacion', panelOpen: true }));
    },
    newConversation() {
      setState(s => ({ ...s, scenario: 'inicio', draft: '' }));
    },
    goHome() {
      setState(s => ({ ...s, scenario: 'inicio', draft: '', panelOpen: false }));
    },
    openPanel() {
      setState(s => ({ ...s, panelOpen: true }));
    },
    closePanel() {
      setState(s => ({ ...s, panelOpen: false }));
    },
    reset() {
      setState({ ...DEFAULT_ALT_STATE });
    },
  };
}

export type AltActions = ReturnType<typeof createAltActions>;
