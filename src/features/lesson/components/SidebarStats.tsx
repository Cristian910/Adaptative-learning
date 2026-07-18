import { getRankInfo } from '../../gamification/badges';
import { useLanguage } from '../../../app/LanguageContext';

interface SidebarStatsProps {
  userName: string | null;
  points: number;
  streak: number;
  completedCount: number;
  totalLessons: number;
  unlockedBadgesCount: number;
  onOpenBadges: () => void;
  onOpenDashboard: () => void;
  onOpenPlayground: () => void;
}

// ─── SidebarStats ────────────────────────────────────────────────────────────
// Antes el progreso general del curso solo se veía como "X/Y lecciones" en un
// texto chico al pie de la barra lateral, y los puntos/racha eran números
// sueltos sin propósito. Ahora los puntos se traducen en un NIVEL con progreso
// visible hacia el siguiente, y hay un acceso directo a la colección de logros
// y al dashboard de analíticas (confianza, errores, progreso por nivel, etc.).

export function SidebarStats({
  userName,
  points,
  streak,
  completedCount,
  totalLessons,
  unlockedBadgesCount,
  onOpenBadges,
  onOpenDashboard,
  onOpenPlayground,
}: SidebarStatsProps) {
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const level = getRankInfo(points);
  const { t } = useLanguage();

  return (
    <div className="sidebar-stats">
      {userName && <p className="sidebar-greeting">{t.sidebarGreeting(userName)}</p>}

      <div className="sidebar-progress-bar-track">
        <div className="sidebar-progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="sidebar-progress-label">
        {t.sidebarProgressLabel(percent, completedCount, totalLessons)}
      </p>

      <button className="sidebar-level-button" onClick={onOpenBadges}>
        <div className="sidebar-level-info">
          <span className="sidebar-level-name">{level.name}</span>
          <span className="sidebar-level-sub">
            {level.next ? `${level.pointsToNext} pts para subir de rango` : 'Rango máximo'}
          </span>
        </div>
        <div className="sidebar-stats-row">
          <div className="sidebar-stat-chip" title="Puntos acumulados">
            <span>⭐</span>
            <span>{points}</span>
          </div>
          <div className="sidebar-stat-chip" title="Días consecutivos con actividad">
            <span>🔥</span>
            <span>{streak}</span>
          </div>
          <div className="sidebar-stat-chip" title="Logros desbloqueados">
            <span>🏅</span>
            <span>{unlockedBadgesCount}</span>
          </div>
        </div>
      </button>

      <button className="sidebar-dashboard-button" onClick={onOpenDashboard}>
        {t.sidebarDashboardButton}
      </button>
      <button className="sidebar-dashboard-button" onClick={onOpenPlayground}>
        {t.sidebarPlaygroundButton}
      </button>
    </div>
  );
}
