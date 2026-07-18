import { useMemo, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JS_LESSONS, TS_LESSONS } from '../data/curriculum';
import type { MissedItemRef, QuizQuestion, CodeExample as CodeExampleContent } from '../../../types/domain';
import { useModalA11y } from '../../../app/useModalA11y';

// CodeExample (CodeMirror incluido) se carga perezosamente aquí también —
// mismo criterio que en AdaptiveLesson.tsx: es una pantalla que no siempre
// se abre, así que no debería pesar en la carga inicial de la app.
const CodeExample = lazy(() =>
  import('./CodeExample').then((m) => ({ default: m.CodeExample }))
);

interface ReviewMissedItemsProps {
  open: boolean;
  onClose: () => void;
  missedItems: MissedItemRef[];
  onResolve: (itemId: string) => void;
}

// Busca el contenido real (la pregunta o el ejercicio) a partir de la
// referencia liviana guardada en el store. Se busca en AMBOS tracks (no solo
// el activo) porque si el usuario cambió de curso en algún momento, podría
// tener ítems pendientes de repaso del otro track — y siguen siendo válidos
// para repasar aunque no sea el track actual.
const ALL_TRACK_LESSONS = [...JS_LESSONS, ...TS_LESSONS];

function resolveContent(item: MissedItemRef): QuizQuestion | CodeExampleContent | null {
  const lesson = ALL_TRACK_LESSONS.find((l) => l.id === item.lessonId);
  const block = lesson?.blocks.find((b) => b.id === item.blockId);
  if (!block) return null;
  const variant = block.variants[item.variant];
  if (item.kind === 'quiz') {
    return (variant as QuizQuestion[]).find((q) => q.id === item.itemId) ?? null;
  }
  return variant as CodeExampleContent;
}

// ─── Mini quiz card para repaso ────────────────────────────────────────────────
// Deliberadamente más simple que QuestionCard (el de la lección real): aquí no
// hay escalamiento por intentos ni variantes más fáciles — es solo "practica
// de nuevo esta pregunta puntual hasta acertarla".
function ReviewQuizCard({ question, onSolved }: { question: QuizQuestion; onSolved: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const handleSelect = (idx: number) => {
    if (solved) return;
    setSelected(idx);
    if (idx === question.correctIndex) {
      setSolved(true);
      onSolved();
    }
  };

  return (
    <div className="review-quiz-card">
      <p className="question-text">{question.question}</p>
      <div className="question-options">
        {question.options.map((option, idx) => {
          let cls = 'option-btn';
          if (solved && idx === question.correctIndex) cls += ' option-btn--correct';
          else if (selected === idx && !solved) cls += ' option-btn--incorrect';
          else if (solved) cls += ' option-btn--disabled';
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={solved}>
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && !solved && (
        <p className="feedback-mistake-hint">
          {question.commonMistakes[selected] ?? 'No es correcta — prueba con otra opción.'}
        </p>
      )}
      {solved && <p className="review-solved-note">✓ +15 puntos — {question.explanation}</p>}
    </div>
  );
}

export function ReviewMissedItems({ open, onClose, missedItems, onResolve }: ReviewMissedItemsProps) {
  const containerRef = useModalA11y<HTMLDivElement>(open, onClose);
  const grouped = useMemo(() => {
    const byLesson = new Map<string, { title: string; items: MissedItemRef[] }>();
    for (const item of missedItems) {
      const existing = byLesson.get(item.lessonId);
      if (existing) existing.items.push(item);
      else byLesson.set(item.lessonId, { title: item.lessonTitle, items: [item] });
    }
    return Array.from(byLesson.values());
  }, [missedItems]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={containerRef}
            className="dashboard-card review-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badges-panel-header">
              <h2 id="review-title" className="welcome-modal-title">Repasar lo que te costó</h2>
              <button onClick={onClose} className="badges-panel-close" aria-label="Cerrar">
                ✕
              </button>
            </div>

            {grouped.length === 0 ? (
              <p className="welcome-modal-text" style={{ textAlign: 'center', padding: '24px 0' }}>
                🎉 No te queda nada pendiente de repasar — resolviste todo lo que habías fallado.
              </p>
            ) : (
              <>
                <p className="welcome-modal-text">
                  Estas son las preguntas y ejercicios que fallaste en algún momento del curso.
                  Resolvelos de nuevo para sumar <strong>+15 puntos</strong> cada uno.
                </p>
                <div className="review-groups">
                  {grouped.map((group) => (
                    <div key={group.title} className="review-group">
                      <h3 className="badges-section-title">{group.title}</h3>
                      <div className="review-items">
                        {group.items.map((item) => {
                          const content = resolveContent(item);
                          if (!content) return null;
                          if (item.kind === 'quiz') {
                            return (
                              <ReviewQuizCard
                                key={item.itemId}
                                question={content as QuizQuestion}
                                onSolved={() => onResolve(item.itemId)}
                              />
                            );
                          }
                          return (
                            <div key={item.itemId} className="review-code-item">
                              <Suspense
                                fallback={
                                  <div
                                    className="code-example-skeleton"
                                    aria-label="Cargando editor de código…"
                                  />
                                }
                              >
                                <CodeExample
                                  example={content as CodeExampleContent}
                                  onRun={(success) => {
                                    if (success) onResolve(item.itemId);
                                  }}
                                  onInteract={() => {}}
                                />
                              </Suspense>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
