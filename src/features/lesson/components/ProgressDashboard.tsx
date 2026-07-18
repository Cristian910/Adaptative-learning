import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import type { LessonContent, UserProfile, LearnerState } from '../../../types/domain';
import { LEVEL_LABELS, STATE_CONFIG } from '../utils/labels';
import { useModalA11y } from '../../../app/useModalA11y';

interface ProgressDashboardProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  allLessons: LessonContent[];
  completedLessons: Set<string>;
  points: number;
  streak: number;
  codeRunsCount: number;
  perfectQuizCount: number;
  unlockedBadgesCount: number;
}

// ─── Por qué esta pantalla no existía ────────────────────────────────────────
// El motor de adaptación (behavior-classifier.ts) ya calculaba confidence,
// totalMistakes y avgTimePerBlock en tiempo real para decidir cómo adaptar el
// contenido — pero esos números nunca se le mostraban al usuario. Alguien
// podía terminar todo el curso sin ver un solo gráfico de su propio progreso.
// Este dashboard es la primera sección nueva del proyecto: le da un uso
// visible a datos que el motor ya tenía, en vez de agregar tracking nuevo.

function formatTime(ms: number): string {
  if (ms <= 0) return '—';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
}

export function ProgressDashboard({
  open,
  onClose,
  profile,
  allLessons,
  completedLessons,
  points,
  streak,
  codeRunsCount,
  perfectQuizCount,
  unlockedBadgesCount,
}: ProgressDashboardProps) {
  const confidencePercent = Math.round(profile.confidence * 100);
  const stateConfig = STATE_CONFIG[profile.state as LearnerState];
  const containerRef = useModalA11y<HTMLDivElement>(open, onClose);

  // Progreso por nivel del curso (Principiante/Intermedio/Avanzado): cuántas
  // lecciones de cada sección ya se completaron vs. cuántas faltan.
  const levelBreakdown = (['base', 'intermediate', 'advanced'] as const).map((level) => {
    const lessonsInLevel = allLessons.filter((l) => l.level === level);
    const completedInLevel = lessonsInLevel.filter((l) => completedLessons.has(l.id)).length;
    return {
      nivel: LEVEL_LABELS[level],
      Completadas: completedInLevel,
      Restantes: lessonsInLevel.length - completedInLevel,
    };
  });

  const radialData = [
    { name: 'confianza', value: confidencePercent, fill: 'var(--accent-primary)' },
  ];

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
            className="dashboard-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badges-panel-header">
              <h2 id="dashboard-title" className="welcome-modal-title">Tu dashboard</h2>
              <button onClick={onClose} className="badges-panel-close" aria-label="Cerrar">
                ✕
              </button>
            </div>

            {/* Estado + confianza */}
            <div className="dashboard-top-row">
              <div className="dashboard-gauge-wrap">
                <ResponsiveContainer width={140} height={140}>
                  <RadialBarChart
                    width={140}
                    height={140}
                    innerRadius="72%"
                    outerRadius="100%"
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar background dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="dashboard-gauge-label">
                  <strong>{confidencePercent}%</strong>
                  <span>confianza</span>
                </div>
              </div>

              <div className="dashboard-state-info">
                <span
                  className="dashboard-state-pill"
                  style={{ color: stateConfig.color, background: stateConfig.bg }}
                >
                  {stateConfig.label}
                </span>
                <p className="dashboard-state-desc">
                  Este es el ritmo que detectó el motor adaptativo según tus últimas
                  respuestas — no es una nota, es lo que usa la plataforma para decidir
                  cuánto simplificar o exigir el contenido.
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="dashboard-stat-grid">
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-value">{points}</span>
                <span className="dashboard-stat-label">⭐ Puntos</span>
              </div>
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-value">{streak}</span>
                <span className="dashboard-stat-label">🔥 Racha (días)</span>
              </div>
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-value">{unlockedBadgesCount}</span>
                <span className="dashboard-stat-label">🏅 Logros</span>
              </div>
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-value">{codeRunsCount}</span>
                <span className="dashboard-stat-label">💻 Códigos ejecutados</span>
              </div>
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-value">{perfectQuizCount}</span>
                <span className="dashboard-stat-label">💯 Quizzes perfectos</span>
              </div>
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-value">{profile.totalMistakes}</span>
                <span className="dashboard-stat-label">✕ Errores totales</span>
              </div>
              <div className="dashboard-stat-card dashboard-stat-card--wide">
                <span className="dashboard-stat-value">{formatTime(profile.avgTimePerBlock)}</span>
                <span className="dashboard-stat-label">⏱ Tiempo promedio por bloque</span>
              </div>
            </div>

            {/* Progreso por nivel del curso */}
            <h3 className="badges-section-title">Progreso por nivel</h3>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={levelBreakdown} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="nivel"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-overlay)' }}
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="Completadas" stackId="a" fill="var(--accent-success)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Restantes" stackId="a" fill="var(--border-medium)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
