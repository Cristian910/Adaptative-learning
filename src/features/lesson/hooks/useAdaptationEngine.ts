import { useCallback, useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { ADAPTATION_RULES } from '../../../engine/adaptation-rules';
import { recalculateConfidence, classifyLearnerState, updateProfileDerivedFields } from '../../../engine/behavior-classifier';
import type { BehaviorEvent, AdaptationDecision, UserProfile } from '../../../types/domain';

const MAX_RECENT_EVENTS = 50;

export function useAdaptationEngine() {
  const updateProfile = useAppStore((s) => s.updateProfile);
  const addDecision = useAppStore((s) => s.addDecision);

  // Refs para acceder a valores actuales dentro de callbacks sin stale closures,
  // y sin causar re-renders cuando se actualizan.
  const recentEventsRef = useRef<BehaviorEvent[]>([]);
  const lastDecisionAtRef = useRef<Record<string, number>>({});
  const processingRef = useRef(false); // mutex simple para evaluaciones concurrentes

  const processEvent = useCallback(
    (event: BehaviorEvent, profile: UserProfile) => {
      // Mutex: si ya estamos procesando, ignorar. Para este MVP con usuario único
      // no es necesario encolar — los eventos son lo suficientemente espaciados.
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        // 1. Actualizar ventana de eventos recientes (sliding window)
        recentEventsRef.current = [
          ...recentEventsRef.current.slice(-(MAX_RECENT_EVENTS - 1)),
          event,
        ];

        // 2. Recalcular confidence y state
        const newConfidence = recalculateConfidence(recentEventsRef.current);
        const newState = classifyLearnerState(newConfidence);
        const derivedUpdates = updateProfileDerivedFields(
          profile,
          event,
          recentEventsRef.current
        );

        const updatedProfile: UserProfile = {
          ...profile,
          ...derivedUpdates,
          confidence: newConfidence,
          state: newState,
        };

        // 3. Evaluar todas las reglas con el perfil actualizado
        const ruleContext = {
          event,
          profile: updatedProfile,
          recentEvents: recentEventsRef.current,
          lastDecisionAt: lastDecisionAtRef.current,
        };

        const decisions: AdaptationDecision[] = ADAPTATION_RULES
          .map((rule) => rule.evaluate(ruleContext))
          .filter((d): d is AdaptationDecision => d !== null);

        // 4. Deduplicar por tipo, conservando la de mayor prioridad (número menor)
        // Previene disparar simplify_content + unlock_advanced en el mismo frame.
        const dedupedDecisions = decisions
          .sort((a, b) => a.priority - b.priority)
          .reduce<AdaptationDecision[]>((acc, decision) => {
            if (!acc.some((d) => d.type === decision.type)) {
              acc.push(decision);
            }
            return acc;
          }, []);

        // 5. Actualizar cooldowns de TODAS las decisiones que dispararon en
        // este evento (para que ninguna pueda re-dispararse antes de su
        // propio cooldown, aunque no haya sido la que ganó este batch)...
        dedupedDecisions.forEach((decision) => {
          lastDecisionAtRef.current[decision.type] = Date.now();
        });
        // ...pero solo se despacha al store la de MAYOR prioridad (número más
        // bajo) como la decisión activa. dedupedDecisions ya viene ordenada
        // ascendente por priority, así que es el primer elemento.
        // Antes se despachaban todas en secuencia y, como cada addDecision()
        // sobreescribe latestDecision por completo, la que quedaba activa era
        // la ÚLTIMA procesada (la de prioridad más baja) — al revés de lo
        // que indica "priority: 1 = máxima prioridad". Esto hacía que, por
        // ejemplo, una explicación de IA por fallos repetidos en un quiz
        // (prioridad 1) pudiera perderse en silencio si en el mismo evento
        // también disparaba un aviso motivacional (prioridad 3).
        if (dedupedDecisions.length > 0) {
          addDecision(dedupedDecisions[0]);
        }

        // 6. Actualizar profile (batched implícitamente por React en event handlers)
        updateProfile(updatedProfile);
      } finally {
        processingRef.current = false;
      }
    },
    [updateProfile, addDecision]
  );

  return { processEvent };
}
