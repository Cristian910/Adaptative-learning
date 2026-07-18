import type { BehaviorEvent, UserProfile, LearnerState } from '../types/domain';

// ─── Recalculate Confidence ────────────────────────────────────────────────────
// Weighted moving average: eventos recientes pesan exponencialmente más.
// Solo usa los últimos 20 eventos de "resultado" (quiz_answer + code_run) para
// mantener relevancia temporal. code_run se incluye aquí porque fallar
// repetidamente un ejercicio de código es una señal de dificultad tan válida
// como fallar un quiz — antes se ignoraba por completo, y el usuario podía
// fallar el mismo ejercicio 10 veces sin que el sistema reaccionara.
// Default 0.5 (neutral) cuando no hay historial suficiente.

export function recalculateConfidence(events: BehaviorEvent[]): number {
  const outcomeEvents = events
    .filter(
      (e) =>
        (e.type === 'quiz_answer' && e.metadata.kind === 'quiz_answer') ||
        (e.type === 'code_run' && e.metadata.kind === 'code_run')
    )
    .slice(-20);

  if (outcomeEvents.length === 0) return 0.5;

  let weightedSum = 0;
  let totalWeight = 0;

  outcomeEvents.forEach((e, index) => {
    const weight = Math.pow(1.2, index); // eventos más recientes = mayor peso
    let value: number | null = null;
    if (e.metadata.kind === 'quiz_answer') {
      value = e.metadata.correct ? 1 : 0;
    } else if (e.metadata.kind === 'code_run') {
      value = e.metadata.success ? 1 : 0;
    }
    if (value === null) return;
    weightedSum += value * weight;
    totalWeight += weight;
  });

  return Math.min(1, Math.max(0, weightedSum / totalWeight));
}

// ─── Classify Learner State ────────────────────────────────────────────────────
// Los umbrales 0.35 y 0.72 fueron calibrados para crear zonas distintas:
// - struggling: < 0.35 — mayoría de respuestas incorrectas, necesita ayuda
// - normal: 0.35–0.72 — rango de aprendizaje activo, flujo natural
// - advanced: > 0.72 — consistentemente correcto, puede ir más rápido

export function classifyLearnerState(confidence: number): LearnerState {
  if (confidence < 0.35) return 'struggling';
  if (confidence > 0.72) return 'advanced';
  return 'normal';
}

// ─── Update Profile Derivados ─────────────────────────────────────────────────
// Actualiza campos calculados del perfil basados en el nuevo evento.
// Separado del motor de adaptación para que sea testeable en aislamiento.

export function updateProfileDerivedFields(
  profile: UserProfile,
  newEvent: BehaviorEvent,
  allEvents: BehaviorEvent[]
): Partial<UserProfile> {
  const updates: Partial<UserProfile> = {};

  // Contar errores totales acumulados
  if (
    newEvent.type === 'quiz_answer' &&
    newEvent.metadata.kind === 'quiz_answer' &&
    !newEvent.metadata.correct
  ) {
    updates.totalMistakes = profile.totalMistakes + 1;
  }

  // Recalcular avgTimePerBlock basado en eventos block_enter/block_exit pares
  const blockPairs = extractBlockTimePairs(allEvents);
  if (blockPairs.length > 0) {
    const totalTime = blockPairs.reduce((sum, pair) => sum + pair.duration, 0);
    updates.avgTimePerBlock = totalTime / blockPairs.length;
  }

  return updates;
}

interface BlockTimePair {
  blockId: string;
  duration: number; // ms
}

function extractBlockTimePairs(events: BehaviorEvent[]): BlockTimePair[] {
  const pairs: BlockTimePair[] = [];
  const enterTimes = new Map<string, number>();

  for (const event of events) {
    if (event.type === 'block_enter') {
      enterTimes.set(event.blockId, event.timestamp);
    } else if (event.type === 'block_exit') {
      const enterTime = enterTimes.get(event.blockId);
      if (enterTime !== undefined) {
        pairs.push({
          blockId: event.blockId,
          duration: event.timestamp - enterTime,
        });
        enterTimes.delete(event.blockId);
      }
    }
  }

  return pairs;
}
