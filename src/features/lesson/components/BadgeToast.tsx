import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGES_BY_ID } from '../../gamification/badges';

interface BadgeToastProps {
  badgeId: string | undefined;
  onDismiss: () => void;
}

// ─── BadgeToast ─────────────────────────────────────────────────────────────
// Sin esto, un logro nuevo era un ítem mudo en una lista que nadie mira. Esto
// lo celebra en el momento — es lo que hace que puntos/racha "signifiquen algo"
// en vez de ser solo números.

export function BadgeToast({ badgeId, onDismiss }: BadgeToastProps) {
  const badge = badgeId ? BADGES_BY_ID[badgeId] : null;

  useEffect(() => {
    if (!badge) return;
    const timeoutId = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timeoutId);
  }, [badge, onDismiss]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          key={badge.id}
          className="badge-toast"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          onClick={onDismiss}
        >
          <div className="badge-toast-icon">{badge.icon}</div>
          <div>
            <p className="badge-toast-kicker">Logro desbloqueado</p>
            <p className="badge-toast-title">{badge.title}</p>
            <p className="badge-toast-desc">{badge.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
