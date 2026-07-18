import { describe, it, expect } from 'vitest';
import { ADAPTATION_RULES } from '../../engine/adaptation-rules';
import { recalculateConfidence, classifyLearnerState } from '../../engine/behavior-classifier';
import type { BehaviorEvent, UserProfile } from '../../types/domain';

// ─── Factories ────────────────────────────────────────────────────────────────

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'test-user',
    state: 'normal',
    confidence: 0.5,
    currentLessonId: 'lesson-1',
    currentBlockIndex: 0,
    sessionHistory: [],
    totalMistakes: 0,
    avgTimePerBlock: 60_000,
    ...overrides,
  };
}

function makeQuizAnswer(opts: {
  correct: boolean;
  attemptNumber: number;
  questionId?: string;
  selectedOption?: string;
  lessonId?: string;
}): BehaviorEvent {
  return {
    type: 'quiz_answer',
    timestamp: Date.now(),
    lessonId: opts.lessonId ?? 'lesson-1',
    blockId: 'lesson-1-quiz',
    metadata: {
      kind: 'quiz_answer',
      questionId: opts.questionId ?? 'q1',
      correct: opts.correct,
      attemptNumber: opts.attemptNumber,
      selectedOption: opts.selectedOption ?? 'option-B',
    },
  };
}

function makeBlockEvent(type: 'block_enter' | 'block_exit'): BehaviorEvent {
  return {
    type,
    timestamp: Date.now(),
    lessonId: 'lesson-1',
    blockId: 'lesson-1-explanation',
    metadata: { kind: 'generic' },
  };
}

function makeCodeRunEvent(success: boolean, errorType?: string): BehaviorEvent {
  return {
    type: 'code_run',
    timestamp: Date.now(),
    lessonId: 'lesson-1',
    blockId: 'lesson-1-code',
    metadata: { kind: 'code_run', success, errorType },
  };
}

function makeIdleEvent(idleDurationMs: number, blockType: 'explanation' | 'code' | 'quiz' = 'explanation'): BehaviorEvent {
  return {
    type: 'idle_detected',
    timestamp: Date.now(),
    lessonId: 'lesson-1',
    blockId: 'lesson-1-explanation',
    metadata: { kind: 'idle_detected', idleDurationMs, blockType },
  };
}

function evaluateRule(
  ruleId: string,
  event: BehaviorEvent,
  opts: {
    profile?: Partial<UserProfile>;
    recentEvents?: BehaviorEvent[];
    lastDecisionAt?: Record<string, number>;
  } = {}
) {
  const rule = ADAPTATION_RULES.find((r) => r.id === ruleId);
  if (!rule) throw new Error(`Rule "${ruleId}" not found`);
  return rule.evaluate({
    event,
    profile: makeProfile(opts.profile),
    recentEvents: opts.recentEvents ?? [event],
    lastDecisionAt: opts.lastDecisionAt ?? {},
  });
}

// ─── REGLA 1: REPEATED_FAILURE_AI_EXPLANATION ─────────────────────────────────

describe('REPEATED_FAILURE_AI_EXPLANATION', () => {
  it('no dispara en el primer intento incorrecto', () => {
    const event = makeQuizAnswer({ correct: false, attemptNumber: 1 });
    expect(evaluateRule('REPEATED_FAILURE_AI_EXPLANATION', event)).toBeNull();
  });

  it('no dispara en el segundo intento si la historia solo tiene 1 error', () => {
    // attemptNumber = 2 pero solo hay 1 error en recentEvents
    const event = makeQuizAnswer({ correct: false, attemptNumber: 2, questionId: 'q1' });
    const recentEvents = [event]; // solo este evento, sin previo
    expect(
      evaluateRule('REPEATED_FAILURE_AI_EXPLANATION', event, { recentEvents })
    ).toBeNull();
  });

  it('dispara en el segundo intento con 2 errores en la misma pregunta', () => {
    const first = makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' });
    const second = makeQuizAnswer({ correct: false, attemptNumber: 2, questionId: 'q1' });

    const result = evaluateRule('REPEATED_FAILURE_AI_EXPLANATION', second, {
      recentEvents: [first, second],
    });

    expect(result).not.toBeNull();
    expect(result?.type).toBe('request_ai_explanation');
    expect(result?.priority).toBe(1);
    expect(result?.shouldTriggerAI).toBe(true);
    expect(result?.context.questionId).toBe('q1');
  });

  it('no dispara si el segundo intento fue correcto', () => {
    const first = makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' });
    const second = makeQuizAnswer({ correct: true, attemptNumber: 2, questionId: 'q1' });

    expect(
      evaluateRule('REPEATED_FAILURE_AI_EXPLANATION', second, {
        recentEvents: [first, second],
      })
    ).toBeNull();
  });

  it('no dispara si errores son de preguntas distintas', () => {
    const first = makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' });
    const second = makeQuizAnswer({ correct: false, attemptNumber: 2, questionId: 'q2' }); // diferente

    expect(
      evaluateRule('REPEATED_FAILURE_AI_EXPLANATION', second, {
        recentEvents: [first, second],
      })
    ).toBeNull();
  });

  it('respeta cooldown de 5 minutos', () => {
    const first = makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' });
    const second = makeQuizAnswer({ correct: false, attemptNumber: 2, questionId: 'q1' });

    const result = evaluateRule('REPEATED_FAILURE_AI_EXPLANATION', second, {
      recentEvents: [first, second],
      lastDecisionAt: {
        request_ai_explanation: Date.now() - 2 * 60 * 1000, // hace 2 min (dentro del cooldown de 5min)
      },
    });

    expect(result).toBeNull();
  });

  it('dispara si el cooldown ya expiró', () => {
    const first = makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' });
    const second = makeQuizAnswer({ correct: false, attemptNumber: 2, questionId: 'q1' });

    const result = evaluateRule('REPEATED_FAILURE_AI_EXPLANATION', second, {
      recentEvents: [first, second],
      lastDecisionAt: {
        request_ai_explanation: Date.now() - 6 * 60 * 1000, // hace 6 min (fuera del cooldown)
      },
    });

    expect(result).not.toBeNull();
    expect(result?.type).toBe('request_ai_explanation');
  });
});

// ─── REGLA 2: IDLE_TOO_LONG_HINT ──────────────────────────────────────────────

describe('IDLE_TOO_LONG_HINT', () => {
  it('no dispara con idle de 44999ms (1ms antes del umbral)', () => {
    expect(evaluateRule('IDLE_TOO_LONG_HINT', makeIdleEvent(44_999))).toBeNull();
  });

  it('dispara exactamente en 45000ms', () => {
    const result = evaluateRule('IDLE_TOO_LONG_HINT', makeIdleEvent(45_000));
    expect(result).not.toBeNull();
    expect(result?.type).toBe('show_hint');
    expect(result?.shouldTriggerAI).toBe(true);
    expect(result?.priority).toBe(1);
  });

  it('dispara con idle mayor al umbral', () => {
    expect(evaluateRule('IDLE_TOO_LONG_HINT', makeIdleEvent(90_000))).not.toBeNull();
  });

  it('pasa el blockType correcto en el contexto', () => {
    const event = makeIdleEvent(45_000, 'quiz');
    const result = evaluateRule('IDLE_TOO_LONG_HINT', event);
    expect(result?.context.blockType).toBe('quiz');
  });

  it('no dispara si hay cooldown activo de show_hint', () => {
    expect(
      evaluateRule('IDLE_TOO_LONG_HINT', makeIdleEvent(45_000), {
        lastDecisionAt: { show_hint: Date.now() - 5 * 60 * 1000 }, // 5 min < cooldown de 10 min
      })
    ).toBeNull();
  });

  it('no dispara si el evento no es idle_detected', () => {
    const blockEvent = makeBlockEvent('block_enter');
    expect(evaluateRule('IDLE_TOO_LONG_HINT', blockEvent)).toBeNull();
  });
});

// ─── REGLA 3: LOW_CONFIDENCE_SIMPLIFY ─────────────────────────────────────────

describe('LOW_CONFIDENCE_SIMPLIFY', () => {
  it('dispara cuando confidence es 0.3 en un quiz_answer', () => {
    const event = makeQuizAnswer({ correct: false, attemptNumber: 1 });
    const result = evaluateRule('LOW_CONFIDENCE_SIMPLIFY', event, {
      profile: { confidence: 0.3 },
    });
    expect(result?.type).toBe('simplify_content');
    expect(result?.shouldTriggerAI).toBe(false);
  });

  it('no dispara cuando confidence es 0.31 (justo sobre el umbral)', () => {
    const event = makeQuizAnswer({ correct: false, attemptNumber: 1 });
    expect(
      evaluateRule('LOW_CONFIDENCE_SIMPLIFY', event, { profile: { confidence: 0.31 } })
    ).toBeNull();
  });

  it('dispara en block_enter además de quiz_answer', () => {
    const event = makeBlockEvent('block_enter');
    const result = evaluateRule('LOW_CONFIDENCE_SIMPLIFY', event, {
      profile: { confidence: 0.2 },
    });
    expect(result?.type).toBe('simplify_content');
  });

  it('dispara también en code_run — fallar código repetido debe poder cambiar la variante', () => {
    const event = makeCodeRunEvent(false, 'TypeError');
    const result = evaluateRule('LOW_CONFIDENCE_SIMPLIFY', event, {
      profile: { confidence: 0.2 },
    });
    expect(result?.type).toBe('simplify_content');
  });

  it('no dispara en block_exit (evento no relevante)', () => {
    const event = makeBlockEvent('block_exit');
    expect(
      evaluateRule('LOW_CONFIDENCE_SIMPLIFY', event, { profile: { confidence: 0.1 } })
    ).toBeNull();
  });
});

// ─── REGLA 4: HIGH_CONFIDENCE_ADVANCED ────────────────────────────────────────

describe('HIGH_CONFIDENCE_ADVANCED', () => {
  function makeConsecutiveCorrect(count: number): BehaviorEvent[] {
    return Array.from({ length: count }, (_, i) =>
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: `q${i + 1}` })
    );
  }

  it('desbloquea variante avanzada con confidence > 0.8 y 3 consecutivas', () => {
    const events = makeConsecutiveCorrect(3);
    const result = evaluateRule('HIGH_CONFIDENCE_ADVANCED', events[2], {
      profile: { confidence: 0.85 },
      recentEvents: events,
    });
    expect(result?.type).toBe('unlock_advanced_variant');
    expect(result?.shouldTriggerAI).toBe(false);
    expect(result?.priority).toBe(2);
  });

  it('no desbloquea con solo 2 correctas consecutivas', () => {
    const events = makeConsecutiveCorrect(2);
    expect(
      evaluateRule('HIGH_CONFIDENCE_ADVANCED', events[1], {
        profile: { confidence: 0.85 },
        recentEvents: events,
      })
    ).toBeNull();
  });

  it('no desbloquea si confidence es 0.79 (bajo el umbral)', () => {
    const events = makeConsecutiveCorrect(3);
    expect(
      evaluateRule('HIGH_CONFIDENCE_ADVANCED', events[2], {
        profile: { confidence: 0.79 },
        recentEvents: events,
      })
    ).toBeNull();
  });

  it('no desbloquea si la última respuesta fue incorrecta (rompe la racha)', () => {
    const events = [
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: 'q1' }),
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: 'q2' }),
      makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q3' }), // rompe racha
    ];
    expect(
      evaluateRule('HIGH_CONFIDENCE_ADVANCED', events[2], {
        profile: { confidence: 0.85 },
        recentEvents: events,
      })
    ).toBeNull();
  });

  it('no desbloquea si el evento actual es incorrecto aunque haya racha previa', () => {
    const events = makeConsecutiveCorrect(3);
    const wrongEvent = makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q4' });
    expect(
      evaluateRule('HIGH_CONFIDENCE_ADVANCED', wrongEvent, {
        profile: { confidence: 0.9 },
        recentEvents: [...events, wrongEvent],
      })
    ).toBeNull();
  });
});

// ─── REGLA 5: FAST_LEARNER_INCREASE_DENSITY ───────────────────────────────────

describe('FAST_LEARNER_INCREASE_DENSITY', () => {
  it('aumenta densidad con avgTimePerBlock < 30s y confidence > 0.7', () => {
    const event = makeBlockEvent('block_exit');
    const result = evaluateRule('FAST_LEARNER_INCREASE_DENSITY', event, {
      profile: { avgTimePerBlock: 20_000, confidence: 0.8 },
    });
    expect(result?.type).toBe('increase_density');
  });

  it('no actúa en block_enter (solo en block_exit)', () => {
    const event = makeBlockEvent('block_enter');
    expect(
      evaluateRule('FAST_LEARNER_INCREASE_DENSITY', event, {
        profile: { avgTimePerBlock: 10_000, confidence: 0.9 },
      })
    ).toBeNull();
  });

  it('no actúa si avgTimePerBlock >= 30s', () => {
    const event = makeBlockEvent('block_exit');
    expect(
      evaluateRule('FAST_LEARNER_INCREASE_DENSITY', event, {
        profile: { avgTimePerBlock: 30_000, confidence: 0.9 },
      })
    ).toBeNull();
  });

  it('no actúa si confidence es baja aunque sea rápido', () => {
    const event = makeBlockEvent('block_exit');
    expect(
      evaluateRule('FAST_LEARNER_INCREASE_DENSITY', event, {
        profile: { avgTimePerBlock: 10_000, confidence: 0.6 },
      })
    ).toBeNull();
  });
});

// ─── REGLA 6: SLOW_LEARNER_REDUCE_DENSITY ─────────────────────────────────────

describe('SLOW_LEARNER_REDUCE_DENSITY', () => {
  it('reduce densidad con avgTimePerBlock > 3min y confidence baja', () => {
    const event = makeBlockEvent('block_exit');
    const result = evaluateRule('SLOW_LEARNER_REDUCE_DENSITY', event, {
      profile: { avgTimePerBlock: 4 * 60_000, confidence: 0.3, state: 'normal' },
    });
    expect(result?.type).toBe('reduce_density');
  });

  it('no reduce densidad si ya está en estado struggling (ya simplificado)', () => {
    const event = makeBlockEvent('block_exit');
    expect(
      evaluateRule('SLOW_LEARNER_REDUCE_DENSITY', event, {
        profile: { avgTimePerBlock: 4 * 60_000, confidence: 0.2, state: 'struggling' },
      })
    ).toBeNull();
  });

  it('no reduce si confidence es > 0.4', () => {
    const event = makeBlockEvent('block_exit');
    expect(
      evaluateRule('SLOW_LEARNER_REDUCE_DENSITY', event, {
        profile: { avgTimePerBlock: 4 * 60_000, confidence: 0.41 },
      })
    ).toBeNull();
  });
});

// ─── REGLA 7: ACCUMULATED_ERRORS_SLOW_DOWN ────────────────────────────────────

describe('ACCUMULATED_ERRORS_SLOW_DOWN', () => {
  it('frena la progresión con 5+ errores totales', () => {
    const event = makeBlockEvent('block_exit');
    const result = evaluateRule('ACCUMULATED_ERRORS_SLOW_DOWN', event, {
      profile: { totalMistakes: 5 },
    });
    expect(result?.type).toBe('slow_down_progression');
    expect(result?.shouldTriggerAI).toBe(false);
  });

  it('no actúa con menos de 5 errores', () => {
    const event = makeBlockEvent('block_exit');
    expect(
      evaluateRule('ACCUMULATED_ERRORS_SLOW_DOWN', event, {
        profile: { totalMistakes: 4 },
      })
    ).toBeNull();
  });

  it('no actúa en eventos que no son block_exit', () => {
    const event = makeQuizAnswer({ correct: false, attemptNumber: 1 });
    expect(
      evaluateRule('ACCUMULATED_ERRORS_SLOW_DOWN', event, {
        profile: { totalMistakes: 10 },
      })
    ).toBeNull();
  });
});

// ─── REGLA 8: RECOVERY_ENCOURAGEMENT ──────────────────────────────────────────

describe('RECOVERY_ENCOURAGEMENT', () => {
  it('genera refuerzo cuando usuario struggling logra 2 correctas consecutivas', () => {
    const events = [
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: 'q1' }),
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: 'q2' }),
    ];
    const result = evaluateRule('RECOVERY_ENCOURAGEMENT', events[1], {
      profile: { state: 'struggling', confidence: 0.25 },
      recentEvents: events,
    });
    expect(result?.type).toBe('add_progress_encouragement');
    expect(result?.priority).toBe(3);
    expect(result?.shouldTriggerAI).toBe(false);
  });

  it('no genera refuerzo si el estado no es struggling', () => {
    const events = [
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: 'q1' }),
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: 'q2' }),
    ];
    expect(
      evaluateRule('RECOVERY_ENCOURAGEMENT', events[1], {
        profile: { state: 'normal', confidence: 0.6 },
        recentEvents: events,
      })
    ).toBeNull();
  });

  it('no genera refuerzo con solo 1 correcta consecutiva', () => {
    const events = [
      makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' }),
      makeQuizAnswer({ correct: true, attemptNumber: 2, questionId: 'q1' }),
    ];
    expect(
      evaluateRule('RECOVERY_ENCOURAGEMENT', events[1], {
        profile: { state: 'struggling' },
        recentEvents: events,
      })
    ).toBeNull();
  });

  it('no genera refuerzo si la respuesta actual fue incorrecta', () => {
    const events = [
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: 'q1' }),
      makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q2' }),
    ];
    expect(
      evaluateRule('RECOVERY_ENCOURAGEMENT', events[1], {
        profile: { state: 'struggling' },
        recentEvents: events,
      })
    ).toBeNull();
  });
});

// ─── Integración: prioridad y deduplicación ───────────────────────────────────

describe('Integración: múltiples reglas simultáneas', () => {
  it('las reglas de prioridad 1 tienen higher priority que las de prioridad 3', () => {
    // Este test valida el contrato de prioridad de los AdaptationDecision
    const first = makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' });
    const second = makeQuizAnswer({ correct: false, attemptNumber: 2, questionId: 'q1' });

    const ruleAI = ADAPTATION_RULES.find((r) => r.id === 'REPEATED_FAILURE_AI_EXPLANATION')!;
    const ruleRecovery = ADAPTATION_RULES.find((r) => r.id === 'RECOVERY_ENCOURAGEMENT')!;

    const aiDecision = ruleAI.evaluate({
      event: second,
      profile: makeProfile({ state: 'struggling' }),
      recentEvents: [first, second],
      lastDecisionAt: {},
    });

    const recoveryDecision = ruleRecovery.evaluate({
      event: second,
      profile: makeProfile({ state: 'struggling' }),
      recentEvents: [first, second],
      lastDecisionAt: {},
    });

    // AI explanation tiene prioridad 1, recovery tiene prioridad 3
    // aiDecision existe, recoveryDecision no (porque la respuesta fue incorrecta)
    expect(aiDecision?.priority).toBe(1);
    expect(recoveryDecision).toBeNull(); // incorrecto no genera encouragement
  });

  it('cooldownMs en la decisión coincide con la política de la regla', () => {
    const first = makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' });
    const second = makeQuizAnswer({ correct: false, attemptNumber: 2, questionId: 'q1' });

    const rule = ADAPTATION_RULES.find((r) => r.id === 'REPEATED_FAILURE_AI_EXPLANATION')!;
    const decision = rule.evaluate({
      event: second,
      profile: makeProfile(),
      recentEvents: [first, second],
      lastDecisionAt: {},
    });

    // La decisión sabe su propio cooldown — centraliza la configuración
    expect(decision?.cooldownMs).toBe(5 * 60 * 1000);
  });
});

// ─── Tests del behavior-classifier ───────────────────────────────────────────

describe('recalculateConfidence', () => {

  it('retorna 0.5 sin eventos de quiz', () => {
    expect(recalculateConfidence([])).toBe(0.5);
  });

  it('retorna ~1.0 con solo respuestas correctas', () => {
    const events: BehaviorEvent[] = Array.from({ length: 5 }, (_, i) =>
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: `q${i}` })
    );
    expect(recalculateConfidence(events)).toBeGreaterThan(0.9);
  });

  it('retorna ~0 con solo respuestas incorrectas', () => {
    const events: BehaviorEvent[] = Array.from({ length: 5 }, (_, i) =>
      makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: `q${i}` })
    );
    expect(recalculateConfidence(events)).toBeLessThan(0.1);
  });

  it('da más peso a los eventos recientes', () => {
    // 3 incorrectas, luego 3 correctas → confidence alta (recientes pesan más)
    const events: BehaviorEvent[] = [
      ...Array.from({ length: 3 }, (_, i) =>
        makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: `wrong${i}` })
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: `right${i}` })
      ),
    ];
    expect(recalculateConfidence(events)).toBeGreaterThan(0.5);
  });

  it('fallar ejercicios de código repetidamente también baja la confianza', () => {
    const events: BehaviorEvent[] = Array.from({ length: 5 }, () => makeCodeRunEvent(false));
    expect(recalculateConfidence(events)).toBeLessThan(0.1);
  });

  it('code_run exitoso sube la confianza igual que un quiz correcto', () => {
    const events: BehaviorEvent[] = Array.from({ length: 5 }, () => makeCodeRunEvent(true));
    expect(recalculateConfidence(events)).toBeGreaterThan(0.9);
  });

  it('combina quiz_answer y code_run en el mismo cálculo ponderado', () => {
    const events: BehaviorEvent[] = [
      makeCodeRunEvent(false),
      makeQuizAnswer({ correct: false, attemptNumber: 1, questionId: 'q1' }),
      makeCodeRunEvent(false),
    ];
    expect(recalculateConfidence(events)).toBeLessThan(0.2);
  });

  it('ignora eventos que no son de resultado (idle_detected, block_enter, etc.)', () => {
    const events: BehaviorEvent[] = [
      makeBlockEvent('block_enter'),
      makeIdleEvent(50_000),
      makeQuizAnswer({ correct: true, attemptNumber: 1, questionId: 'q1' }),
    ];
    // Con un solo evento relevante (correcto), la confianza debería ser alta,
    // sin que los eventos irrelevantes la distorsionen.
    expect(recalculateConfidence(events)).toBeGreaterThan(0.9);
  });
});

describe('classifyLearnerState', () => {

  it('clasifica como struggling bajo 0.35', () => {
    expect(classifyLearnerState(0.34)).toBe('struggling');
    expect(classifyLearnerState(0)).toBe('struggling');
  });

  it('clasifica como normal en el rango medio', () => {
    expect(classifyLearnerState(0.35)).toBe('normal');
    expect(classifyLearnerState(0.72)).toBe('normal');
  });

  it('clasifica como advanced sobre 0.72', () => {
    expect(classifyLearnerState(0.73)).toBe('advanced');
    expect(classifyLearnerState(1)).toBe('advanced');
  });
});
