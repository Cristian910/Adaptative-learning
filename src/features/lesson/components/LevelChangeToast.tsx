import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LearnerState } from '../../../types/domain';

interface LevelChangeToastProps {
  learnerState: LearnerState;
}

const STATE_MESSAGES: Record<LearnerState, { label: string; icon: string; color: string }> = {
  struggling: { label: 'Ajustando el ritmo para ti', icon: '🐢', color: '#f97316' },
  normal: { label: 'Volviste a un ritmo estándar', icon: '➡️', color: '#6366f1' },
  advanced: { label: 'Vas muy bien — subiendo el nivel', icon: '🚀', color: '#22c55e' },
};

// ─── LevelChangeToast ───────────────────────────────────────────────────────
// El "nivel" del alumno (struggling/normal/advanced) es el corazón del sistema
// adaptativo, pero hasta ahora cambiaba en silencio (solo se veía en un texto
// chico de la barra lateral). Este toast lo hace visible cuando cambia.

export function LevelChangeToast({ learnerState }: LevelChangeToastProps) {
  const [visible, setVisible] = useState(false);
  const previousState = useRef<LearnerState | null>(null);

  useEffect(() => {
    const prev = previousState.current;
    previousState.current = learnerState;
    // No mostrar nada en el primer render — solo ante cambios reales.
    if (prev !== null && prev !== learnerState) {
      setVisible(true);
      const timeoutId = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [learnerState]);

  const config = STATE_MESSAGES[learnerState];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="level-change-toast"
          style={{ borderColor: config.color }}
          initial={{ opacity: 0, y: -12, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -12, x: '-50%' }}
        >
          <span className="level-change-toast-icon">{config.icon}</span>
          <span>{config.label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
