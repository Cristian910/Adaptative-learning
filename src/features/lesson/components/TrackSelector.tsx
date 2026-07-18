import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CourseTrack, CourseLevel } from '../../../types/domain';
import { LEVEL_LABELS } from '../utils/labels';
import { useModalA11y } from '../../../app/useModalA11y';

interface TrackSelectorProps {
  open: boolean;
  onSelect: (track: CourseTrack, level: CourseLevel) => void;
}

const TRACKS: { id: CourseTrack; icon: string; title: string; description: string }[] = [
  {
    id: 'javascript',
    icon: '🟨',
    title: 'JavaScript',
    description: 'El lenguaje desde cero: variables, funciones, closures, async/await, clases y más. 10 lecciones.',
  },
  {
    id: 'typescript',
    icon: '🔷',
    title: 'TypeScript',
    description: 'Para quien ya sabe JS: el sistema de tipos, interfaces, generics y buenas prácticas. 5 lecciones.',
  },
];

const LEVELS: { id: CourseLevel; icon: string }[] = [
  { id: 'base', icon: '🌱' },
  { id: 'intermediate', icon: '🌿' },
  { id: 'advanced', icon: '🌳' },
];

// ─── TrackSelector ────────────────────────────────────────────────────────────
// Se muestra una sola vez, inmediatamente después del WelcomeModal, para que
// el motor de adaptación sepa desde el arranque qué currículum servir (ver
// curriculum.ts: getLessonsForTrack) y desde qué punto de la secuencia
// empezar. Elegir "avanzado" no obliga a rehacer las lecciones anteriores —
// selectTrack() en el store las deja desbloqueadas para consulta libre (ver
// LessonNav, que compara el nivel de cada lección contra startingLevel).

export function TrackSelector({ open, onSelect }: TrackSelectorProps) {
  const [step, setStep] = useState<'track' | 'level'>('track');
  const [chosenTrack, setChosenTrack] = useState<CourseTrack | null>(null);
  const noop = useCallback(() => {}, []);
  const containerRef = useModalA11y<HTMLDivElement>(open, noop);

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
            className="welcome-modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="Elegir curso y nivel"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <AnimatePresence mode="wait">
              {step === 'track' ? (
                <motion.div
                  key="track"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="track-selector-step"
                >
                  <div className="welcome-modal-icon">🎯</div>
                  <h2 className="welcome-modal-title">¿Qué quieres estudiar?</h2>
                  <p className="welcome-modal-text">
                    Puedes cambiar de curso más adelante desde la barra lateral.
                  </p>
                  <div className="track-selector-options">
                    {TRACKS.map((t) => (
                      <button
                        key={t.id}
                        className="track-selector-card"
                        onClick={() => {
                          setChosenTrack(t.id);
                          setStep('level');
                        }}
                      >
                        <span className="track-selector-card-icon">{t.icon}</span>
                        <span className="track-selector-card-title">{t.title}</span>
                        <span className="track-selector-card-desc">{t.description}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="level"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="track-selector-step"
                >
                  <div className="welcome-modal-icon">
                    {TRACKS.find((t) => t.id === chosenTrack)?.icon}
                  </div>
                  <h2 className="welcome-modal-title">¿Desde qué nivel arrancamos?</h2>
                  <p className="welcome-modal-text">
                    Si ya sabes lo básico, elige un nivel más alto — las lecciones
                    anteriores quedan igual disponibles para consulta libre, aunque
                    no las hayas completado.
                  </p>
                  <div className="track-selector-options track-selector-options--levels">
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl.id}
                        className="track-selector-card track-selector-card--level"
                        onClick={() => chosenTrack && onSelect(chosenTrack, lvl.id)}
                      >
                        <span className="track-selector-card-icon">{lvl.icon}</span>
                        <span className="track-selector-card-title">{LEVEL_LABELS[lvl.id]}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="track-selector-back"
                    onClick={() => setStep('track')}
                  >
                    ← Elegir otro curso
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
