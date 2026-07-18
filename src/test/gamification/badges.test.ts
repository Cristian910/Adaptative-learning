import { describe, it, expect } from 'vitest';
import { evaluateBadges, getRankInfo, RANKS } from '../../features/gamification/badges';

describe('evaluateBadges', () => {
  const baseStats = {
    completedLessonsCount: 0,
    totalLessons: 4,
    points: 0,
    streak: 0,
    codeRunsCount: 0,
    perfectQuizCount: 0,
    hadComeback: false,
  };

  it('no desbloquea nada con stats en cero', () => {
    expect(evaluateBadges(baseStats)).toEqual([]);
  });

  it('desbloquea first_lesson al completar una lección', () => {
    const result = evaluateBadges({ ...baseStats, completedLessonsCount: 1 });
    expect(result).toContain('first_lesson');
  });

  it('desbloquea course_complete solo cuando se completan TODAS las lecciones', () => {
    const partial = evaluateBadges({ ...baseStats, completedLessonsCount: 3 });
    expect(partial).not.toContain('course_complete');

    const complete = evaluateBadges({ ...baseStats, completedLessonsCount: 4 });
    expect(complete).toContain('course_complete');
  });

  it('desbloquea streak_3 y streak_7 en sus umbrales correctos', () => {
    expect(evaluateBadges({ ...baseStats, streak: 2 })).not.toContain('streak_3');
    expect(evaluateBadges({ ...baseStats, streak: 3 })).toContain('streak_3');
    expect(evaluateBadges({ ...baseStats, streak: 3 })).not.toContain('streak_7');
    expect(evaluateBadges({ ...baseStats, streak: 7 })).toContain('streak_7');
  });

  it('desbloquea points_100 y points_300 en sus umbrales correctos', () => {
    expect(evaluateBadges({ ...baseStats, points: 99 })).not.toContain('points_100');
    expect(evaluateBadges({ ...baseStats, points: 100 })).toContain('points_100');
    expect(evaluateBadges({ ...baseStats, points: 299 })).not.toContain('points_300');
    expect(evaluateBadges({ ...baseStats, points: 300 })).toContain('points_300');
  });

  it('desbloquea code_runner a partir de 10 ejecuciones', () => {
    expect(evaluateBadges({ ...baseStats, codeRunsCount: 9 })).not.toContain('code_runner');
    expect(evaluateBadges({ ...baseStats, codeRunsCount: 10 })).toContain('code_runner');
  });

  it('desbloquea first_perfect_quiz con al menos un quiz perfecto', () => {
    expect(evaluateBadges({ ...baseStats, perfectQuizCount: 1 })).toContain(
      'first_perfect_quiz'
    );
  });

  it('desbloquea comeback solo cuando hadComeback es true', () => {
    expect(evaluateBadges({ ...baseStats, hadComeback: false })).not.toContain('comeback');
    expect(evaluateBadges({ ...baseStats, hadComeback: true })).toContain('comeback');
  });

  it('puede desbloquear varios badges a la vez', () => {
    const result = evaluateBadges({
      ...baseStats,
      completedLessonsCount: 4,
      points: 300,
      streak: 7,
    });
    expect(result).toEqual(
      expect.arrayContaining(['first_lesson', 'course_complete', 'points_100', 'points_300', 'streak_3', 'streak_7'])
    );
  });
});

describe('getRankInfo', () => {
  it('empieza en Novato con 0 puntos', () => {
    expect(getRankInfo(0).name).toBe('Novato');
  });

  it('sube de rango exactamente en el umbral, no antes', () => {
    const threshold = RANKS[1].minPoints; // Aprendiz
    expect(getRankInfo(threshold - 1).name).toBe('Novato');
    expect(getRankInfo(threshold).name).toBe('Aprendiz');
  });

  it('calcula pointsToNext correctamente', () => {
    const info = getRankInfo(50);
    expect(info.next?.name).toBe('Aprendiz');
    expect(info.pointsToNext).toBe(RANKS[1].minPoints - 50);
  });

  it('en el rango máximo, next es null y progressToNext es 1', () => {
    const maxPoints = RANKS[RANKS.length - 1].minPoints + 1000;
    const info = getRankInfo(maxPoints);
    expect(info.next).toBeNull();
    expect(info.pointsToNext).toBeNull();
    expect(info.progressToNext).toBe(1);
  });

  it('progressToNext nunca es negativo ni mayor a 1', () => {
    for (const points of [0, 50, 100, 275, 999, 5000]) {
      const info = getRankInfo(points);
      expect(info.progressToNext).toBeGreaterThanOrEqual(0);
      expect(info.progressToNext).toBeLessThanOrEqual(1);
    }
  });
});
