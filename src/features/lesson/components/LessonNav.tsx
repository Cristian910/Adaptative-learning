import { motion } from 'framer-motion';
import type { LessonContent, CourseLevel } from '../../../types/domain';
import { LEVEL_LABELS, LEVEL_ORDER, STATE_CONFIG } from '../utils/labels';
import { useLanguage } from '../../../app/LanguageContext';

interface LessonNavProps {
  lessons: LessonContent[];
  currentLessonId: string;
  currentBlockIndex: number;
  completedLessons: Set<string>;
  onSelectLesson: (lessonId: string) => void;
  onResetProgress: () => void;
  confidence: number;
  learnerState: 'struggling' | 'normal' | 'advanced';
  startingLevel: CourseLevel;
}

export function LessonNav({
  lessons,
  currentLessonId,
  currentBlockIndex,
  completedLessons,
  onSelectLesson,
  onResetProgress,
  confidence,
  learnerState,
  startingLevel,
}: LessonNavProps) {
  const stateConfig = STATE_CONFIG[learnerState];
  const { t } = useLanguage();
  const currentLesson = lessons.find((l) => l.id === currentLessonId);
  const courseLevelLabel = currentLesson ? LEVEL_LABELS[currentLesson.level] : '';
  // Si el usuario eligió arrancar desde un nivel avanzado en el
  // TrackSelector, las lecciones de nivel igual o anterior a ese quedan
  // desbloqueadas para navegación libre — no tiene sentido pedirle que
  // "complete" Principiante para acceder a Avanzado si ya dijo que lo sabe.
  const startingLevelRank = LEVEL_ORDER.indexOf(startingLevel);

  return (
    <nav className="lesson-nav">
      {/* Course-level indicator — en qué sección del curso está el usuario
          (Principiante/Intermedio/Avanzado), distinto del "estado adaptativo"
          de más abajo (que es sobre RITMO, no sobre qué tan avanzado es el
          contenido). */}
      {courseLevelLabel && (
        <div className={`course-level-badge course-level-badge--${currentLesson?.level}`}>
          📍 Estás en: <strong>{courseLevelLabel}</strong>
        </div>
      )}

      {/* Learner state indicator */}
      <div className="learner-state-card" style={{ background: stateConfig.bg }}>
        <div className="learner-state-header">
          <span className="learner-state-label" style={{ color: stateConfig.color }}>
            {stateConfig.label}
          </span>
          <span className="learner-confidence">{Math.round(confidence * 100)}%</span>
        </div>
        <div className="learner-confidence-bar">
          <motion.div
            className="learner-confidence-fill"
            style={{ backgroundColor: stateConfig.color }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Lesson list, agrupada por sección de nivel */}
      <div className="lesson-list">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.has(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          const isUnlockedByStartingLevel = LEVEL_ORDER.indexOf(lesson.level) <= startingLevelRank;
          const isLocked =
            !isCompleted &&
            !isCurrent &&
            !isUnlockedByStartingLevel &&
            lesson.prerequisites.some((p) => !completedLessons.has(p));
          const previousLevel = index > 0 ? lessons[index - 1].level : null;
          const showSectionHeader = lesson.level !== previousLevel;

          return (
            <div key={lesson.id}>
              {showSectionHeader && (
                <div className="lesson-section-header">{LEVEL_LABELS[lesson.level]}</div>
              )}
              <button
                onClick={() => !isLocked && onSelectLesson(lesson.id)}
                disabled={isLocked}
                className={`lesson-nav-item ${isCurrent ? 'lesson-nav-item--active' : ''} ${
                  isCompleted ? 'lesson-nav-item--completed' : ''
                } ${isLocked ? 'lesson-nav-item--locked' : ''}`}
              >
                <div className="lesson-nav-number">
                  {isCompleted ? (
                    <span className="lesson-check">✓</span>
                  ) : isLocked ? (
                    <span className="lesson-lock">🔒</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="lesson-nav-info">
                  <span className="lesson-nav-title">{lesson.title}</span>
                  <span className="lesson-nav-level">{LEVEL_LABELS[lesson.level]}</span>
                  {isCurrent && !isCompleted && (
                    <div className="lesson-nav-inline-progress-track">
                      <div
                        className="lesson-nav-inline-progress-fill"
                        style={{
                          width: `${Math.round(
                            (currentBlockIndex / lesson.blocks.length) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                {isCurrent && (
                  <motion.div
                    layoutId="active-lesson-indicator"
                    className="lesson-active-dot"
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Progress footer */}
      <div className="nav-footer">
        <span className="nav-footer-text">
          {t.navFooterCompleted(completedLessons.size, lessons.length)}
        </span>
        <button
          onClick={() => {
            if (window.confirm('¿Reiniciar todo tu progreso? Esto no se puede deshacer.')) {
              onResetProgress();
            }
          }}
          className="nav-footer-reset"
          title={t.navResetButton}
        >
          {t.navResetButton}
        </button>
      </div>
    </nav>
  );
}
