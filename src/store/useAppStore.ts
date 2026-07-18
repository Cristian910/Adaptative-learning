import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { UserProfile, AdaptationDecision, MissedItemRef, CourseTrack, CourseLevel } from '../types/domain';
import { evaluateBadges } from '../features/gamification/badges';
import { FIRST_LESSON_ID, getLessonsForTrack } from '../features/lesson/data/curriculum';

// crypto.randomUUID requiere un contexto seguro (https o localhost). Si por
// algún motivo no está disponible, esto evita que la carga del módulo entero
// (y por lo tanto toda la app) explote antes de que React llegue a montar algo.
function safeUUID(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AppState {
  // Slices
  profile: UserProfile;
  latestDecision: AdaptationDecision | null;
  decisionHistory: AdaptationDecision[];
  activeHintDismissed: boolean;
  activeExplanationDismissed: boolean;
  completedLessons: string[];
  userName: string | null;
  points: number;
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  unlockedBadges: string[];
  badgeToastQueue: string[];
  codeRunsCount: number;
  perfectQuizCount: number;
  hadComeback: boolean;
  // Preguntas/ejercicios fallados alguna vez, pendientes de repasar (ver
  // MissedItemRef en types/domain.ts).
  missedItems: MissedItemRef[];
  // Qué curso (track) y desde qué nivel eligió arrancar el usuario. Se
  // pregunta una sola vez, en el onboarding — ver TrackSelector.tsx.
  track: CourseTrack;
  startingLevel: CourseLevel;
  hasSelectedTrack: boolean;

  // Actions
  updateProfile: (profile: UserProfile) => void;
  addDecision: (decision: AdaptationDecision) => void;
  clearLatestDecision: () => void;
  dismissActiveOverlay: () => void;
  advanceBlock: (blockIndex: number) => void;
  advanceLesson: (lessonId: string) => void;
  markLessonCompleted: (lessonId: string) => void;
  setUserName: (name: string) => void;
  addPoints: (amount: number) => void;
  registerActivityToday: () => void;
  incrementCodeRuns: () => void;
  registerPerfectQuiz: () => void;
  checkBadges: (totalLessons: number) => void;
  dismissBadgeToast: () => void;
  resetSession: () => void;
  addMissedItem: (item: MissedItemRef) => void;
  resolveMissedItem: (itemId: string, awardBonus: boolean) => void;
  selectTrack: (track: CourseTrack, startingLevel: CourseLevel) => void;
}

// ─── Default Profile ──────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  id: safeUUID(),
  state: 'normal',
  confidence: 0.5,
  currentLessonId: FIRST_LESSON_ID,
  currentBlockIndex: 0,
  sessionHistory: [],
  totalMistakes: 0,
  avgTimePerBlock: 0,
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ─── Store ────────────────────────────────────────────────────────────────────
// subscribeWithSelector: permite que cada componente suscriba solo al slice que necesita.
// Un componente que muestra el progreso NO re-renderiza cuando cambia confidence.
// persist: solo persiste el profile — las decisions son efímeras.

export const useAppStore = create<AppState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      profile: DEFAULT_PROFILE,
      latestDecision: null,
      decisionHistory: [],
      activeHintDismissed: false,
      activeExplanationDismissed: false,
      completedLessons: [],
      userName: null,
      points: 0,
      streak: 0,
      lastActiveDate: null,
      unlockedBadges: [],
      badgeToastQueue: [],
      codeRunsCount: 0,
      perfectQuizCount: 0,
      hadComeback: false,
      missedItems: [],
      track: 'javascript',
      startingLevel: 'base',
      hasSelectedTrack: false,

      updateProfile: (profile) =>
        set((state) => ({
          profile,
          // "Comeback": veníamos de struggling y ahora ya no lo estamos.
          hadComeback:
            state.hadComeback ||
            (state.profile.state === 'struggling' && profile.state !== 'struggling'),
        })),

      addDecision: (decision) =>
        set((state) => ({
          latestDecision: decision,
          decisionHistory: [...state.decisionHistory.slice(-99), decision],
          // Resetear dismissed cuando llega una nueva decisión del mismo tipo
          activeHintDismissed:
            decision.type === 'show_hint' ? false : state.activeHintDismissed,
          activeExplanationDismissed:
            decision.type === 'request_ai_explanation'
              ? false
              : state.activeExplanationDismissed,
        })),

      clearLatestDecision: () =>
        set({ latestDecision: null }),

      dismissActiveOverlay: () =>
        set((state) => ({
          activeHintDismissed:
            state.latestDecision?.type === 'show_hint' ? true : state.activeHintDismissed,
          activeExplanationDismissed:
            state.latestDecision?.type === 'request_ai_explanation'
              ? true
              : state.activeExplanationDismissed,
        })),

      advanceBlock: (blockIndex) =>
        set((state) => ({
          profile: { ...state.profile, currentBlockIndex: blockIndex },
          latestDecision: null,
          activeHintDismissed: false,
          activeExplanationDismissed: false,
        })),

      advanceLesson: (lessonId) =>
        set((state) => ({
          profile: {
            ...state.profile,
            currentLessonId: lessonId,
            currentBlockIndex: 0,
          },
          latestDecision: null,
          activeHintDismissed: false,
          activeExplanationDismissed: false,
        })),

      markLessonCompleted: (lessonId) =>
        set((state) => ({
          completedLessons: state.completedLessons.includes(lessonId)
            ? state.completedLessons
            : [...state.completedLessons, lessonId],
        })),

      setUserName: (name) => set({ userName: name.trim().slice(0, 40) || null }),

      addPoints: (amount) =>
        set((state) => ({ points: Math.max(0, state.points + amount) })),

      // Racha de días consecutivos con actividad. Se llama una vez al cargar
      // la app: si ya se registró actividad hoy, no hace nada; si la última
      // actividad fue ayer, suma 1 a la racha; si fue antes de ayer (o nunca),
      // la racha se reinicia en 1.
      registerActivityToday: () =>
        set((state) => {
          const today = todayISO();
          if (state.lastActiveDate === today) return {};
          const wasYesterday = state.lastActiveDate === yesterdayISO();
          return {
            lastActiveDate: today,
            streak: wasYesterday ? state.streak + 1 : 1,
          };
        }),

      incrementCodeRuns: () =>
        set((state) => ({ codeRunsCount: state.codeRunsCount + 1 })),

      registerPerfectQuiz: () =>
        set((state) => ({ perfectQuizCount: state.perfectQuizCount + 1 })),

      // Compara qué badges DEBERÍAN estar desbloqueados según las stats
      // actuales contra los que ya están, y encola solo los nuevos para el
      // toast — así el usuario ve una notificación al momento de ganarlos, no
      // solo un ítem nuevo mudo en una lista.
      checkBadges: (totalLessons) =>
        set((state) => {
          const shouldUnlock = evaluateBadges({
            completedLessonsCount: state.completedLessons.length,
            totalLessons,
            points: state.points,
            streak: state.streak,
            codeRunsCount: state.codeRunsCount,
            perfectQuizCount: state.perfectQuizCount,
            hadComeback: state.hadComeback,
          });
          const newOnes = shouldUnlock.filter((id) => !state.unlockedBadges.includes(id));
          if (newOnes.length === 0) return {};
          return {
            unlockedBadges: [...state.unlockedBadges, ...newOnes],
            badgeToastQueue: [...state.badgeToastQueue, ...newOnes],
          };
        }),

      dismissBadgeToast: () =>
        set((state) => ({ badgeToastQueue: state.badgeToastQueue.slice(1) })),

      // Guarda la referencia de una pregunta/ejercicio fallado para el
      // repaso final. Dedup por itemId — fallar la misma pregunta varias
      // veces no la duplica en la lista.
      addMissedItem: (item) =>
        set((state) => {
          if (state.missedItems.some((m) => m.itemId === item.itemId)) return {};
          return { missedItems: [...state.missedItems, item] };
        }),

      // Saca un ítem de la lista de repaso. awardBonus=true suma puntos
      // extra — se usa cuando se resuelve desde la pantalla de Repaso
      // (después de terminar el curso); awardBonus=false se usa cuando se
      // termina resolviendo "orgánicamente" durante la lección normal (no
      // amerita premio extra, ya sumó los puntos normales de esa lección).
      resolveMissedItem: (itemId, awardBonus) =>
        set((state) => {
          const existed = state.missedItems.some((m) => m.itemId === itemId);
          if (!existed) return {};
          return {
            missedItems: state.missedItems.filter((m) => m.itemId !== itemId),
            points: awardBonus ? Math.max(0, state.points + 15) : state.points,
          };
        }),

      // Se llama una única vez, en el onboarding (ver TrackSelector.tsx). Si
      // el usuario elige arrancar desde un nivel que no es el primero (ej.
      // "avanzado"), currentLessonId salta directo a la primera lección de
      // ESE nivel — las lecciones de niveles anteriores quedan desbloqueadas
      // para navegación libre (ver LessonNav.tsx), pero no marcadas como
      // completadas, ya que el usuario no las hizo.
      selectTrack: (track, startingLevel) =>
        set((state) => {
          const lessons = getLessonsForTrack(track);
          const firstForLevel =
            lessons.find((l) => l.level === startingLevel) ?? lessons[0];
          return {
            track,
            startingLevel,
            hasSelectedTrack: true,
            profile: {
              ...state.profile,
              currentLessonId: firstForLevel.id,
              currentBlockIndex: 0,
            },
            latestDecision: null,
          };
        }),

      resetSession: () =>
        set({
          profile: { ...DEFAULT_PROFILE, id: safeUUID() },
          latestDecision: null,
          decisionHistory: [],
          activeHintDismissed: false,
          activeExplanationDismissed: false,
          completedLessons: [],
          points: 0,
          streak: 0,
          lastActiveDate: null,
          unlockedBadges: [],
          badgeToastQueue: [],
          codeRunsCount: 0,
          perfectQuizCount: 0,
          hadComeback: false,
          missedItems: [],
          // track/startingLevel/hasSelectedTrack se preservan a propósito:
          // reiniciar el progreso no debería obligar a elegir el curso de
          // nuevo — solo vuelve a arrancar desde la primera lección de ese
          // mismo track/nivel.
          // userName se preserva a propósito: reiniciar el progreso no debería
          // obligar a re-ingresar el nombre.
        }),
    })),
    {
      name: 'adaptive-learning-session',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // Solo persistir datos "de perfil" — no las decisions efímeras ni sus
      // flags de dismissal, que deben arrancar limpios en cada carga.
      partialize: (state) => ({
        profile: state.profile,
        completedLessons: state.completedLessons,
        userName: state.userName,
        points: state.points,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        unlockedBadges: state.unlockedBadges,
        codeRunsCount: state.codeRunsCount,
        perfectQuizCount: state.perfectQuizCount,
        hadComeback: state.hadComeback,
        missedItems: state.missedItems,
        track: state.track,
        startingLevel: state.startingLevel,
        hasSelectedTrack: state.hasSelectedTrack,
        // badgeToastQueue NO se persiste: es puramente transitorio para el
        // toast en pantalla, no debería reaparecer al recargar.
      }),
      // Si en localStorage hay datos de una versión anterior del store (por
      // ejemplo de antes de agregar completedLessons/points/streak), el merge
      // por defecto de zustand (currentState + persistedState) ya se encarga
      // de completar cualquier campo faltante con los valores por defecto del
      // estado fresco, en vez de dejar `undefined` sueltos.
      // Si la lectura/parseo de localStorage falla por cualquier motivo (JSON
      // corrupto de una versión vieja, storage lleno, modo privado, etc.), lo
      // logueamos pero dejamos que la app siga con los valores por defecto en
      // vez de romper el render.
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error('[useAppStore] No se pudo restaurar el progreso guardado:', error);
        }
      },
    }
  )
);

// ─── Selectores derivados ─────────────────────────────────────────────────────
// Viven fuera del store: son funciones puras y estables entre renders.
// Úsalos con: useAppStore(selectIsStruggling) — Zustand hace la comparación por === automáticamente.

export const selectIsStruggling = (state: AppState) => state.profile.state === 'struggling';
export const selectIsAdvanced = (state: AppState) => state.profile.state === 'advanced';
export const selectConfidencePercent = (state: AppState) =>
  Math.round(state.profile.confidence * 100);
export const selectNeedsAIIntervention = (state: AppState) =>
  state.latestDecision?.shouldTriggerAI ?? false;
export const selectCurrentLesson = (state: AppState) => state.profile.currentLessonId;
export const selectCurrentBlock = (state: AppState) => state.profile.currentBlockIndex;
export const selectShouldShowHint = (state: AppState) =>
  state.latestDecision?.type === 'show_hint' && !state.activeHintDismissed;
export const selectShouldShowExplanation = (state: AppState) =>
  state.latestDecision?.type === 'request_ai_explanation' &&
  !state.activeExplanationDismissed;
export const selectLatestDecisionType = (state: AppState) => state.latestDecision?.type ?? null;
