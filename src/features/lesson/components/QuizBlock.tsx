import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '../../../types/domain';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { useLanguage } from '../../../app/LanguageContext';

// Válvula de escape: después de fallar la MISMA pregunta más de dos veces, se
// revela automáticamente cuál era la opción correcta — no queda como un botón
// opcional a descubrir, aparece solo. Antes la respuesta correcta nunca se
// revelaba al fallar (a propósito, para que "reintentar" no fuera solo
// memorizar cuál se puso en verde), pero eso podía dejar trabado para siempre
// a alguien que genuinamente no sabía la respuesta. Ahora, en vez de solo
// mostrar la respuesta y listo, si existe una variante más simple del bloque
// se ofrece pasar directamente a una pregunta distinta (más fácil) sobre el
// mismo concepto — la misma idea que ya tenían los ejercicios de código
// (pistas progresivas + revelar solución), pero para el quiz.
const REVEAL_AFTER_ATTEMPTS = 3;

interface QuizBlockProps {
  questions: QuizQuestion[];
  onAnswer: (questionId: string, correct: boolean, attemptNumber: number, selectedOption: string) => void;
  onComplete: () => void;
  onPerfectQuiz?: () => void;
  showEncouragement: boolean;
  // Si el bloque actual NO está ya en su variante más simple, existe un
  // "escalón más fácil" al que se puede bajar cuando alguien se traba.
  canRequestEasier: boolean;
  onRequestEasier: () => void;
  // Para el repaso final del curso: qué preguntas se fallaron alguna vez
  // (para ofrecer reintentarlas después) y cuáles se terminaron resolviendo
  // (para sacarlas de esa lista si ya se resolvieron en el momento).
  onQuestionMissed: (questionId: string) => void;
  onQuestionResolved: (questionId: string) => void;
}

// ─── Single Question ──────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: QuizQuestion;
  attemptCount: number;
  onAnswer: (selectedIndex: number) => void;
  isLocked: boolean; // true cuando ya fue respondida correctamente
  canRequestEasier: boolean;
  onRequestEasier: () => void;
}

function QuestionCard({
  question,
  attemptCount,
  onAnswer,
  isLocked,
  canRequestEasier,
  onRequestEasier,
}: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { t } = useLanguage();

  const isCorrect = selectedIndex === question.correctIndex;
  const showMistakeHint =
    showFeedback &&
    !isCorrect &&
    selectedIndex !== null &&
    question.commonMistakes[selectedIndex];

  // Se activa solo (sin que haya que pedirlo) apenas se cruza el umbral de
  // intentos fallidos — "que se le muestre el resultado", como pidió el
  // usuario, no un botón opcional que hay que saber que existe.
  const isRevealed = !isLocked && attemptCount >= REVEAL_AFTER_ATTEMPTS;

  const handleSelect = useCallback(
    (index: number) => {
      if (isLocked || isRevealed || (showFeedback && isCorrect)) return;
      setSelectedIndex(index);
      setShowFeedback(true);
      onAnswer(index);
    },
    [isLocked, isRevealed, showFeedback, isCorrect, onAnswer]
  );

  const handleRetry = useCallback(() => {
    setSelectedIndex(null);
    setShowFeedback(false);
  }, []);

  return (
    <motion.div layout className="question-card">
      {/* Número de intento si ha fallado antes */}
      {attemptCount > 0 && !isRevealed && (
        <div className="question-attempt-badge">
          Intento {attemptCount + 1}
        </div>
      )}

      <p className="question-text">{question.question}</p>

      <div className="question-options">
        {question.options.map((option, idx) => {
          let optionClass = 'option-btn';
          if (isRevealed) {
            // Se cruzó el umbral: se revela la correcta automáticamente y se
            // apaga el resto — ya no tiene sentido seguir intentando a
            // ciegas la misma pregunta.
            if (idx === question.correctIndex) optionClass += ' option-btn--correct-hint';
            else optionClass += ' option-btn--disabled';
          } else if (showFeedback) {
            if (isCorrect) {
              if (idx === question.correctIndex) optionClass += ' option-btn--correct';
              else optionClass += ' option-btn--disabled';
            } else {
              // Todavía no se cruzó el umbral: NUNCA revelamos cuál era la
              // correcta — si no, "reintentar" sería solo memorizar cuál
              // opción se puso en verde, sin necesidad real de entender el
              // concepto.
              if (idx === selectedIndex) optionClass += ' option-btn--incorrect';
              else optionClass += ' option-btn--disabled';
            }
          } else if (selectedIndex === idx) {
            optionClass += ' option-btn--selected';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isLocked || isRevealed || (showFeedback && isCorrect)}
              className={optionClass}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback normal (todavía no se cruzó el umbral de intentos) */}
      <AnimatePresence mode="wait">
        {showFeedback && !isRevealed && (
          <motion.div
            key={`feedback-${selectedIndex}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
            className={`question-feedback ${isCorrect ? 'question-feedback--correct' : 'question-feedback--incorrect'}`}
          >
            {isCorrect ? (
              <>
                <span className="feedback-icon">✓</span>
                <div>
                  <strong>{t.quizCorrect}</strong>{' '}
                  <span className="feedback-explanation">{question.explanation}</span>
                </div>
              </>
            ) : (
              <>
                <span className="feedback-icon">✕</span>
                <div>
                  <strong>{t.quizIncorrect}</strong>
                  {showMistakeHint && (
                    <p className="feedback-mistake-hint">
                      {question.commonMistakes[selectedIndex!]}
                    </p>
                  )}
                  <button onClick={handleRetry} className="btn-retry">
                    {t.quizRetryButton}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Válvula de escape: se cruzó el umbral de intentos fallidos. Se
          muestra la respuesta correcta y la explicación completa siempre —
          así el usuario nunca se queda sin saber cómo se resolvía — y según
          si existe una variante más simple del bloque, se ofrece seguir con
          una pregunta distinta y más fácil, o (si ya está en la variante más
          simple) confirmar la correcta para poder avanzar. */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          aria-live="polite"
          className="quiz-reveal-box"
        >
          <p className="quiz-reveal-note">
            🔓 <strong>La respuesta correcta es "{question.options[question.correctIndex]}".</strong>{' '}
            {question.explanation}
          </p>
          {canRequestEasier ? (
            <button onClick={onRequestEasier} className="btn-primary btn-sm">
              Practicar con una pregunta más fácil →
            </button>
          ) : (
            <button onClick={() => handleSelect(question.correctIndex)} className="btn-primary btn-sm">
              Entendido, continuar →
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Quiz Block ───────────────────────────────────────────────────────────────

export function QuizBlock({
  questions,
  onAnswer,
  onComplete,
  onPerfectQuiz,
  showEncouragement,
  canRequestEasier,
  onRequestEasier,
  onQuestionMissed,
  onQuestionResolved,
}: QuizBlockProps) {
  const blockId = `quiz-${questions[0]?.id ?? 'block'}`;
  const { t } = useLanguage();
  const progress = useLessonProgress(blockId);

  const questionIds = questions.map((q) => q.id);
  const allDone = progress.allQuestionsAnswered(questionIds);
  const perfectReported = useRef(false);

  useEffect(() => {
    perfectReported.current = false;
  }, [blockId]);

  useEffect(() => {
    if (!allDone || perfectReported.current) return;
    const isPerfect = questionIds.every(
      (id) => progress.currentQuizState[id]?.attempts === 1
    );
    if (isPerfect) {
      perfectReported.current = true;
      onPerfectQuiz?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  const handleAnswer = useCallback(
    (question: QuizQuestion, selectedIndex: number) => {
      const correct = selectedIndex === question.correctIndex;
      const { attemptNumber } = progress.recordQuizAttempt(
        question.id,
        question.options[selectedIndex],
        correct
      );
      onAnswer(question.id, correct, attemptNumber, question.options[selectedIndex]);
      if (correct) {
        onQuestionResolved(question.id);
      } else {
        onQuestionMissed(question.id);
      }
    },
    [progress, onAnswer, onQuestionMissed, onQuestionResolved]
  );

  return (
    <motion.div layout className="quiz-block">
      <div className="quiz-header">
        <h3 className="quiz-title">{t.quizTitle}</h3>
        <div className="quiz-progress">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`quiz-progress-dot ${
                progress.currentQuizState[q.id]?.solved
                  ? 'quiz-progress-dot--done'
                  : progress.currentQuizState[q.id]?.attempts > 0
                  ? 'quiz-progress-dot--tried'
                  : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Encouragement banner */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            key="encouragement"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="encouragement-banner"
          >
            🌟 ¡Bien! Estás recuperando el ritmo.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="questions-list">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            attemptCount={progress.getAttemptCount(question.id)}
            onAnswer={(idx) => handleAnswer(question, idx)}
            isLocked={progress.currentQuizState[question.id]?.solved ?? false}
            canRequestEasier={canRequestEasier}
            onRequestEasier={onRequestEasier}
          />
        ))}
      </div>

      {/* Botón continuar */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            key="complete-btn"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="quiz-complete"
          >
            <div className="quiz-complete-message">
              {t.quizAllCorrect}
            </div>
            <button onClick={onComplete} className="btn-primary btn-lg">
              {t.continueButton}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
