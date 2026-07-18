// Traduce el id técnico de cada regla del motor (ver engine/adaptation-rules.ts)
// a una explicación en lenguaje natural. Vive separado del engine a
// propósito: el engine no debería saber nada sobre cómo se presenta en la
// UI, y este archivo es pura presentación.

export const RULE_EXPLANATIONS: Record<string, string> = {
  REPEATED_FAILURE_AI_EXPLANATION:
    'Fallaste la misma pregunta más de una vez seguida, así que se generó una explicación alternativa con IA.',
  IDLE_TOO_LONG_HINT:
    'Pasó bastante tiempo sin que interactuaras con este bloque, así que apareció una pista.',
  LOW_CONFIDENCE_SIMPLIFY:
    'Tu nivel de confianza estimado bajó del umbral, así que se simplificó el contenido de este bloque.',
  HIGH_CONFIDENCE_ADVANCED:
    'Tu nivel de confianza estimado es alto y consistente, así que se desbloqueó la variante avanzada.',
  FAST_LEARNER_INCREASE_DENSITY:
    'Estás resolviendo todo rápido y bien, así que se aumentó la densidad del contenido.',
  SLOW_LEARNER_REDUCE_DENSITY:
    'Se detectó que estás tardando más de lo esperado en varios bloques, así que se redujo la densidad del contenido.',
  ACCUMULATED_ERRORS_SLOW_DOWN:
    'Se acumularon varios errores en poco tiempo, así que se bajó el ritmo de avance.',
  RECOVERY_ENCOURAGEMENT:
    'Veníamos de una racha difícil y mejoraste, así que se mostró un mensaje de aliento.',
};

export const DECISION_TYPE_LABELS: Record<string, string> = {
  show_hint: 'Mostrar pista',
  request_ai_explanation: 'Pedir explicación con IA',
  simplify_content: 'Simplificar contenido',
  increase_density: 'Aumentar densidad',
  reduce_density: 'Reducir densidad',
  unlock_advanced_variant: 'Desbloquear variante avanzada',
  add_progress_encouragement: 'Mostrar mensaje de aliento',
  slow_down_progression: 'Bajar el ritmo de avance',
  no_change: 'Sin cambios',
};

// Nombre legible de cada regla — antes el panel de transparencia mostraba el
// identificador interno tal cual (ej. "LOW_CONFIDENCE_SIMPLIFY"), que se veía
// como información de depuración filtrada por error, no como una explicación
// pensada para el usuario.
export const RULE_LABELS: Record<string, string> = {
  REPEATED_FAILURE_AI_EXPLANATION: 'Fallo repetido en la misma pregunta',
  IDLE_TOO_LONG_HINT: 'Inactividad prolongada',
  LOW_CONFIDENCE_SIMPLIFY: 'Confianza baja',
  HIGH_CONFIDENCE_ADVANCED: 'Confianza alta sostenida',
  FAST_LEARNER_INCREASE_DENSITY: 'Ritmo rápido y preciso',
  SLOW_LEARNER_REDUCE_DENSITY: 'Ritmo lento',
  ACCUMULATED_ERRORS_SLOW_DOWN: 'Errores acumulados',
  RECOVERY_ENCOURAGEMENT: 'Recuperación tras dificultad',
};

// Nombre legible de cada tipo de bloque — mismo motivo que RULE_LABELS.
export const BLOCK_TYPE_LABELS: Record<string, string> = {
  explanation: 'Explicación',
  code: 'Código',
  quiz: 'Quiz',
};
