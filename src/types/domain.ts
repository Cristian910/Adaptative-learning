// ─── Learner State ────────────────────────────────────────────────────────────

export type LearnerState = 'struggling' | 'normal' | 'advanced';
export type ContentVariant = 'base' | 'simplified' | 'advanced';

// ─── Session History ──────────────────────────────────────────────────────────

export interface QuizAttemptRecord {
  questionId: string;
  attemptNumber: number; // 1-indexed
  answeredAt: number; // epoch ms
  correct: boolean;
  timeSpentMs: number;
}

export interface SessionRecord {
  lessonId: string;
  startedAt: number;
  completedAt?: number;
  quizAttempts: QuizAttemptRecord[];
  hintsReceived: number;
  aiExplanationsReceived: number;
}

// ─── UserProfile ──────────────────────────────────────────────────────────────
// confidence es [0,1] calculado por el motor, no declarado por el usuario.
// state es la interpretación cualitativa de confidence + velocidad de progreso.
// Derivados (totalMistakes, avgTimePerBlock) se precalculan para evitar
// recomputation en cada render.

export interface UserProfile {
  id: string;
  state: LearnerState;
  confidence: number; // [0, 1]
  currentLessonId: string;
  currentBlockIndex: number;
  sessionHistory: SessionRecord[];
  totalMistakes: number;
  avgTimePerBlock: number; // ms
}

// ─── BehaviorEvent ────────────────────────────────────────────────────────────
// Union discriminada por kind: fuerza exhaustividad en switch statements del motor.
// No capturamos movimiento de mouse — demasiado ruido, mínimo valor adaptativo.

export type BehaviorEventType =
  | 'block_enter'
  | 'block_exit'
  | 'quiz_answer'
  | 'quiz_retry'
  | 'code_interaction'
  | 'code_run'
  | 'hint_requested'
  | 'idle_detected'
  | 'scroll_pause'
  | 'lesson_complete';

export type BehaviorEventMetadata =
  | {
      kind: 'quiz_answer';
      questionId: string;
      correct: boolean;
      attemptNumber: number;
      selectedOption: string;
    }
  | {
      kind: 'idle_detected';
      idleDurationMs: number;
      blockType: 'explanation' | 'code' | 'quiz';
    }
  | { kind: 'code_run'; success: boolean; errorType?: string }
  | {
      kind: 'scroll_pause';
      pauseDurationMs: number;
      scrollPositionRatio: number;
    }
  | { kind: 'generic' };

export interface BehaviorEvent {
  type: BehaviorEventType;
  timestamp: number; // Date.now()
  lessonId: string;
  blockId: string;
  metadata: BehaviorEventMetadata;
}

// ─── AdaptationDecision ───────────────────────────────────────────────────────
// El motor emite decisiones semánticas, no instrucciones directas de UI.
// La UI interpreta la decisión — desacopla lógica de presentación.
// cooldownMs vive en la decisión, no en el motor: cada regla conoce su propio ritmo.

export type AdaptationType =
  | 'show_hint'
  | 'request_ai_explanation'
  | 'simplify_content'
  | 'increase_density'
  | 'reduce_density'
  | 'unlock_advanced_variant'
  | 'add_progress_encouragement'
  | 'slow_down_progression'
  | 'no_change';

export interface AdaptationContext {
  lessonId: string;
  blockId: string;
  questionId?: string;
  specificError?: string;
  idleDurationMs?: number;
  blockType?: 'explanation' | 'code' | 'quiz';
}

export interface AdaptationDecision {
  type: AdaptationType;
  priority: 1 | 2 | 3; // 1 = máxima prioridad
  triggeredBy: string; // id de la regla — útil para debug
  context: AdaptationContext;
  shouldTriggerAI: boolean;
  cooldownMs: number;
}

// ─── LessonContent ────────────────────────────────────────────────────────────

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  code: string;
  editableLines?: number[];
  expectedOutput?: string;
  hints?: string[];
  solution?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  commonMistakes: Record<number, string>;
}

export interface LessonBlock {
  id: string;
  type: 'explanation' | 'code' | 'quiz';
  variants: {
    base: string | CodeExample | QuizQuestion[];
    simplified: string | CodeExample | QuizQuestion[];
    advanced: string | CodeExample | QuizQuestion[];
  };
  estimatedMinutes: number;
}

export interface LessonContent {
  id: string;
  title: string;
  subtitle: string;
  level: CourseLevel;
  track: CourseTrack;
  blocks: LessonBlock[];
  prerequisites: string[];
}

// ─── Tracks (cursos) ────────────────────────────────────────────────────────
// El motor de adaptación, el sistema de badges y el de progreso son genéricos
// — no le "pertenecen" al curso de JavaScript. `track` es lo que permite que
// el mismo motor sirva un curso de TypeScript (u otros, en el futuro) sin
// tocar ni una línea del engine, solo agregando contenido nuevo.

export type CourseTrack = 'javascript' | 'typescript';
export type CourseLevel = 'base' | 'intermediate' | 'advanced';

// ─── Missed Items (repaso final) ───────────────────────────────────────────────
// Referencia liviana a una pregunta de quiz o ejercicio de código que el
// usuario falló alguna vez. Se guarda solo la referencia (no el contenido
// completo) — el contenido real se busca de nuevo en ALL_LESSONS al momento
// de mostrar el repaso, así que si el contenido de la lección cambia en una
// versión futura, el repaso siempre muestra la versión vigente.

export interface MissedItemRef {
  kind: 'quiz' | 'code';
  lessonId: string;
  lessonTitle: string;
  blockId: string;
  variant: ContentVariant;
  itemId: string;
  label: string; // pregunta o título del ejercicio, para la lista sin re-buscar el contenido
}

// ─── AIRequest / AIResponse ───────────────────────────────────────────────────

export type AIRequestType = 'alternative_explanation' | 'contextual_hint';

export interface AIRequest {
  type: AIRequestType;
  lessonId: string;
  blockId: string;
  userState: Pick<UserProfile, 'state' | 'confidence'>;
  questionId?: string;
  selectedOption?: string;
  specificError?: string;
  idleDurationMs?: number;
  blockType?: 'explanation' | 'code' | 'quiz';
}

export interface AIResponse {
  type: AIRequestType;
  content: string;
  generatedAt: number;
  cacheKey: string;
  isStaticFallback?: boolean;
}
