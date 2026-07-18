import { useCallback, useEffect, useRef } from 'react';
import { useAdaptationEngine } from './useAdaptationEngine';
import { useAppStore } from '../../../store/useAppStore';
import type { BehaviorEvent, BehaviorEventType } from '../../../types/domain';

const IDLE_THRESHOLD_MS = 45_000;
const SCROLL_PAUSE_THRESHOLD_MS = 3_000;

// ─── Por qué NO usamos setInterval ───────────────────────────────────────────
// setInterval cada 1s genera 60 evaluaciones/min de overhead constante.
// Patrón alternativo: un único setTimeout que se reinicia en cada interacción.
// Si el usuario interactúa, cancelamos y recreamos el timer.
// Si no interactúa en IDLE_THRESHOLD_MS, emitimos el evento.
// Costo: O(1) timer activo vs O(n) callbacks por segundo.

export function useBehaviorTracker(lessonId: string, blockId: string) {
  const profile = useAppStore((s) => s.profile);
  const { processEvent } = useAdaptationEngine();

  // Todos como refs para que los callbacks no recapten stale closures
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const blockIdRef = useRef(blockId);
  const profileRef = useRef(profile);

  // Sync refs cuando cambian props/store
  useEffect(() => { blockIdRef.current = blockId; }, [blockId]);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  // ─── Emisión de evento ──────────────────────────────────────────────────────
  const emit = useCallback(
    (type: BehaviorEventType, metadata: BehaviorEvent['metadata']) => {
      const event: BehaviorEvent = {
        type,
        timestamp: Date.now(),
        lessonId,
        blockId: blockIdRef.current,
        metadata,
      };
      processEvent(event, profileRef.current);
    },
    [lessonId, processEvent]
  );

  // ─── Idle timer: el corazón del sistema de detección pasiva ────────────────
  // Cada interacción cancela y recrea el timer.
  // Si el timer llega a 0, el usuario lleva IDLE_THRESHOLD_MS sin actividad.
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      const bid = blockIdRef.current;
      const blockType = bid.includes('quiz')
        ? 'quiz'
        : bid.includes('code')
        ? 'code'
        : 'explanation';

      emit('idle_detected', {
        kind: 'idle_detected',
        idleDurationMs: IDLE_THRESHOLD_MS,
        blockType,
      });
    }, IDLE_THRESHOLD_MS);
  }, [emit]);

  // ─── API pública ────────────────────────────────────────────────────────────

  const trackBlockEnter = useCallback(() => {
    resetIdleTimer();
    emit('block_enter', { kind: 'generic' });
  }, [emit, resetIdleTimer]);

  const trackBlockExit = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
    emit('block_exit', { kind: 'generic' });
  }, [emit]);

  const trackQuizAnswer = useCallback(
    (questionId: string, correct: boolean, attemptNumber: number, selectedOption: string) => {
      resetIdleTimer();
      emit('quiz_answer', { kind: 'quiz_answer', questionId, correct, attemptNumber, selectedOption });
      if (attemptNumber >= 2 && !correct) {
        emit('quiz_retry', { kind: 'generic' });
      }
    },
    [emit, resetIdleTimer]
  );

  const trackCodeRun = useCallback(
    (success: boolean, errorType?: string) => {
      resetIdleTimer();
      emit('code_run', { kind: 'code_run', success, errorType });
    },
    [emit, resetIdleTimer]
  );

  const trackCodeInteraction = useCallback(() => {
    resetIdleTimer();
    emit('code_interaction', { kind: 'generic' });
  }, [emit, resetIdleTimer]);

  // ─── Scroll tracking ────────────────────────────────────────────────────────
  // Scroll = actividad → reset idle timer.
  // Pausa de scroll > 3s en una posición fija → puede indicar lectura o bloqueo.
  const handleScroll = useCallback(
    (scrollPositionRatio: number) => {
      resetIdleTimer(); // scroll es actividad

      if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
      lastScrollTimeRef.current = Date.now();

      scrollPauseTimerRef.current = setTimeout(() => {
        const pauseDuration = Date.now() - lastScrollTimeRef.current;
        if (pauseDuration >= SCROLL_PAUSE_THRESHOLD_MS) {
          emit('scroll_pause', {
            kind: 'scroll_pause',
            pauseDurationMs: pauseDuration,
            scrollPositionRatio,
          });
        }
      }, SCROLL_PAUSE_THRESHOLD_MS);
    },
    [resetIdleTimer, emit]
  );

  // ─── Inicialización y limpieza ──────────────────────────────────────────────
  // Reiniciar idle timer cuando cambia el blockId (nuevo bloque = nueva sesión de tracking)
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
    };
  }, [blockId, resetIdleTimer]);

  return {
    trackBlockEnter,
    trackBlockExit,
    trackQuizAnswer,
    trackCodeRun,
    trackCodeInteraction,
    handleScroll,
  };
}
