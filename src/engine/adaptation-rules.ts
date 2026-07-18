import type {
  BehaviorEvent,
  UserProfile,
  AdaptationDecision,
} from '../types/domain';

export interface RuleContext {
  event: BehaviorEvent;
  profile: UserProfile;
  recentEvents: BehaviorEvent[];
  lastDecisionAt: Record<string, number>;
}

export type Rule = {
  id: string;
  evaluate: (ctx: RuleContext) => AdaptationDecision | null;
};

// ─── Utilidades internas ──────────────────────────────────────────────────────

export function countRecentMistakesOnQuestion(
  events: BehaviorEvent[],
  questionId: string
): number {
  return events.filter(
    (e) =>
      e.type === 'quiz_answer' &&
      e.metadata.kind === 'quiz_answer' &&
      e.metadata.questionId === questionId &&
      !e.metadata.correct
  ).length;
}

export function isCoolingDown(
  lastDecisionAt: Record<string, number>,
  decisionType: string,
  cooldownMs: number
): boolean {
  const last = lastDecisionAt[decisionType];
  if (!last) return false;
  return Date.now() - last < cooldownMs;
}

export function getConsecutiveCorrect(recentEvents: BehaviorEvent[]): number {
  let count = 0;
  for (let i = recentEvents.length - 1; i >= 0; i--) {
    const e = recentEvents[i];
    if (e.type !== 'quiz_answer' || e.metadata.kind !== 'quiz_answer') break;
    if (!e.metadata.correct) break;
    count++;
  }
  return count;
}

// ─── Las 8 Reglas ─────────────────────────────────────────────────────────────

export const ADAPTATION_RULES: Rule[] = [
  // REGLA 1: Falla la misma pregunta 2 veces → IA explica desde el error específico.
  // Umbral 2 (no 3): intervenir antes de la frustración, no después.
  // Cooldown 5 min: evita spam de llamadas a IA si el usuario sigue fallando.
  {
    id: 'REPEATED_FAILURE_AI_EXPLANATION',
    evaluate({ event, recentEvents, lastDecisionAt }) {
      if (event.type !== 'quiz_answer') return null;
      if (event.metadata.kind !== 'quiz_answer') return null;
      if (event.metadata.correct) return null;
      if (event.metadata.attemptNumber < 2) return null;

      const mistakes = countRecentMistakesOnQuestion(
        recentEvents,
        event.metadata.questionId
      );
      if (mistakes < 2) return null;
      if (isCoolingDown(lastDecisionAt, 'request_ai_explanation', 5 * 60 * 1000)) return null;

      return {
        type: 'request_ai_explanation',
        priority: 1,
        triggeredBy: 'REPEATED_FAILURE_AI_EXPLANATION',
        context: {
          lessonId: event.lessonId,
          blockId: event.blockId,
          questionId: event.metadata.questionId,
          specificError: event.metadata.selectedOption,
        },
        shouldTriggerAI: true,
        cooldownMs: 5 * 60 * 1000,
      };
    },
  },

  // REGLA 2: Idle 45+ seg en cualquier bloque → hint contextual de IA.
  // 45s es el umbral del brief. No bajarlo: 30s puede ser lectura profunda normal.
  // Cooldown de 10 min para no interrumpir nuevamente en el mismo bloque.
  {
    id: 'IDLE_TOO_LONG_HINT',
    evaluate({ event, lastDecisionAt }) {
      if (event.type !== 'idle_detected') return null;
      if (event.metadata.kind !== 'idle_detected') return null;
      if (event.metadata.idleDurationMs < 45_000) return null;
      if (isCoolingDown(lastDecisionAt, 'show_hint', 10 * 60 * 1000)) return null;

      return {
        type: 'show_hint',
        priority: 1,
        triggeredBy: 'IDLE_TOO_LONG_HINT',
        context: {
          lessonId: event.lessonId,
          blockId: event.blockId,
          idleDurationMs: event.metadata.idleDurationMs,
          blockType: event.metadata.blockType,
        },
        shouldTriggerAI: true,
        cooldownMs: 10 * 60 * 1000,
      };
    },
  },

  // REGLA 3: confidence < 0.3 → simplificar contenido.
  // 0.3 es el punto donde el ratio errores/aciertos indica bloqueo real.
  // Solo dispara en eventos relevantes (no simplificar al abrir la lección).
  // code_run se incluye para que fallar un ejercicio de código varias veces
  // seguidas también pueda disparar un cambio de variante — antes solo un
  // quiz mal respondido movía la aguja.
  {
    id: 'LOW_CONFIDENCE_SIMPLIFY',
    evaluate({ event, profile, lastDecisionAt }) {
      if (event.type !== 'quiz_answer' && event.type !== 'block_enter' && event.type !== 'code_run') {
        return null;
      }
      if (profile.confidence > 0.3) return null;
      if (isCoolingDown(lastDecisionAt, 'simplify_content', 3 * 60 * 1000)) return null;

      return {
        type: 'simplify_content',
        priority: 2,
        triggeredBy: 'LOW_CONFIDENCE_SIMPLIFY',
        context: { lessonId: event.lessonId, blockId: event.blockId },
        shouldTriggerAI: false,
        cooldownMs: 3 * 60 * 1000,
      };
    },
  },

  // REGLA 4: confidence > 0.8 + 3 correctas consecutivas → variante avanzada.
  // Doble condición evita falsos positivos: confidence alta puede venir de
  // lecciones anteriores fáciles, pero 3 consecutivas es señal actual fuerte.
  {
    id: 'HIGH_CONFIDENCE_ADVANCED',
    evaluate({ event, profile, recentEvents, lastDecisionAt }) {
      if (event.type !== 'quiz_answer') return null;
      if (event.metadata.kind !== 'quiz_answer') return null;
      if (!event.metadata.correct) return null;
      if (profile.confidence < 0.8) return null;

      const consecutive = getConsecutiveCorrect(recentEvents);
      if (consecutive < 3) return null;
      if (isCoolingDown(lastDecisionAt, 'unlock_advanced_variant', 10 * 60 * 1000)) return null;

      return {
        type: 'unlock_advanced_variant',
        priority: 2,
        triggeredBy: 'HIGH_CONFIDENCE_ADVANCED',
        context: { lessonId: event.lessonId, blockId: event.blockId },
        shouldTriggerAI: false,
        cooldownMs: 10 * 60 * 1000,
      };
    },
  },

  // REGLA 5: avgTimePerBlock < 30s + confidence alta → aumentar densidad de UI.
  // El usuario vuela por los bloques Y lo hace bien: mostrar más info de una vez.
  // 30s es estimado de lectura mínima para una explicación de código.
  {
    id: 'FAST_LEARNER_INCREASE_DENSITY',
    evaluate({ event, profile, lastDecisionAt }) {
      if (event.type !== 'block_exit') return null;
      if (profile.avgTimePerBlock >= 30_000) return null;
      if (profile.confidence < 0.7) return null;
      if (isCoolingDown(lastDecisionAt, 'increase_density', 5 * 60 * 1000)) return null;

      return {
        type: 'increase_density',
        priority: 3,
        triggeredBy: 'FAST_LEARNER_INCREASE_DENSITY',
        context: { lessonId: event.lessonId, blockId: event.blockId },
        shouldTriggerAI: false,
        cooldownMs: 5 * 60 * 1000,
      };
    },
  },

  // REGLA 6: avgTimePerBlock > 3 min + confidence baja → reducir densidad.
  // Mucho tiempo + muchos errores = la UI está sobrecargando cognitivamente.
  // No aplicar si ya está en modo 'struggling' (ya simplificado por regla 3).
  {
    id: 'SLOW_LEARNER_REDUCE_DENSITY',
    evaluate({ event, profile, lastDecisionAt }) {
      if (event.type !== 'block_exit') return null;
      if (profile.avgTimePerBlock < 3 * 60_000) return null;
      if (profile.confidence > 0.4) return null;
      if (profile.state === 'struggling') return null;
      if (isCoolingDown(lastDecisionAt, 'reduce_density', 5 * 60 * 1000)) return null;

      return {
        type: 'reduce_density',
        priority: 2,
        triggeredBy: 'SLOW_LEARNER_REDUCE_DENSITY',
        context: { lessonId: event.lessonId, blockId: event.blockId },
        shouldTriggerAI: false,
        cooldownMs: 5 * 60 * 1000,
      };
    },
  },

  // REGLA 7: 5+ errores totales en la sesión → avisar antes de avanzar.
  // No bloqueamos el avance, pero mostramos una señal de alerta visible.
  // El usuario elige si quiere revisar o continuar.
  {
    id: 'ACCUMULATED_ERRORS_SLOW_DOWN',
    evaluate({ event, profile, lastDecisionAt }) {
      if (event.type !== 'block_exit') return null;
      if (profile.totalMistakes < 5) return null;
      if (isCoolingDown(lastDecisionAt, 'slow_down_progression', 5 * 60 * 1000)) return null;

      return {
        type: 'slow_down_progression',
        priority: 2,
        triggeredBy: 'ACCUMULATED_ERRORS_SLOW_DOWN',
        context: { lessonId: event.lessonId, blockId: event.blockId },
        shouldTriggerAI: false,
        cooldownMs: 5 * 60 * 1000,
      };
    },
  },

  // REGLA 8: Racha positiva tras periodo de struggling → refuerzo motivacional.
  // state === 'struggling' + 2 correctas consecutivas = el usuario se está recuperando.
  // Este momento es crítico para retención: reforzar exactamente cuando ocurre el logro.
  {
    id: 'RECOVERY_ENCOURAGEMENT',
    evaluate({ event, profile, recentEvents, lastDecisionAt }) {
      if (event.type !== 'quiz_answer') return null;
      if (event.metadata.kind !== 'quiz_answer') return null;
      if (!event.metadata.correct) return null;
      if (profile.state !== 'struggling') return null;

      const consecutive = getConsecutiveCorrect(recentEvents);
      if (consecutive < 2) return null;
      if (isCoolingDown(lastDecisionAt, 'add_progress_encouragement', 10 * 60 * 1000)) return null;

      return {
        type: 'add_progress_encouragement',
        priority: 3,
        triggeredBy: 'RECOVERY_ENCOURAGEMENT',
        context: { lessonId: event.lessonId, blockId: event.blockId },
        shouldTriggerAI: false,
        cooldownMs: 10 * 60 * 1000,
      };
    },
  },
];
