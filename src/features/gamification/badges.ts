// ─── Badges ──────────────────────────────────────────────────────────────────
// Hasta ahora, puntos y racha eran solo números sin ningún propósito. Esto les
// da un objetivo concreto: hitos claros que el usuario puede desbloquear y ver.

export interface BadgeDefinition {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    icon: '🎯',
    title: 'Primer paso',
    description: 'Completaste tu primera lección.',
  },
  {
    id: 'first_perfect_quiz',
    icon: '💯',
    title: 'Precisión perfecta',
    description: 'Respondiste un quiz completo sin fallar ninguna pregunta.',
  },
  {
    id: 'streak_3',
    icon: '🔥',
    title: 'Racha de 3 días',
    description: '3 días seguidos practicando.',
  },
  {
    id: 'streak_7',
    icon: '🔥',
    title: 'Racha semanal',
    description: '7 días seguidos practicando.',
  },
  {
    id: 'points_100',
    icon: '⭐',
    title: '100 puntos',
    description: 'Alcanzaste 100 puntos.',
  },
  {
    id: 'points_300',
    icon: '🌟',
    title: '300 puntos',
    description: 'Alcanzaste 300 puntos.',
  },
  {
    id: 'code_runner',
    icon: '💻',
    title: 'Programador en acción',
    description: 'Ejecutaste código 10 veces.',
  },
  {
    id: 'comeback',
    icon: '💪',
    title: 'Superaste una dificultad',
    description: 'Volviste a un buen ritmo después de un momento difícil.',
  },
  {
    id: 'course_complete',
    icon: '🏆',
    title: 'Curso completo',
    description: 'Completaste todas las lecciones del curso.',
  },
];

export const BADGES_BY_ID: Record<string, BadgeDefinition> = Object.fromEntries(
  BADGES.map((b) => [b.id, b])
);

export interface BadgeStats {
  completedLessonsCount: number;
  totalLessons: number;
  points: number;
  streak: number;
  codeRunsCount: number;
  perfectQuizCount: number;
  hadComeback: boolean;
}

// Función pura: dado el estado actual, devuelve TODOS los IDs de badges que
// deberían estar desbloqueados (no solo los nuevos — la comparación contra lo
// ya desbloqueado se hace afuera, en el store).
export function evaluateBadges(stats: BadgeStats): string[] {
  const unlocked: string[] = [];
  if (stats.completedLessonsCount >= 1) unlocked.push('first_lesson');
  if (stats.perfectQuizCount >= 1) unlocked.push('first_perfect_quiz');
  if (stats.streak >= 3) unlocked.push('streak_3');
  if (stats.streak >= 7) unlocked.push('streak_7');
  if (stats.points >= 100) unlocked.push('points_100');
  if (stats.points >= 300) unlocked.push('points_300');
  if (stats.codeRunsCount >= 10) unlocked.push('code_runner');
  if (stats.hadComeback) unlocked.push('comeback');
  if (stats.totalLessons > 0 && stats.completedLessonsCount >= stats.totalLessons) {
    unlocked.push('course_complete');
  }
  return unlocked;
}

// ─── Rango (progresión por puntos) ──────────────────────────────────────────
// Se llama "Rango" (no "Nivel") a propósito: "Nivel" ya lo usa el curso para
// las secciones de contenido (Principiante/Intermedio/Avanzado). Mezclar los
// dos términos confundiría "en qué sección del curso estoy" con "cuántos
// puntos acumulé", que son cosas distintas.

export interface RankDefinition {
  name: string;
  minPoints: number;
}

export const RANKS: RankDefinition[] = [
  { name: 'Novato', minPoints: 0 },
  { name: 'Aprendiz', minPoints: 150 },
  { name: 'Competente', minPoints: 350 },
  { name: 'Experto', minPoints: 650 },
  { name: 'Maestro', minPoints: 950 },
];

export interface RankInfo {
  name: string;
  index: number;
  next: RankDefinition | null;
  progressToNext: number; // 0..1
  pointsToNext: number | null;
}

export function getRankInfo(points: number): RankInfo {
  let currentIndex = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].minPoints) currentIndex = i;
  }
  const current = RANKS[currentIndex];
  const next = RANKS[currentIndex + 1] ?? null;
  const progressToNext = next
    ? Math.min(1, Math.max(0, (points - current.minPoints) / (next.minPoints - current.minPoints)))
    : 1;

  return {
    name: current.name,
    index: currentIndex,
    next,
    progressToNext,
    pointsToNext: next ? next.minPoints - points : null,
  };
}
