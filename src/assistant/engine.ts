// Motor SIMULADO del asistente: reglas fijas, sin modelo de lenguaje ni servicios externos.
// Es puro (no toca la búsqueda aplicada): propone un borrador y la app decide qué hacer
// solo cuando la persona elige una acción. Se verifica con scripts/verify-search.ts.

import type { Property } from '../types/property';
import type { SearchCriteria } from '../search/criteria.ts';
import { DEFAULT_CRITERIA, activeCriteria, filterProperties, removalPatch, searchSentence } from '../search/criteria.ts';
import { COMUNAS, VECINAS } from '../data/comunas.ts';
import { clpToUf } from '../data/uf.ts';

import type { AssistantView } from './handoff';

export type AssistantAction =
  /** Envía un texto como si la persona lo escribiera. */
  | { kind: 'send'; label: string; text: string }
  /** Propone una búsqueda ya armada (p. ej. soltar un criterio). Sigue siendo borrador. */
  | { kind: 'propose'; label: string; criteria: SearchCriteria }
  /** Limpia los filtros aplicados. Solo por clic explícito. */
  | { kind: 'clear-applied'; label: string };

export type AssistantReply =
  | { kind: 'text'; text: string; actions?: AssistantAction[] }
  | { kind: 'search'; text: string; criteria: SearchCriteria; resultIds: string[]; total: number; follow: string }
  | { kind: 'no-results'; text: string; actions: AssistantAction[] };

export interface EngineResult {
  reply: AssistantReply;
  /** Nuevo borrador, si la respuesta lo cambia. Nunca es la búsqueda aplicada. */
  draft?: SearchCriteria;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const NUMS: Record<string, number> = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5 };
const CAROUSEL_MAX = 10;

// ── Datos personales ──────────────────────────────────────

const RUT_RE = /\b\d{1,2}\.?\d{3}\.?\d{3}\s*-\s*[\dkK]\b/;
const PERSONAL_RE = /\b(mi )?rut\b|\bgano\b|\bsueldo\b|\bmi renta\b|\bmis ingresos\b|\bingreso liquido\b|\bmi ingreso\b|\bme pagan\b/;

/**
 * Se aplica ANTES de guardar el mensaje: si hay RUT o ingresos, el hilo solo conserva la versión oculta.
 * El texto original no se guarda ni se envía a ningún servicio.
 */
export function maskPersonalData(text: string): { text: string; masked: boolean } {
  const t = norm(text);
  if (RUT_RE.test(text) || PERSONAL_RE.test(t)) return { text: text.replace(/\d/g, '•'), masked: true };
  return { text, masked: false };
}

// ── Interpretación ────────────────────────────────────────

type Intent = 'reset' | 'budget' | 'quote' | 'widen';

interface Parsed {
  patch: Partial<SearchCriteria>;
  replaceComunas: boolean;
  intents: Set<Intent>;
}

function parse(text: string, op: SearchCriteria['operation']): Parsed {
  const t = norm(text);
  const patch: Partial<SearchCriteria> = {};
  const intents = new Set<Intent>();

  if (/(empe[zc]|de nuevo|de cero|borra todo|reinicia)/.test(t)) intents.add('reset');
  if (/(cuanto (puedo|podria) pagar|me alcanza|presupuesto|poder de compra)/.test(t) && !/\d/.test(t)) intents.add('budget');
  if (/cotiz/.test(t)) intents.add('quote');
  if (/(cercanas|alrededor|amplia|vecin|otras comunas)/.test(t)) intents.add('widen');

  if (/(arriend|arrend|alquil)/.test(t)) patch.operation = 'arriendo';
  else if (/(compr|venta|invert)/.test(t)) patch.operation = 'venta';
  if (/(depto|departamento|dpto)/.test(t)) patch.propertyType = 'departamento';
  else if (/\bcasas?\b/.test(t)) patch.propertyType = 'casa';
  else if (/oficina/.test(t)) patch.propertyType = 'oficina';
  else if (/(cualquier tipo|todos los tipos)/.test(t)) patch.propertyType = null;

  const comunas = COMUNAS.filter(c => t.includes(norm(c)));
  if (comunas.length) patch.comunas = comunas;

  if (/\b(studio|estudio)\b/.test(t)) patch.bedrooms = 0;
  let m = t.match(/(\d+|un|uno|una|dos|tres|cuatro|cinco)\s*(dorm|habitaci|pieza)/);
  if (m) patch.bedrooms = NUMS[m[1]] ?? +m[1];
  m = t.match(/(\d+|un|uno|dos|tres)\s*bano/);
  if (m) patch.bathroomsMin = NUMS[m[1]] ?? +m[1];

  m = t.match(/(\d[\d.]*)\s*uf/);
  if (m) { patch.priceMinUF = 0; patch.priceMaxUF = +m[1].replace(/\./g, ''); }
  else {
    m = t.match(/\$\s?(\d[\d.]*)/) ?? t.match(/(\d+)\s*(mil|lucas)\b/);
    if (m) {
      let clp = +m[1].replace(/\./g, '');
      if (/mil|lucas/.test(m[0])) clp *= 1000;
      // El filtro de precio trabaja en UF (también para arriendo, como el resto del prototipo).
      if (clp >= 20000) { patch.priceMinUF = 0; patch.priceMaxUF = clpToUf(clp); }
    }
  }

  if (/metro/.test(t)) { m = t.match(/(\d+)\s*min/); patch.metroMaxMin = m ? +m[1] : 10; }

  const features: SearchCriteria['features'] = [];
  if (/terraza|balcon/.test(t)) features.push('terraza');
  if (/estacionamiento|\bauto\b/.test(t)) features.push('estacionamiento');
  if (/mascota|perro|gato|pet friendly/.test(t)) features.push('mascotas');
  if (/patio|jardin/.test(t)) features.push('patio');
  if (/bodega/.test(t)) features.push('bodega');
  if (features.length) patch.features = features;

  // Cambiar de operación invalida un tope de precio que venía de la otra operación.
  if (patch.operation && patch.operation !== op && patch.priceMaxUF === undefined) {
    patch.priceMinUF = DEFAULT_CRITERIA.priceMinUF; patch.priceMaxUF = DEFAULT_CRITERIA.priceMaxUF;
  }
  return { patch, replaceComunas: /(solo en|solamente en|cambia a|mejor en)/.test(t), intents };
}

function merge(draft: SearchCriteria, p: Parsed): SearchCriteria {
  const next: SearchCriteria = { ...draft, ...p.patch };
  if (p.patch.comunas) next.comunas = p.replaceComunas ? p.patch.comunas : [...new Set([...draft.comunas, ...p.patch.comunas])];
  if (p.patch.features) next.features = [...new Set([...draft.features, ...p.patch.features])];
  if (p.intents.has('widen')) next.comunas = withNeighbors(next.comunas);
  return next;
}

function withNeighbors(comunas: string[]): string[] {
  return [...new Set([...comunas, ...comunas.flatMap(c => VECINAS[c] ?? [])])];
}

const sameCriteria = (a: SearchCriteria, b: SearchCriteria) => JSON.stringify(a) === JSON.stringify(b);

/** "departamentos en venta en Ñuñoa, de 2+ dorm., con terraza" */
export function describeCriteria(c: SearchCriteria): string {
  const extra = activeCriteria(c, { exclude: ['operation', 'propertyType'] })
    .filter(x => !x.key.startsWith('comuna:')).map(x => x.label.toLowerCase());
  const base = searchSentence(c);
  return (base.charAt(0).toLowerCase() + base.slice(1)) + (extra.length ? `, ${extra.join(', ')}` : '');
}

/** Cierra una frase con punto sin duplicarlo ("2+ dorm." no queda "2+ dorm.."). */
export function sentence(s: string): string {
  return s.endsWith('.') ? s : `${s}.`;
}

const FOLLOW = [
  'Puedes seguir afinando: dime qué cambiar o abre todos los resultados en la lista.',
  'Si quieres, sumo comunas cercanas o agrego otra condición.',
  'Cuéntame qué no te convence y lo ajusto.',
];

// ── Respuestas ────────────────────────────────────────────

/** Responde con una búsqueda propuesta (o con alternativas si no hay coincidencias). */
export function proposeSearch(criteria: SearchCriteria, data: Property[], turn = 0, lead?: string): EngineResult {
  const found = filterProperties(data, criteria).sort((a, b) => b.relevanceScore - a.relevanceScore);
  if (found.length === 0) {
    const actions = relaxOptions(criteria, data);
    return {
      draft: criteria,
      reply: {
        kind: 'no-results',
        text: `No encontré propiedades con todo eso: ${sentence(describeCriteria(criteria))} ${actions.length ? '¿Probamos soltando algo?' : 'Quizás conviene cambiar la operación o el tipo de propiedad.'}`,
        actions,
      },
    };
  }
  const n = found.length;
  return {
    draft: criteria,
    reply: {
      kind: 'search',
      text: lead ?? `Encontré ${n === 1 ? 'una opción' : `${n} opciones`}: ${sentence(describeCriteria(criteria))}`,
      criteria,
      resultIds: found.slice(0, CAROUSEL_MAX).map(p => p.id),
      total: n,
      follow: FOLLOW[turn % FOLLOW.length],
    },
  };
}

/** Hasta 3 formas de soltar un criterio, con cuántas propiedades aparecerían. */
export function relaxOptions(c: SearchCriteria, data: Property[]): AssistantAction[] {
  const out: { action: AssistantAction; n: number }[] = [];
  activeCriteria(c, { exclude: ['operation'] }).forEach(({ key, label }) => {
    const next = { ...c, ...removalPatch(c, key) };
    const n = filterProperties(data, next).length;
    if (n > 0) out.push({ n, action: { kind: 'propose', label: key === 'propertyType' ? `Cualquier tipo (${n})` : `Sin “${label}” (${n})`, criteria: next } });
  });
  if (c.comunas.length) {
    const next = { ...c, comunas: withNeighbors(c.comunas) };
    const n = filterProperties(data, next).length;
    if (n > 0 && next.comunas.length > c.comunas.length) out.push({ n, action: { kind: 'propose', label: `Sumar comunas cercanas (${n})`, criteria: next } });
  }
  // Si soltar un solo criterio no alcanza, ofrece volver a lo esencial (operación, tipo y comunas; luego sin tipo).
  if (out.length === 0) {
    const essentials: SearchCriteria[] = [
      { ...DEFAULT_CRITERIA, operation: c.operation, propertyType: c.propertyType, comunas: c.comunas },
      { ...DEFAULT_CRITERIA, operation: c.operation, comunas: c.comunas },
    ];
    for (const next of essentials) {
      const n = filterProperties(data, next).length;
      if (n > 0) out.push({ n, action: { kind: 'propose', label: `Solo ${describeCriteria(next)} (${n})`, criteria: next } });
    }
  }
  return out.sort((a, b) => b.n - a.n).slice(0, 3).map(o => o.action);
}

export interface RespondContext {
  draft: SearchCriteria;
  applied: SearchCriteria;
  view: AssistantView;
  data: Property[];
  /** Número de respuestas de búsqueda anteriores (varía el texto de seguimiento). */
  turn: number;
}

/**
 * Respuesta a un mensaje de la persona. `masked` indica que el mensaje tenía datos personales:
 * en ese caso el motor ni siquiera recibe el texto original.
 */
export function respond(text: string, masked: boolean, ctx: RespondContext): EngineResult {
  if (masked) {
    return { reply: { kind: 'text', text: 'Prefiero no usar RUT, ingresos ni otros datos personales en el chat, así que oculté lo que escribiste y no lo guardé. La estimación de presupuesto y la pre-evaluación se hacen fuera del chat; en este prototipo todavía no están disponibles.' } };
  }
  const p = parse(text, ctx.draft.operation);

  if (p.intents.has('reset')) {
    const fresh: SearchCriteria = { ...DEFAULT_CRITERIA, operation: ctx.draft.operation };
    const hasApplied = activeCriteria(ctx.applied, { exclude: ['operation', 'propertyType'] }).length > 0;
    return {
      draft: fresh,
      reply: {
        kind: 'text',
        text: 'Listo, empecemos de cero en esta conversación. Tus filtros aplicados no cambiaron. ¿Qué estás buscando?',
        actions: hasApplied ? [{ kind: 'clear-applied', label: 'Limpiar también mis filtros' }] : undefined,
      },
    };
  }
  if (p.intents.has('budget') && Object.keys(p.patch).length === 0) {
    return { reply: { kind: 'text', text: 'Para saber cuánto podrías pagar existen la estimación de presupuesto y la pre-evaluación express. Se hacen fuera del chat, para que tus datos no queden en la conversación. En este prototipo todavía no están disponibles.' } };
  }
  if (p.intents.has('quote') && Object.keys(p.patch).length === 0) {
    return { reply: { kind: 'text', text: 'Cuando cotizas, la inmobiliaria recibe tu contacto y la unidad que te interesa, y te contacta para coordinar una visita. Después de cotizar puedes preevaluarte en un minuto. La cotización todavía no está disponible en este prototipo.' } };
  }

  const next = merge(ctx.draft, p);
  if (sameCriteria(next, ctx.draft)) {
    if (Object.keys(p.patch).length) return { reply: { kind: 'text', text: 'Eso ya lo estoy considerando. ¿Quieres afinar otra cosa?' } };
    return {
      reply: {
        kind: 'text',
        text: 'Te ayudo mejor si me cuentas algo de lo que buscas: la comuna, cuántos dormitorios, un precio tope, si quieres estar cerca del metro o si necesitas terraza, patio, estacionamiento o que acepten mascotas.',
        actions: [
          { kind: 'send', label: '2 dormitorios cerca del metro', text: '2 dormitorios cerca del metro' },
          { kind: 'send', label: 'Con estacionamiento', text: 'con estacionamiento' },
          { kind: 'send', label: '¿Cómo funciona cotizar?', text: '¿Cómo funciona cotizar?' },
        ],
      },
    };
  }
  return proposeSearch(next, ctx.data, ctx.turn);
}

/** Sugerencias sobre el campo de texto (spec §14), solo con lo que ya funciona en el prototipo. */
export function suggestions(hasConversation: boolean, draft: SearchCriteria | null): { label: string; text: string }[] {
  if (!hasConversation || !draft) {
    return [
      { label: 'Cerca del metro y con patio', text: 'Cerca del metro y con patio' },
      { label: '2 dormitorios en Ñuñoa', text: '2 dormitorios en Ñuñoa' },
      { label: '¿Cómo funciona cotizar?', text: '¿Cómo funciona cotizar?' },
    ];
  }
  const s: { label: string; text: string }[] = [];
  if (draft.metroMaxMin === null) s.push({ label: 'Cerca del metro', text: 'cerca del metro' });
  if (!draft.features.includes('estacionamiento') && draft.propertyType !== 'oficina') s.push({ label: 'Con estacionamiento', text: 'con estacionamiento' });
  if (draft.comunas.length) s.push({ label: 'Suma comunas cercanas', text: 'suma comunas cercanas' });
  s.push({ label: 'Empezar de cero', text: 'empezar de cero' });
  return s.slice(0, 4);
}
