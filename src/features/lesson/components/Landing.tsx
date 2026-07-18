import { motion } from 'framer-motion';
import { useLanguage } from '../../../app/LanguageContext';

interface LandingProps {
  onStart: () => void;
}

const FEATURES_ES = [
  { icon: '🧠', title: 'Se adapta de verdad', desc: 'Un motor de reglas observa tus aciertos, errores y tiempos, y ajusta el contenido en tiempo real — no es un truco visual.' },
  { icon: '💻', title: 'Código real, no un simulacro', desc: 'Editor con syntax highlighting real (CodeMirror) y ejecución aislada en un Web Worker — con timeout, sin colgar la pestaña.' },
  { icon: '🔷', title: 'JavaScript y TypeScript', desc: 'Dos cursos completos sobre el mismo motor — la prueba de que es una plataforma, no una lección con quiz pegado.' },
  { icon: '🔍', title: 'Nada es una caja negra', desc: 'Un panel de transparencia te muestra, en vivo, qué decisión tomó el motor y por qué regla se disparó.' },
];

const FEATURES_EN = [
  { icon: '🧠', title: 'Genuinely adaptive', desc: 'A rule-based engine watches your right/wrong answers and timing, and adjusts content in real time — not a visual trick.' },
  { icon: '💻', title: 'Real code, not a mockup', desc: 'Real syntax highlighting (CodeMirror) and sandboxed execution in a Web Worker — with a timeout, so it never freezes the tab.' },
  { icon: '🔷', title: 'JavaScript and TypeScript', desc: 'Two full courses running on the same engine — proof this is a platform, not a lesson with a quiz bolted on.' },
  { icon: '🔍', title: "Nothing's a black box", desc: 'A transparency panel shows you, live, which decision the engine made and which rule triggered it.' },
];

// ─── Landing ──────────────────────────────────────────────────────────────────
// Antes, un usuario nuevo entraba directo al modal pidiéndole el nombre — sin
// ningún contexto de qué es esto ni por qué es distinto a cualquier otro
// "curso interactivo". Esta pantalla es la portada: explica la propuesta en
// 5 segundos antes de pedir nada. Solo se muestra en la primera visita (la
// misma lógica que ya gatillaba el WelcomeModal).

export function Landing({ onStart }: LandingProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const features = language === 'es' ? FEATURES_ES : FEATURES_EN;

  return (
    <div className="landing-page">
      <button
        className="language-toggle-corner landing-language-toggle"
        onClick={toggleLanguage}
        aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a español'}
      >
        {language === 'es' ? '🇦🇷 ES' : '🇺🇸 EN'}
      </button>

      <div className="landing-glow landing-glow--1" aria-hidden="true" />
      <div className="landing-glow landing-glow--2" aria-hidden="true" />

      <div className="landing-content">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="landing-hero"
        >
          <div className="landing-logo-mark" aria-hidden="true">JS</div>
          <h1 className="landing-title">
            {language === 'es' ? (
              <>Un curso que <span className="landing-title-accent">aprende de ti</span>, no al revés</>
            ) : (
              <>A course that <span className="landing-title-accent">learns from you</span>, not the other way around</>
            )}
          </h1>
          <p className="landing-subtitle">
            {language === 'es'
              ? 'JavaScript y TypeScript con un motor de adaptación real: dificultad, pistas y ejercicios que cambian según cómo vas aprendiendo — en vivo.'
              : 'JavaScript and TypeScript with a real adaptation engine: difficulty, hints, and exercises that change based on how you learn — live.'}
          </p>
          <button onClick={onStart} className="btn-primary btn-lg landing-cta">
            {language === 'es' ? 'Empezar →' : 'Get started →'}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="landing-mock-editor"
          aria-hidden="true"
        >
          <div className="landing-mock-editor-header">
            <span className="landing-mock-dot landing-mock-dot--red" />
            <span className="landing-mock-dot landing-mock-dot--yellow" />
            <span className="landing-mock-dot landing-mock-dot--green" />
            <span className="landing-mock-editor-title">motor-adaptativo.ts</span>
          </div>
          <pre className="landing-mock-editor-body">
<span className="landing-mock-comment">{'// Si fallas una pregunta 3 veces seguidas...'}</span>{'\n'}
<span className="landing-mock-keyword">if</span> (intentosFallidos {'>='} 3) {'{'}
{'  '}<span className="landing-mock-fn">revelarRespuesta</span>();
{'  '}<span className="landing-mock-fn">ofrecerVersionMasFacil</span>();
{'}'}
          </pre>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="landing-features"
      >
        {features.map((f) => (
          <div key={f.title} className="landing-feature-card">
            <span className="landing-feature-icon" aria-hidden="true">{f.icon}</span>
            <h3 className="landing-feature-title">{f.title}</h3>
            <p className="landing-feature-desc">{f.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
