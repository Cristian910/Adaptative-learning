import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '../../../app/useModalA11y';
import { useLanguage } from '../../../app/LanguageContext';
import type { CourseTrack } from '../../../types/domain';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  track?: CourseTrack;
  totalLessons?: number;
}

// ─── HelpModal ───────────────────────────────────────────────────────────────
// La bienvenida solo se muestra una vez — esto es lo mismo, pero accesible en
// cualquier momento (botón "?" en la barra lateral), para que nadie tenga que
// recordar de memoria cómo funciona cada mecánica de la plataforma.

export function HelpModal({ open, onClose, track = 'javascript', totalLessons = 10 }: HelpModalProps) {
  const containerRef = useModalA11y<HTMLDivElement>(open, onClose);
  const { t } = useLanguage();
  const trackLabel = track === 'typescript' ? 'TypeScript' : 'JavaScript';

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
            className="welcome-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="welcome-modal-icon" aria-hidden="true">🧭</div>
            <h2 id="help-modal-title" className="welcome-modal-title">{t.helpTitle}</h2>

            <ul className="welcome-modal-list">
              <li>
                <strong>Adaptación automática</strong>: el contenido y las
                preguntas se ajustan solos según cómo te va — sin que tengas
                que configurar nada.
              </li>
              <li>
                <strong>Pistas con IA</strong>: si te quedas trabado o fallas
                un quiz, puede aparecer una pista o explicación alternativa
                generada por IA (o de respaldo, si no hay una key configurada).
              </li>
              <li>
                <strong>Ejercicios de código reales</strong>: corren en un
                entorno aislado (Web Worker), y necesitas que el resultado
                coincida con el esperado para avanzar — no alcanza con que
                "no tire error".
              </li>
              <li>
                <strong>Nunca quedas trabado</strong>: si fallas varias veces
                el mismo ejercicio o la misma pregunta de quiz, aparecen
                pistas progresivas (o una versión más fácil) y, como último
                recurso, la respuesta correcta.
              </li>
              <li>
                <strong>Puntos, Rango y logros</strong>: sumas puntos por cada
                quiz y ejercicio resuelto. Se traducen en un rango (Novato →
                Aprendiz → Competente → Experto → Maestro) y en logros
                concretos — míralos tocando tu rango en la barra lateral.
              </li>
              <li>
                <strong>Racha</strong>: practicar días seguidos suma — se
                reinicia si pasas un día entero sin actividad.
              </li>
              <li>
                <strong>Curso actual: {trackLabel}</strong> ({totalLessons}{' '}
                lecciones) — van de Principiante a Intermedio a Avanzado, en
                orden. Puedes cambiar de curso (JavaScript ⇄ TypeScript) desde
                la barra lateral cuando quieras.
              </li>
              <li>
                <strong>Tu progreso se guarda solo</strong>, en este navegador
                — puedes cerrar la pestaña y volver cuando quieras. El botón
                "Reiniciar progreso" en la barra lateral borra todo si quieres
                empezar de cero.
              </li>
            </ul>

            <button onClick={onClose} className="btn-primary btn-lg">
              {t.helpCloseButton}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
