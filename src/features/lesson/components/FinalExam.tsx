import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LessonContent, QuizQuestion } from '../../../types/domain';
import { useModalA11y } from '../../../app/useModalA11y';

interface FinalExamProps {
  open: boolean;
  onClose: () => void;
  lessons: LessonContent[];
  onPass: () => void;
}

const PASS_THRESHOLD = 0.7; // 70% correcto para aprobar

// ─── FinalExam ────────────────────────────────────────────────────────────────
// Reutiliza la variante "base" de la primera pregunta de cada lección del
// curso activo — no genera contenido nuevo, arma el examen a partir de lo
// que las lecciones ya tienen. Aprobar marca TODAS las lecciones del track
// como completadas (incluidas las que nunca se cursaron), habilitando el
// certificado sin obligar a rehacer contenido que la persona ya demostró
// saber.

function pickExamQuestions(lessons: LessonContent[]): { lessonTitle: string; question: QuizQuestion }[] {
  const questions: { lessonTitle: string; question: QuizQuestion }[] = [];
  for (const lesson of lessons) {
    const quizBlock = lesson.blocks.find((b) => b.type === 'quiz');
    if (!quizBlock) continue;
    const baseQuestions = quizBlock.variants.base as unknown as QuizQuestion[];
    if (baseQuestions?.[0]) {
      questions.push({ lessonTitle: lesson.title, question: baseQuestions[0] });
    }
  }
  return questions;
}

export function FinalExam({ open, onClose, lessons, onPass }: FinalExamProps) {
  const containerRef = useModalA11y<HTMLDivElement>(open, onClose);
  const questions = useMemo(() => pickExamQuestions(lessons), [lessons]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => answers[q.question.id] !== undefined);
  const correctCount = questions.filter((q) => answers[q.question.id] === q.question.correctIndex).length;
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = submitted && correctCount / questions.length >= PASS_THRESHOLD;

  const handleSubmit = () => {
    setSubmitted(true);
    if (correctCount / questions.length >= PASS_THRESHOLD) {
      onPass();
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={containerRef}
            className="dashboard-card review-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="final-exam-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="badges-panel-header">
              <h2 id="final-exam-title" className="welcome-modal-title">🎯 Examen final</h2>
              {!passed && (
                <button onClick={onClose} className="badges-panel-close" aria-label="Cerrar">
                  ✕
                </button>
              )}
            </div>

            {passed ? (
              <div className="exam-result exam-result--pass">
                <div className="exam-result-icon">🎉</div>
                <p className="exam-result-title">
                  Aprobaste con {scorePercent}% de respuestas correctas.
                </p>
                <p className="welcome-modal-text">
                  Todas las lecciones del curso quedaron marcadas como completadas — tu
                  certificado ya está disponible.
                </p>
                <button onClick={onClose} className="btn-primary btn-lg">
                  Ver mis resultados →
                </button>
              </div>
            ) : (
              <>
                <p className="welcome-modal-text">
                  Una pregunta representativa de cada lección del curso. Necesitas al
                  menos {Math.round(PASS_THRESHOLD * 100)}% de respuestas correctas para
                  aprobar y desbloquear el certificado sin tener que completar cada
                  lección una por una.
                </p>

                {submitted && !passed && (
                  <div className="exam-result exam-result--fail">
                    <p className="exam-result-title">
                      Obtuviste {scorePercent}% ({correctCount}/{questions.length}) — necesitas{' '}
                      {Math.round(PASS_THRESHOLD * 100)}% para aprobar.
                    </p>
                    <p className="welcome-modal-text welcome-modal-text--muted">
                      Repasa las lecciones relacionadas con lo que fallaste y vuelve a
                      intentarlo cuando quieras.
                    </p>
                    <button onClick={handleRetry} className="btn-primary btn-sm">
                      Reintentar examen
                    </button>
                  </div>
                )}

                <div className="review-groups">
                  {questions.map(({ lessonTitle, question }, idx) => {
                    const selected = answers[question.id];
                    const isCorrect = submitted && selected === question.correctIndex;
                    const isWrong = submitted && selected !== undefined && selected !== question.correctIndex;
                    return (
                      <div key={question.id} className="review-quiz-card">
                        <p className="exam-question-lesson">
                          Lección {idx + 1}: {lessonTitle}
                        </p>
                        <p className="question-text">{question.question}</p>
                        <div className="question-options">
                          {question.options.map((option, optIdx) => {
                            let cls = 'option-btn';
                            if (submitted) {
                              if (optIdx === question.correctIndex) cls += ' option-btn--correct';
                              else if (optIdx === selected) cls += ' option-btn--incorrect';
                              else cls += ' option-btn--disabled';
                            } else if (selected === optIdx) {
                              cls += ' option-btn--selected';
                            }
                            return (
                              <button
                                key={optIdx}
                                className={cls}
                                disabled={submitted}
                                onClick={() =>
                                  setAnswers((prev) => ({ ...prev, [question.id]: optIdx }))
                                }
                              >
                                <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                                <span className="option-text">{option}</span>
                              </button>
                            );
                          })}
                        </div>
                        {isCorrect && <p className="review-solved-note">✓ Correcto</p>}
                        {isWrong && (
                          <p className="feedback-mistake-hint">
                            {question.commonMistakes[selected!] ?? question.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!submitted && (
                  <div className="playground-actions">
                    <button
                      onClick={handleSubmit}
                      disabled={!allAnswered}
                      className="btn-primary btn-lg"
                      title={!allAnswered ? 'Responde todas las preguntas para enviar' : undefined}
                    >
                      Enviar examen
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
