import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '../../../app/useModalA11y';
import { useLanguage } from '../../../app/LanguageContext';

interface WelcomeModalProps {
  open: boolean;
  onClose: (name: string) => void;
}

// ─── WelcomeModal ────────────────────────────────────────────────────────────
// Se muestra una sola vez (la primera visita) para explicar que el sistema
// observa el comportamiento del alumno y adapta el contenido solo. Sin esto,
// un usuario nuevo no entiende por qué a veces cambia la densidad del texto o
// aparecen pistas — parece magia o un bug, no una función. De paso, pide el
// nombre para poder personalizar el saludo y el progreso.
//
// Tiene su propio toggle de idioma (arriba a la derecha) porque es la
// primera pantalla que se ve — el toggle "de verdad" vive en la sidebar,
// pero aquí todavía no existe sidebar, así que sin este botón alguien de
// habla inglesa quedaría atrapado en español hasta pasar el onboarding.

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [name, setName] = useState('');
  const { language, toggleLanguage, t } = useLanguage();
  const containerRef = useModalA11y<HTMLDivElement>(open, () => onClose(name));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={containerRef}
            className="welcome-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <button
              className="language-toggle-corner"
              onClick={toggleLanguage}
              aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a español'}
            >
              {language === 'es' ? '🇦🇷 ES' : '🇺🇸 EN'}
            </button>

            <div className="welcome-modal-icon" aria-hidden="true">👋</div>
            <h2 id="welcome-modal-title" className="welcome-modal-title">{t.welcomeTitle}</h2>
            <p className="welcome-modal-text">{t.welcomeIntro}</p>
            <ul className="welcome-modal-list">
              <li>{t.welcomeBullet1}</li>
              <li>{t.welcomeBullet2}</li>
              <li>{t.welcomeBullet3}</li>
              <li>{t.welcomeBullet4}</li>
              <li>{t.welcomeBullet5}</li>
              <li>{t.welcomeBullet6}</li>
              <li>{t.welcomeBullet7}</li>
            </ul>
            <p className="welcome-modal-text welcome-modal-text--muted">{t.welcomeFootnote}</p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.welcomeNamePlaceholder}
              maxLength={40}
              className="welcome-modal-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onClose(name);
              }}
            />

            <button onClick={() => onClose(name)} className="btn-primary btn-lg">
              {t.welcomeStartButton}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
