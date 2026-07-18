import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../store/useAppStore';
import { FIRST_LESSON_ID } from '../../features/lesson/data/curriculum';

// El store es un singleton de módulo (persiste entre tests), así que
// reseteamos explícitamente antes de cada test para partir de un estado limpio.
describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.getState().resetSession();
    useAppStore.setState({ userName: null });
  });

  it('markLessonCompleted agrega una lección a completedLessons', () => {
    useAppStore.getState().markLessonCompleted('lesson-1');
    expect(useAppStore.getState().completedLessons).toEqual(['lesson-1']);
  });

  it('markLessonCompleted no duplica una lección ya marcada como completada', () => {
    useAppStore.getState().markLessonCompleted('lesson-1');
    useAppStore.getState().markLessonCompleted('lesson-1');
    expect(useAppStore.getState().completedLessons).toEqual(['lesson-1']);
  });

  it('markLessonCompleted acumula distintas lecciones en orden', () => {
    useAppStore.getState().markLessonCompleted('lesson-1');
    useAppStore.getState().markLessonCompleted('lesson-2');
    expect(useAppStore.getState().completedLessons).toEqual(['lesson-1', 'lesson-2']);
  });

  it('resetSession limpia completedLessons y vuelve el profile al estado inicial', () => {
    useAppStore.getState().markLessonCompleted('lesson-1');
    useAppStore.getState().advanceBlock(2);

    useAppStore.getState().resetSession();

    const state = useAppStore.getState();
    expect(state.completedLessons).toEqual([]);
    expect(state.profile.currentBlockIndex).toBe(0);
    expect(state.profile.currentLessonId).toBe(FIRST_LESSON_ID);
  });

  it('advanceLesson cambia de lección y reinicia currentBlockIndex a 0', () => {
    useAppStore.getState().advanceBlock(2);
    useAppStore.getState().advanceLesson('lesson-2');

    const state = useAppStore.getState();
    expect(state.profile.currentLessonId).toBe('lesson-2');
    expect(state.profile.currentBlockIndex).toBe(0);
  });

  it('advanceBlock actualiza solo el índice de bloque, no la lección', () => {
    useAppStore.getState().advanceBlock(1);
    const state = useAppStore.getState();
    expect(state.profile.currentBlockIndex).toBe(1);
    expect(state.profile.currentLessonId).toBe(FIRST_LESSON_ID);
  });

  it('addPoints acumula puntos y nunca baja de 0', () => {
    useAppStore.getState().addPoints(10);
    useAppStore.getState().addPoints(5);
    expect(useAppStore.getState().points).toBe(15);

    useAppStore.getState().addPoints(-100);
    expect(useAppStore.getState().points).toBe(0);
  });

  it('setUserName guarda el nombre recortando espacios, y vacío/solo-espacios se guarda como null', () => {
    useAppStore.getState().setUserName('  Ana  ');
    expect(useAppStore.getState().userName).toBe('Ana');

    useAppStore.getState().setUserName('   ');
    expect(useAppStore.getState().userName).toBeNull();
  });

  it('registerActivityToday inicia la racha en 1 la primera vez', () => {
    useAppStore.getState().registerActivityToday();
    expect(useAppStore.getState().streak).toBe(1);
  });

  it('registerActivityToday no duplica la racha si ya se registró actividad hoy', () => {
    useAppStore.getState().registerActivityToday();
    useAppStore.getState().registerActivityToday();
    useAppStore.getState().registerActivityToday();
    expect(useAppStore.getState().streak).toBe(1);
  });

  it('registerActivityToday reinicia la racha a 1 si la última actividad no fue ayer', () => {
    useAppStore.setState({ lastActiveDate: '2020-01-01', streak: 7 });
    useAppStore.getState().registerActivityToday();
    expect(useAppStore.getState().streak).toBe(1);
  });

  it('resetSession limpia puntos y racha pero conserva el nombre del usuario', () => {
    useAppStore.getState().setUserName('Ana');
    useAppStore.getState().addPoints(20);
    useAppStore.getState().registerActivityToday();

    useAppStore.getState().resetSession();

    const state = useAppStore.getState();
    expect(state.points).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.userName).toBe('Ana');
  });

  it('checkBadges desbloquea y encola solo los badges nuevos, sin duplicar', () => {
    useAppStore.getState().markLessonCompleted('lesson-1');
    useAppStore.getState().checkBadges(4);

    let state = useAppStore.getState();
    expect(state.unlockedBadges).toContain('first_lesson');
    expect(state.badgeToastQueue).toEqual(['first_lesson']);

    // Volver a llamar checkBadges sin cambios no debería re-encolar el mismo badge
    useAppStore.getState().checkBadges(4);
    state = useAppStore.getState();
    expect(state.badgeToastQueue).toEqual(['first_lesson']);
  });

  it('dismissBadgeToast saca solo el primero de la cola', () => {
    useAppStore.setState({ badgeToastQueue: ['first_lesson', 'points_100'] });
    useAppStore.getState().dismissBadgeToast();
    expect(useAppStore.getState().badgeToastQueue).toEqual(['points_100']);
  });

  it('resetSession también limpia badges, racha de código y quizzes perfectos', () => {
    useAppStore.getState().markLessonCompleted('lesson-1');
    useAppStore.getState().checkBadges(4);
    useAppStore.getState().incrementCodeRuns();
    useAppStore.getState().registerPerfectQuiz();

    useAppStore.getState().resetSession();

    const state = useAppStore.getState();
    expect(state.unlockedBadges).toEqual([]);
    expect(state.badgeToastQueue).toEqual([]);
    expect(state.codeRunsCount).toBe(0);
    expect(state.perfectQuizCount).toBe(0);
  });

  it('addMissedItem agrega un ítem, y no lo duplica si ya estaba (por itemId)', () => {
    const item = {
      kind: 'quiz' as const,
      lessonId: 'lesson-5',
      lessonTitle: 'Variables',
      blockId: 'lesson-5-quiz',
      variant: 'base' as const,
      itemId: 'l5-q1-base',
      label: '¿Qué es let?',
    };
    useAppStore.getState().addMissedItem(item);
    useAppStore.getState().addMissedItem(item);
    expect(useAppStore.getState().missedItems).toHaveLength(1);
  });

  it('resolveMissedItem saca el ítem de la lista, y suma puntos solo si awardBonus es true', () => {
    const item = {
      kind: 'code' as const,
      lessonId: 'lesson-5',
      lessonTitle: 'Variables',
      blockId: 'lesson-5-code',
      variant: 'base' as const,
      itemId: 'code-5-base',
      label: 'Ejercicio de variables',
    };
    useAppStore.getState().addMissedItem(item);
    useAppStore.getState().resolveMissedItem('code-5-base', true);

    let state = useAppStore.getState();
    expect(state.missedItems).toEqual([]);
    expect(state.points).toBe(15);

    // Resolver un id que no está en la lista no debería sumar puntos ni romper nada
    useAppStore.getState().resolveMissedItem('id-inexistente', true);
    state = useAppStore.getState();
    expect(state.points).toBe(15);
  });

  it('resolveMissedItem sin awardBonus saca el ítem pero no suma puntos', () => {
    const item = {
      kind: 'quiz' as const,
      lessonId: 'lesson-5',
      lessonTitle: 'Variables',
      blockId: 'lesson-5-quiz',
      variant: 'base' as const,
      itemId: 'l5-q1-base',
      label: '¿Qué es let?',
    };
    useAppStore.getState().addMissedItem(item);
    useAppStore.getState().resolveMissedItem('l5-q1-base', false);

    const state = useAppStore.getState();
    expect(state.missedItems).toEqual([]);
    expect(state.points).toBe(0);
  });

  it('selectTrack cambia el track/nivel activo y salta a la primera lección de ese nivel', () => {
    useAppStore.getState().selectTrack('typescript', 'intermediate');

    const state = useAppStore.getState();
    expect(state.track).toBe('typescript');
    expect(state.startingLevel).toBe('intermediate');
    expect(state.hasSelectedTrack).toBe(true);
    expect(state.profile.currentLessonId).toBe('ts-lesson-3'); // 1ra lección intermedia del track TS
    expect(state.profile.currentBlockIndex).toBe(0);
  });

  it('resetSession preserva el track/nivel elegido (no obliga a re-elegir curso)', () => {
    useAppStore.getState().selectTrack('typescript', 'advanced');
    useAppStore.getState().resetSession();

    const state = useAppStore.getState();
    expect(state.track).toBe('typescript');
    expect(state.startingLevel).toBe('advanced');
    expect(state.hasSelectedTrack).toBe(true);
  });
});
