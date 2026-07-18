import { useState } from 'react';
import { motion } from 'framer-motion';
import { BADGES, getRankInfo } from '../../gamification/badges';
import { Certificate } from './Certificate';
import { ReviewMissedItems } from './ReviewMissedItems';
import type { MissedItemRef } from '../../../types/domain';

interface CourseCompleteScreenProps {
  userName: string | null;
  points: number;
  streak: number;
  unlockedBadges: string[];
  totalLessons: number;
  trackLabel: string;
  missedItems: MissedItemRef[];
  onResolveMissedItem: (itemId: string) => void;
  onRestart: () => void;
}

// ─── CourseCompleteScreen ────────────────────────────────────────────────────
// Terminar el curso antes solo mostraba una línea de texto ("🏆 ¡Completaste
// todo el curso!"). Para algo que representa haber terminado el curso
// entero, esto le da al momento el peso que merece: un resumen real de lo
// que se logró, un certificado descargable, y — si quedó algo pendiente —
// la posibilidad de repasarlo y sumar puntos extra en vez de dejarlo
// simplemente sin resolver para siempre.

export function CourseCompleteScreen({
  userName,
  points,
  streak,
  unlockedBadges,
  totalLessons,
  trackLabel,
  missedItems,
  onResolveMissedItem,
  onRestart,
}: CourseCompleteScreenProps) {
  const level = getRankInfo(points);
  const earnedBadges = BADGES.filter((b) => unlockedBadges.includes(b.id));
  const [showCertificate, setShowCertificate] = useState(false);
  const [showReview, setShowReview] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="course-complete-screen"
    >
      <Certificate
        open={showCertificate}
        onClose={() => setShowCertificate(false)}
        userName={userName}
        trackLabel={trackLabel}
        totalLessons={totalLessons}
        points={points}
        completedAt={new Date()}
      />
      <ReviewMissedItems
        open={showReview}
        onClose={() => setShowReview(false)}
        missedItems={missedItems}
        onResolve={onResolveMissedItem}
      />

      <div className="course-complete-confetti" aria-hidden="true">
        {['🎉', '⭐', '🎊', '✨', '🏆', '🎉'].map((emoji, i) => (
          <span key={i} className={`confetti-piece confetti-piece--${i}`}>
            {emoji}
          </span>
        ))}
      </div>

      <div className="course-complete-content">
        <div className="course-complete-trophy">🏆</div>
        <h1 className="course-complete-title">
          {userName ? `¡Felicitaciones, ${userName}!` : '¡Felicitaciones!'}
        </h1>
        <p className="course-complete-subtitle">
          Completaste las {totalLessons} lecciones del curso de {trackLabel}.
        </p>

        <div className="course-complete-stats">
          <div className="course-complete-stat">
            <span className="course-complete-stat-value">{points}</span>
            <span className="course-complete-stat-label">puntos totales</span>
          </div>
          <div className="course-complete-stat">
            <span className="course-complete-stat-value">{level.name}</span>
            <span className="course-complete-stat-label">rango alcanzado</span>
          </div>
          <div className="course-complete-stat">
            <span className="course-complete-stat-value">{streak}</span>
            <span className="course-complete-stat-label">
              día{streak === 1 ? '' : 's'} de racha
            </span>
          </div>
          <div className="course-complete-stat">
            <span className="course-complete-stat-value">{earnedBadges.length}</span>
            <span className="course-complete-stat-label">logros</span>
          </div>
        </div>

        {earnedBadges.length > 0 && (
          <div className="course-complete-badges">
            {earnedBadges.map((b) => (
              <span key={b.id} className="course-complete-badge-chip" title={b.description}>
                {b.icon} {b.title}
              </span>
            ))}
          </div>
        )}

        <div className="course-complete-actions">
          <button onClick={() => setShowCertificate(true)} className="btn-primary btn-lg">
            🎓 Ver mi certificado
          </button>
          {missedItems.length > 0 && (
            <button onClick={() => setShowReview(true)} className="btn-primary btn-lg btn-review-pending">
              📝 Repasar lo que te costó ({missedItems.length})
            </button>
          )}
        </div>

        <p className="course-complete-note">
          Tu progreso queda guardado. Puedes repasar cualquier lección desde la
          barra lateral cuando quieras, o reiniciar todo si quieres empezar de cero.
        </p>

        <button onClick={onRestart} className="btn-ghost btn-sm">
          ↺ Reiniciar progreso
        </button>
      </div>
    </motion.div>
  );
}
