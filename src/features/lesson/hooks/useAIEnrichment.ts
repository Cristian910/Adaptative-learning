import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { requestAIContent } from '../../../services/ai/aiService';
import type { AIRequest, AIResponse, AdaptationDecision } from '../../../types/domain';
import { useAppStore } from '../../../store/useAppStore';

// ─── Build AI request from adaptation decision ────────────────────────────────

function buildAIRequest(
  decision: AdaptationDecision,
  profile: { state: 'struggling' | 'normal' | 'advanced'; confidence: number }
): AIRequest | null {
  if (decision.type === 'request_ai_explanation') {
    if (!decision.context.questionId) return null;
    return {
      type: 'alternative_explanation',
      lessonId: decision.context.lessonId,
      blockId: decision.context.blockId,
      userState: { state: profile.state, confidence: profile.confidence },
      questionId: decision.context.questionId,
      selectedOption: decision.context.specificError ?? '',
      specificError: decision.context.specificError ?? '',
    };
  }

  if (decision.type === 'show_hint') {
    return {
      type: 'contextual_hint',
      lessonId: decision.context.lessonId,
      blockId: decision.context.blockId,
      userState: { state: profile.state, confidence: profile.confidence },
      idleDurationMs: decision.context.idleDurationMs,
      blockType: decision.context.blockType,
    };
  }

  return null;
}

// ─── Build stable query key ───────────────────────────────────────────────────
// Usamos el mismo key que el cacheKey del request para alinear React Query con
// nuestro sistema de deduplicación.

function buildQueryKey(req: AIRequest): string[] {
  return [
    'ai-content',
    req.type,
    req.lessonId,
    req.blockId,
    req.questionId ?? '',
    req.selectedOption ?? '',
    req.userState.state,
  ];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// React Query como capa de caché:
// - staleTime: Infinity → nunca refetch automático durante la sesión
// - gcTime: 1h → mantiene en memoria aunque el componente se desmonte
// - retry: 1 → un solo reintento antes de mostrar fallback
// - El mismo error cometido dos veces = cache hit, no llamada duplicada a IA

export function useAIEnrichment(decision: AdaptationDecision | null) {
  const queryClient = useQueryClient();
  // IMPORTANTE: no seleccionar un objeto literal nuevo en cada render desde zustand
  // (`useAppStore((s) => ({...}))`). Zustand usa useSyncExternalStore internamente,
  // y si el selector devuelve una referencia distinta cada vez, React entra en un
  // loop de "Maximum update depth exceeded" / pantalla en blanco. Seleccionamos
  // primitivos por separado y armamos el objeto localmente, fuera del selector.
  const learnerState = useAppStore((s) => s.profile.state);
  const confidence = useAppStore((s) => s.profile.confidence);
  const profile = { state: learnerState, confidence };

  const aiRequest =
    decision?.shouldTriggerAI ? buildAIRequest(decision, profile) : null;

  const queryKey = aiRequest ? buildQueryKey(aiRequest) : ['ai-content-disabled'];

  const { data, isLoading, isError } = useQuery<AIResponse>({
    queryKey,
    queryFn: () => {
      if (!aiRequest) throw new Error('No AI request');
      return requestAIContent(aiRequest);
    },
    enabled: !!aiRequest,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    retryDelay: 500,
  });

  // Prefetch: inicia la llamada a IA en cuanto el motor emite la decisión,
  // antes de que el componente necesite mostrar el resultado.
  // En la práctica, reduce la latencia percibida porque la llamada ya está en vuelo
  // cuando el usuario termina de ver el feedback del quiz.
  const prefetchAIContent = useCallback(
    (upcomingDecision: AdaptationDecision) => {
      if (!upcomingDecision.shouldTriggerAI) return;
      const req = buildAIRequest(upcomingDecision, profile);
      if (!req) return;

      const key = buildQueryKey(req);
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: () => requestAIContent(req),
        staleTime: Infinity,
      });
    },
    [queryClient, profile]
  );

  return {
    aiContent: data ?? null,
    isLoadingAI: isLoading && !!aiRequest,
    hasAIError: isError,
    prefetchAIContent,
  };
}
