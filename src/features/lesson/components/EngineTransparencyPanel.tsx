import { motion, AnimatePresence } from 'framer-motion';
import type { AdaptationDecision, UserProfile } from '../../../types/domain';
import { RULE_EXPLANATIONS, DECISION_TYPE_LABELS, RULE_LABELS, BLOCK_TYPE_LABELS } from '../utils/decisionExplainer';
import { STATE_CONFIG } from '../utils/labels';
import { useModalA11y } from '../../../app/useModalA11y';

interface EngineTransparencyPanelProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  latestDecision: AdaptationDecision | null;
  decisionHistory: AdaptationDecision[];
}

// ─── EngineTransparencyPanel ─────────────────────────────────────────────────
// El motor de adaptación (behavior-classifier + adaptation-rules) es lo más
// sofisticado de todo el proyecto, y hasta ahora actuaba completamente en
// silencio — el contenido cambiaba, pero nunca se explicaba POR QUÉ. Este
// panel expone en tiempo real la misma información que ya calculaba el
// motor (confidence, qué regla disparó, con qué prioridad), sin agregar
// ningún tracking nuevo — solo la hace visible.

function DecisionRow({ decision }: { decision: AdaptationDecision }) {
  const explanation = RULE_EXPLANATIONS[decision.triggeredBy];
  return (
    <div className="transparency-decision-card">
      <div className="transparency-decision-header">
        <span className="transparency-decision-type">
          {DECISION_TYPE_LABELS[decision.type] ?? decision.type}
        </span>
        <span className={`transparency-priority transparency-priority--${decision.priority}`}>
          prioridad {decision.priority}
        </span>
      </div>
      {explanation && <p className="transparency-explanation">{explanation}</p>}
      <details className="transparency-tech-details">
        <summary>Detalles técnicos</summary>
        <dl>
          <dt>Regla</dt>
          <dd>{RULE_LABELS[decision.triggeredBy] ?? decision.triggeredBy}</dd>
          <dt>Tipo de ajuste</dt>
          <dd>{DECISION_TYPE_LABELS[decision.type] ?? decision.type}</dd>
          <dt>Bloque</dt>
          <dd>{decision.context.blockType ? (BLOCK_TYPE_LABELS[decision.context.blockType] ?? decision.context.blockType) : '—'}</dd>
          <dt>¿Dispara IA?</dt>
          <dd>{decision.shouldTriggerAI ? 'Sí' : 'No'}</dd>
          <dt>Tiempo mínimo hasta la próxima</dt>
          <dd>{Math.round(decision.cooldownMs / 1000)} segundos</dd>
        </dl>
      </details>
    </div>
  );
}

export function EngineTransparencyPanel({
  open,
  onClose,
  profile,
  latestDecision,
  decisionHistory,
}: EngineTransparencyPanelProps) {
  const stateConfig = STATE_CONFIG[profile.state];
  const confidencePercent = Math.round(profile.confidence * 100);
  const containerRef = useModalA11y<HTMLDivElement>(open, onClose);
  // Últimas decisiones, más reciente primero, sin repetir la que ya se
  // muestra como "activa" arriba.
  const recentHistory = [...decisionHistory]
    .reverse()
    .filter((d) => d !== latestDecision)
    .slice(0, 4);

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
            className="dashboard-card transparency-panel-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transparency-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badges-panel-header">
              <h2 id="transparency-title" className="welcome-modal-title">🔍 Motor adaptativo</h2>
              <button onClick={onClose} className="badges-panel-close" aria-label="Cerrar">
                ✕
              </button>
            </div>
            <p className="welcome-modal-text">
              Esto es lo que el motor de adaptación sabe en este momento, y la última
              decisión que tomó — en vivo, no una simulación.
            </p>

            <div className="transparency-state-row">
              <span
                className="dashboard-state-pill"
                style={{ color: stateConfig.color, background: stateConfig.bg }}
              >
                {stateConfig.label}
              </span>
              <span className="transparency-stat">Confianza: <strong>{confidencePercent}%</strong></span>
              <span className="transparency-stat">Errores totales: <strong>{profile.totalMistakes}</strong></span>
            </div>

            <h3 className="badges-section-title">Última decisión</h3>
            {latestDecision ? (
              <DecisionRow decision={latestDecision} />
            ) : (
              <p className="welcome-modal-text welcome-modal-text--muted">
                Todavía no se disparó ninguna decisión de adaptación en esta sesión — prueba
                fallar un par de preguntas seguidas, o quedarte quieto un rato en un bloque.
              </p>
            )}

            {recentHistory.length > 0 && (
              <>
                <h3 className="badges-section-title">Decisiones recientes</h3>
                <div className="transparency-history">
                  {recentHistory.map((d, i) => (
                    <div key={i} className="transparency-history-item">
                      <span>{DECISION_TYPE_LABELS[d.type] ?? d.type}</span>
                      <span className="transparency-history-rule">
                        {RULE_LABELS[d.triggeredBy] ?? d.triggeredBy}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
