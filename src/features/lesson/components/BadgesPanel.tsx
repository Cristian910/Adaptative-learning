import { motion, AnimatePresence } from 'framer-motion';
import { BADGES, getRankInfo } from '../../gamification/badges';
import { useModalA11y } from '../../../app/useModalA11y';

interface BadgesPanelProps {
  open: boolean;
  onClose: () => void;
  points: number;
  streak: number;
  unlockedBadges: string[];
}

// ─── BadgesPanel ─────────────────────────────────────────────────────────────
// Antes, puntos y racha eran solo un número en la barra lateral, sin ningún
// propósito visible. Este panel les da un lugar donde "significan algo": un
// nivel con progreso hacia el siguiente, y una colección de logros concretos
// para perseguir.

export function BadgesPanel({ open, onClose, points, streak, unlockedBadges }: BadgesPanelProps) {
  const level = getRankInfo(points);
  const containerRef = useModalA11y<HTMLDivElement>(open, onClose);

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
            className="badges-panel-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="badges-panel-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badges-panel-header">
              <h2 id="badges-panel-title" className="welcome-modal-title">Tu progreso</h2>
              <button onClick={onClose} className="badges-panel-close" aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="badges-level-card">
              <div className="badges-level-name">
                Rango: <strong>{level.name}</strong>
              </div>
              <div className="sidebar-progress-bar-track">
                <div
                  className="sidebar-progress-bar-fill"
                  style={{ width: `${level.progressToNext * 100}%` }}
                />
              </div>
              <div className="badges-level-sub">
                {level.next
                  ? `${level.pointsToNext} puntos para llegar a ${level.next.name}`
                  : '¡Rango máximo alcanzado!'}
              </div>
              <div className="sidebar-stats-row">
                <div className="sidebar-stat-chip">
                  <span>⭐</span>
                  <span>{points} pts</span>
                </div>
                <div className="sidebar-stat-chip">
                  <span>🔥</span>
                  <span>
                    {streak} día{streak === 1 ? '' : 's'} seguidos
                  </span>
                </div>
              </div>
            </div>

            <h3 className="badges-section-title">
              Logros ({unlockedBadges.length}/{BADGES.length})
            </h3>
            <div className="badges-grid">
              {BADGES.map((badge) => {
                const unlocked = unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`badge-card ${unlocked ? 'badge-card--unlocked' : 'badge-card--locked'}`}
                    title={badge.description}
                  >
                    <div className="badge-card-icon">{unlocked ? badge.icon : '🔒'}</div>
                    <div className="badge-card-title">{badge.title}</div>
                    <div className="badge-card-desc">{badge.description}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
