import { motion } from 'framer-motion';

// ─── HintOverlay ──────────────────────────────────────────────────────────────

interface HintOverlayProps {
  content: string;
  isStaticFallback?: boolean;
  onDismiss: () => void;
}

export function HintOverlay({ content, isStaticFallback, onDismiss }: HintOverlayProps) {
  return (
    <motion.div layout className="hint-overlay">
      <div className="hint-overlay-header">
        <div className="hint-overlay-label">
          <span className="hint-icon">💡</span>
          <span>Pista contextual</span>
          {isStaticFallback && (
            <span className="hint-fallback-badge">general</span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="btn-dismiss"
          aria-label="Cerrar pista"
        >
          ✕
        </button>
      </div>
      <p className="hint-content">{content}</p>
    </motion.div>
  );
}

// ─── AIExplanation ────────────────────────────────────────────────────────────

interface AIExplanationProps {
  content: string;
  isStaticFallback?: boolean;
  onDismiss: () => void;
}

export function AIExplanation({ content, isStaticFallback, onDismiss }: AIExplanationProps) {
  return (
    <motion.div layout className="ai-explanation">
      <div className="ai-explanation-header">
        <div className="ai-explanation-label">
          <span className="ai-icon">✦</span>
          <span>Explicación alternativa</span>
          {isStaticFallback && (
            <span className="hint-fallback-badge">general</span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="btn-dismiss"
          aria-label="Cerrar explicación"
        >
          ✕
        </button>
      </div>
      <p className="ai-explanation-content">{content}</p>
    </motion.div>
  );
}
