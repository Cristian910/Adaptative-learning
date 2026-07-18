import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useEffect, useCallback, useState, Suspense, lazy } from 'react';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import { useAIEnrichment } from '../hooks/useAIEnrichment';
import { useAppStore, selectShouldShowHint, selectShouldShowExplanation } from '../../../store/useAppStore';
import { LessonExplanation } from './LessonExplanation';
import { QuizBlock } from './QuizBlock';
import { HintOverlay } from './HintOverlay';
import { AIExplanation } from './AIExplanation';
import { useLanguage } from '../../../app/LanguageContext';
import type {
  LessonContent,
  ContentVariant,
  AdaptationDecision,
  QuizQuestion,
  CodeExample as CodeExampleContent,
} from '../../../types/domain';

// CodeMirror (@uiw/react-codemirror + @codemirror/lang-javascript) es, con
// diferencia, la dependencia más pesada del bundle (~500KB sin comprimir).
// Cargarla de forma perezosa la saca del chunk inicial: alguien que todavía
// no llegó a un bloque de código no paga ese peso en el primer render.
const CodeExample = lazy(() =>
  import('./CodeExample').then((m) => ({ default: m.CodeExample }))
);

// ─── Animation Variants ───────────────────────────────────────────────────────
// Framer Motion layout prop en el contenedor raíz anima cambios de altura
// automáticamente. Sin esto, el contenido debajo saltaría cuando aparece un hint.

const blockVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2 },
  },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
};

// ─── Content variant resolver ─────────────────────────────────────────────────
// La UI interpreta la decision — la lógica no vive en el componente.

function resolveContentVariant(decision: AdaptationDecision | null): ContentVariant {
  if (!decision) return 'base';
  switch (decision.type) {
    case 'simplify_content':
    case 'reduce_density':
      return 'simplified';
    case 'unlock_advanced_variant':
    case 'increase_density':
      return 'advanced';
    default:
      return 'base';
  }
}

// Explica POR QUÉ cambió el contenido/las preguntas de este bloque en particular
// (distinto del LevelChangeToast general, que avisa cuando cambia tu nivel
// general — esto es específico del bloque que estás viendo ahora mismo).
function explainVariantChange(decision: AdaptationDecision | null): string | null {
  if (!decision) return null;
  switch (decision.type) {
    case 'simplify_content':
    case 'reduce_density':
      return 'Notamos que esta parte te costó un poco, así que simplificamos el contenido.';
    case 'unlock_advanced_variant':
    case 'increase_density':
      return 'Vas muy bien — te mostramos una versión más avanzada de este contenido.';
    default:
      return null;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdaptiveLessonProps {
  lesson: LessonContent;
  currentBlockIndex: number;
  onBlockComplete: (blockIndex: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdaptiveLesson({
  lesson,
  currentBlockIndex,
  onBlockComplete,
}: AdaptiveLessonProps) {
  const { t } = useLanguage();
  const latestDecision = useAppStore((s) => s.latestDecision);
  const shouldShowHint = useAppStore(selectShouldShowHint);
  const shouldShowExplanation = useAppStore(selectShouldShowExplanation);
  const dismissOverlay = useAppStore((s) => s.dismissActiveOverlay);
  const showEncouragement = latestDecision?.type === 'add_progress_encouragement';
  const addMissedItem = useAppStore((s) => s.addMissedItem);
  const resolveMissedItem = useAppStore((s) => s.resolveMissedItem);

  const currentBlock = lesson.blocks[currentBlockIndex];
  const tracker = useBehaviorTracker(lesson.id, currentBlock?.id ?? '');
  const { aiContent, isLoadingAI, prefetchAIContent } = useAIEnrichment(latestDecision);
  const [hasRunCode, setHasRunCode] = useState(false);

  // Override manual de variante: se activa cuando alguien pide explícitamente
  // "practicar con una pregunta más fácil" en el quiz tras fallar varias
  // veces (ver QuizBlock). A diferencia de `latestDecision` (que viene del
  // motor y es efímera/automática), esto es una decisión explícita del
  // usuario — por eso, una vez activada, se mantiene fija por el resto del
  // bloque en vez de competir con la próxima señal automática del motor.
  const [manualVariantOverride, setManualVariantOverride] = useState<ContentVariant | null>(null);
  useEffect(() => {
    setManualVariantOverride(null);
  }, [currentBlockIndex]);

  const engineVariant = resolveContentVariant(latestDecision);
  const contentVariant = manualVariantOverride ?? engineVariant;
  const variantExplanation = explainVariantChange(latestDecision);
  const canRequestEasierQuiz = contentVariant !== 'simplified';

  // Emitir block_enter/exit cuando cambia el bloque
  useEffect(() => {
    tracker.trackBlockEnter();
    setHasRunCode(false);
    return () => {
      tracker.trackBlockExit();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBlockIndex]);

  // Prefetch de IA en cuanto llega una decisión que la requiere.
  // Reduce latencia percibida: la llamada ya está en vuelo cuando el usuario
  // termina de leer el feedback del quiz.
  useEffect(() => {
    if (latestDecision?.shouldTriggerAI) {
      prefetchAIContent(latestDecision);
    }
  }, [latestDecision, prefetchAIContent]);

  const addPoints = useAppStore((s) => s.addPoints);
  const registerPerfectQuiz = useAppStore((s) => s.registerPerfectQuiz);

  const handleCodeExampleRun = useCallback(
    (success: boolean, errorType?: string) => {
      tracker.trackCodeRun(success, errorType);
      if (success) {
        if (!hasRunCode) {
          setHasRunCode(true);
          addPoints(10); // resolver un ejercicio de código también suma puntos
        }
        if (currentBlock?.type === 'code') {
          const example = currentBlock.variants[contentVariant] as CodeExampleContent;
          resolveMissedItem(example.id, false);
        }
      } else if (currentBlock?.type === 'code') {
        const example = currentBlock.variants[contentVariant] as CodeExampleContent;
        addMissedItem({
          kind: 'code',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          blockId: currentBlock.id,
          variant: contentVariant,
          itemId: example.id,
          label: example.title,
        });
      }
    },
    [tracker, hasRunCode, addPoints, currentBlock, contentVariant, lesson, addMissedItem, resolveMissedItem]
  );

  const handleQuestionMissed = useCallback(
    (questionId: string) => {
      if (currentBlock?.type !== 'quiz') return;
      const questions = currentBlock.variants[contentVariant] as QuizQuestion[];
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;
      addMissedItem({
        kind: 'quiz',
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        blockId: currentBlock.id,
        variant: contentVariant,
        itemId: question.id,
        label: question.question,
      });
    },
    [currentBlock, contentVariant, lesson, addMissedItem]
  );

  const handleQuestionResolved = useCallback(
    (questionId: string) => {
      resolveMissedItem(questionId, false);
    },
    [resolveMissedItem]
  );

  const handlePerfectQuiz = useCallback(() => {
    registerPerfectQuiz();
    addPoints(15); // bonus extra por no fallar ninguna
  }, [registerPerfectQuiz, addPoints]);

  const handleQuizAnswer = useCallback(
    (questionId: string, correct: boolean, attemptNumber: number, selectedOption: string) => {
      tracker.trackQuizAnswer(questionId, correct, attemptNumber, selectedOption);
      if (correct) {
        // Primer intento vale más que acertar después de fallar — recompensa
        // saber la respuesta, no solo llegar a ella por descarte.
        addPoints(attemptNumber === 1 ? 10 : 5);
      }
    },
    [tracker, addPoints]
  );

  const handleBlockComplete = useCallback(() => {
    onBlockComplete(currentBlockIndex);
  }, [onBlockComplete, currentBlockIndex]);

  if (!currentBlock) return null;

  return (
    <motion.div
      layout
      className="adaptive-lesson-wrapper"
    >
      {/* Bloque principal: key incluye variant para animar transición entre variantes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentBlock.id}-${contentVariant}`}
          variants={blockVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
        >
          {variantExplanation && (
            <div className="variant-change-banner">
              <span className="variant-change-icon">
                {contentVariant === 'simplified' ? '🔽' : '🔼'}
              </span>
              {variantExplanation}
            </div>
          )}

          {currentBlock.type === 'explanation' && (
            <>
              <LessonExplanation
                content={currentBlock.variants[contentVariant] as string}
                onScroll={tracker.handleScroll}
                isDensityReduced={latestDecision?.type === 'reduce_density'}
              />
              <div className="block-continue-bar">
                <button onClick={handleBlockComplete} className="btn-primary btn-lg">
                  {t.continueButton}
                </button>
              </div>
            </>
          )}

          {currentBlock.type === 'code' && (
            <>
              <Suspense fallback={<div className="code-example-skeleton" aria-label="Cargando editor de código…" />}>
                <CodeExample
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  example={currentBlock.variants[contentVariant] as any}
                  onRun={handleCodeExampleRun}
                  onInteract={tracker.trackCodeInteraction}
                />
              </Suspense>
              <div className="block-continue-bar">
                <button
                  onClick={handleBlockComplete}
                  disabled={!hasRunCode}
                  className="btn-primary btn-lg"
                  title={!hasRunCode ? 'Resuelve el ejercicio (que el output coincida con el esperado) para continuar' : undefined}
                >
                  {t.continueButton}
                </button>
                {!hasRunCode && (
                  <span className="block-continue-hint">
                    Resuelve el ejercicio correctamente para continuar
                  </span>
                )}
              </div>
            </>
          )}

          {currentBlock.type === 'quiz' && (
            <QuizBlock
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={currentBlock.variants[contentVariant] as any}
              onAnswer={handleQuizAnswer}
              onComplete={handleBlockComplete}
              onPerfectQuiz={handlePerfectQuiz}
              showEncouragement={showEncouragement}
              canRequestEasier={canRequestEasierQuiz}
              onRequestEasier={() => setManualVariantOverride('simplified')}
              onQuestionMissed={handleQuestionMissed}
              onQuestionResolved={handleQuestionResolved}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Overlays de IA — aparecen DEBAJO del contenido, nunca encima.
          Principio de UX: no interrumpir al usuario en acción, solo cuando
          está parado (idle) o acaba de recibir feedback negativo (quiz fail). */}
      <AnimatePresence>
        {shouldShowHint && aiContent && !isLoadingAI && (
          <motion.div
            key="hint-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <HintOverlay
              content={aiContent.content}
              isStaticFallback={aiContent.isStaticFallback}
              onDismiss={dismissOverlay}
            />
          </motion.div>
        )}

        {shouldShowExplanation && aiContent && !isLoadingAI && (
          <motion.div
            key="ai-explanation"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <AIExplanation
              content={aiContent.content}
              isStaticFallback={aiContent.isStaticFallback}
              onDismiss={dismissOverlay}
            />
          </motion.div>
        )}

        {/* Loader discreto mientras la IA responde — no bloquea la UI */}
        {isLoadingAI && (
          <motion.div
            key="ai-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-loader"
          >
            <span className="ai-thinking-dots" aria-hidden="true" />
            Preparando explicación personalizada…
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
