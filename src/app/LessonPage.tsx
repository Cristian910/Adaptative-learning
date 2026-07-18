import { useState, useCallback, useMemo, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdaptiveLesson } from '../features/lesson/components/AdaptiveLesson';
import { LessonNav } from '../features/lesson/components/LessonNav';
import { BlockProgress } from '../features/lesson/components/BlockProgress';
import { WelcomeModal } from '../features/lesson/components/WelcomeModal';
import { Landing } from '../features/lesson/components/Landing';
import { TrackSelector } from '../features/lesson/components/TrackSelector';
import { LevelChangeToast } from '../features/lesson/components/LevelChangeToast';
import { SidebarStats } from '../features/lesson/components/SidebarStats';
import { BadgeToast } from '../features/lesson/components/BadgeToast';
import { BadgesPanel } from '../features/lesson/components/BadgesPanel';
import { HelpModal } from '../features/lesson/components/HelpModal';
import { EngineTransparencyPanel } from '../features/lesson/components/EngineTransparencyPanel';
import { CourseCompleteScreen } from '../features/lesson/components/CourseCompleteScreen';
import { FinalExam } from '../features/lesson/components/FinalExam';
import { useAppStore } from '../store/useAppStore';
import { getLessonsForTrack } from '../features/lesson/data/curriculum';
import { useTheme } from './useTheme';
import { useLanguage } from './LanguageContext';

// recharts (usado solo aquí adentro) es una librería pesada — igual que con
// CodeMirror en AdaptiveLesson.tsx, se carga perezosamente porque el
// dashboard es un modal que arranca cerrado: nadie debería pagar ese peso en
// la carga inicial si todavía no lo abrió.
const ProgressDashboard = lazy(() =>
  import('../features/lesson/components/ProgressDashboard').then((m) => ({
    default: m.ProgressDashboard,
  }))
);
// Playground también trae CodeMirror — si alguien ya abrió un ejercicio de
// código antes, el chunk ya está en caché del navegador; si no, se carga
// perezosamente igual que en AdaptiveLesson.tsx.
const Playground = lazy(() =>
  import('../features/lesson/components/Playground').then((m) => ({ default: m.Playground }))
);

const ONBOARDING_KEY = 'adaptive-learning-onboarded';

export function LessonPage() {
  const profile = useAppStore((s) => s.profile);
  const advanceBlock = useAppStore((s) => s.advanceBlock);
  const advanceLesson = useAppStore((s) => s.advanceLesson);
  const completedLessonsArr = useAppStore((s) => s.completedLessons);
  const markLessonCompleted = useAppStore((s) => s.markLessonCompleted);
  const addPoints = useAppStore((s) => s.addPoints);
  const resetSession = useAppStore((s) => s.resetSession);
  const registerActivityToday = useAppStore((s) => s.registerActivityToday);
  const userName = useAppStore((s) => s.userName);
  const setUserName = useAppStore((s) => s.setUserName);
  const points = useAppStore((s) => s.points);
  const streak = useAppStore((s) => s.streak);
  const unlockedBadges = useAppStore((s) => s.unlockedBadges);
  const badgeToastQueue = useAppStore((s) => s.badgeToastQueue);
  const dismissBadgeToast = useAppStore((s) => s.dismissBadgeToast);
  const checkBadges = useAppStore((s) => s.checkBadges);
  const codeRunsCount = useAppStore((s) => s.codeRunsCount);
  const perfectQuizCount = useAppStore((s) => s.perfectQuizCount);
  const track = useAppStore((s) => s.track);
  const startingLevel = useAppStore((s) => s.startingLevel);
  const hasSelectedTrack = useAppStore((s) => s.hasSelectedTrack);
  const selectTrack = useAppStore((s) => s.selectTrack);
  const missedItems = useAppStore((s) => s.missedItems);
  const resolveMissedItem = useAppStore((s) => s.resolveMissedItem);
  const latestDecision = useAppStore((s) => s.latestDecision);
  const decisionHistory = useAppStore((s) => s.decisionHistory);

  // Lista de lecciones del curso activo — JS o TS, según lo elegido en el
  // TrackSelector. Todo lo que antes asumía "el curso" == JS (numeración de
  // lecciones, progreso, prerequisites, badge de curso completado) ahora
  // deriva de esto, así que cambiar de track no requiere tocar el resto del
  // componente.
  const activeLessons = useMemo(() => getLessonsForTrack(track), [track]);

  const [showBadgesPanel, setShowBadgesPanel] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardMounted, setDashboardMounted] = useState(false);
  const openDashboard = useCallback(() => {
    setDashboardMounted(true); // dispara el import() de recharts recién aquí
    setShowDashboard(true);
  }, []);
  const [showPlayground, setShowPlayground] = useState(false);
  const [playgroundMounted, setPlaygroundMounted] = useState(false);
  const openPlayground = useCallback(() => {
    setPlaygroundMounted(true);
    setShowPlayground(true);
  }, []);
  const [showHelp, setShowHelp] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    registerActivityToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reevalúa qué logros deberían estar desbloqueados cada vez que cambia
  // cualquier stat relevante — sin importar en qué componente ocurrió el
  // evento que la disparó (quiz, código, racha, lección completada, etc.).
  useEffect(() => {
    checkBadges(activeLessons.length);
  }, [
    completedLessonsArr.length,
    points,
    streak,
    codeRunsCount,
    perfectQuizCount,
    profile.state,
    checkBadges,
    activeLessons.length,
  ]);

  const completedLessons = useMemo(
    () => new Set(completedLessonsArr),
    [completedLessonsArr]
  );

  // El certificado y la pantalla de "curso completado" exigen haber
  // terminado TODAS las lecciones del track activo — no alcanza con llegar
  // a la última posición de la secuencia. Antes se usaba solo la posición
  // como gate: si alguien elegía empezar desde "avanzado" (saltándose
  // lecciones anteriores) y completaba la última lección de la secuencia,
  // el certificado se entregaba igual, aunque le faltaran 7 de 10
  // lecciones — un bug real de integridad del certificado.
  const remainingLessons = useMemo(
    () => activeLessons.filter((l) => !completedLessons.has(l.id)),
    [activeLessons, completedLessons]
  );
  const allLessonsCompleted = remainingLessons.length === 0;

  const [showLessonComplete, setShowLessonComplete] = useState(false);
  const [showFinalExam, setShowFinalExam] = useState(false);

  const handlePassFinalExam = useCallback(() => {
    for (const lesson of remainingLessons) {
      markLessonCompleted(lesson.id);
      addPoints(50); // mismo puntaje que completar la lección normalmente
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingLessons, markLessonCompleted, addPoints]);
  const [showLanding, setShowLanding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTrackSelector, setShowTrackSelector] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDING_KEY)) {
        setShowLanding(true);
      } else if (!hasSelectedTrack) {
        // Onboarding viejo (de antes de que existiera el selector de curso):
        // ya vio el WelcomeModal en su momento, pero nunca eligió track — se
        // le muestra el selector sin repetir el landing ni el WelcomeModal.
        setShowTrackSelector(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } catch {
      // localStorage puede no estar disponible (modo privado) — no bloquea la app
    }
  }, []);

  const handleStartFromLanding = useCallback(() => {
    setShowLanding(false);
    setShowWelcome(true);
  }, []);

  const handleCloseWelcome = useCallback(
    (name: string) => {
      setShowWelcome(false);
      if (name.trim()) {
        setUserName(name);
      }
      try {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      } catch {
        // no crítico si no se puede persistir
      }
      if (!hasSelectedTrack) {
        setShowTrackSelector(true);
      }
    },
    [setUserName, hasSelectedTrack]
  );

  const handleSelectTrack = useCallback(
    (chosenTrack: Parameters<typeof selectTrack>[0], level: Parameters<typeof selectTrack>[1]) => {
      selectTrack(chosenTrack, level);
      setShowTrackSelector(false);
      setShowLessonComplete(false);
      setShowMobileNav(false);
    },
    [selectTrack]
  );

  const currentLesson = useMemo(
    () => activeLessons.find((l) => l.id === profile.currentLessonId) ?? activeLessons[0],
    [profile.currentLessonId, activeLessons]
  );

  const handleBlockComplete = useCallback(
    (blockIndex: number) => {
      const nextIndex = blockIndex + 1;
      if (nextIndex < currentLesson.blocks.length) {
        advanceBlock(nextIndex);
      } else {
        // Lección completada
        markLessonCompleted(currentLesson.id);
        addPoints(50);
        setShowLessonComplete(true);
      }
    },
    [currentLesson, advanceBlock, markLessonCompleted, addPoints]
  );

  const handleNextLesson = useCallback(() => {
    const currentIdx = activeLessons.findIndex((l) => l.id === currentLesson.id);
    const nextLesson = activeLessons[currentIdx + 1];
    if (nextLesson) {
      advanceLesson(nextLesson.id);
      setShowLessonComplete(false);
    }
  }, [currentLesson, advanceLesson]);

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      advanceLesson(lessonId);
      setShowLessonComplete(false);
      setShowMobileNav(false);
    },
    [advanceLesson]
  );

  const handleResetProgress = useCallback(() => {
    resetSession();
    setShowLessonComplete(false);
  }, [resetSession]);

  const isLastLesson =
    activeLessons.findIndex((l) => l.id === currentLesson.id) === activeLessons.length - 1;

  if (showLanding) {
    return <Landing onStart={handleStartFromLanding} />;
  }

  return (
    <div className="lesson-page">
      <a href="#lesson-main-content" className="skip-link">
        Saltar al contenido de la lección
      </a>
      <WelcomeModal open={showWelcome} onClose={handleCloseWelcome} />
      <TrackSelector open={showTrackSelector} onSelect={handleSelectTrack} />
      <LevelChangeToast learnerState={profile.state} />
      <BadgeToast badgeId={badgeToastQueue[0]} onDismiss={dismissBadgeToast} />
      <BadgesPanel
        open={showBadgesPanel}
        onClose={() => setShowBadgesPanel(false)}
        points={points}
        streak={streak}
        unlockedBadges={unlockedBadges}
      />
      {dashboardMounted && (
        <Suspense fallback={null}>
          <ProgressDashboard
            open={showDashboard}
            onClose={() => setShowDashboard(false)}
            profile={profile}
            allLessons={activeLessons}
            completedLessons={completedLessons}
            points={points}
            streak={streak}
            codeRunsCount={codeRunsCount}
            perfectQuizCount={perfectQuizCount}
            unlockedBadgesCount={unlockedBadges.length}
          />
        </Suspense>
      )}
      {playgroundMounted && (
        <Suspense fallback={null}>
          <Playground open={showPlayground} onClose={() => setShowPlayground(false)} />
        </Suspense>
      )}
      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        track={track}
        totalLessons={activeLessons.length}
      />
      <EngineTransparencyPanel
        open={showTransparency}
        onClose={() => setShowTransparency(false)}
        profile={profile}
        latestDecision={latestDecision}
        decisionHistory={decisionHistory}
      />

      {/* Topbar solo visible en móvil: da acceso a la navegación que en
          desktop vive siempre visible en la barra lateral. Antes, en
          pantallas chicas, la barra lateral completa se ocultaba con
          `display: none` sin ningún reemplazo — un usuario en el celular no
          tenía forma de ver su progreso, puntos, racha o logros, ni de
          cambiar de lección o reiniciar el curso. */}
      <div className="mobile-topbar">
        <button
          onClick={() => setShowMobileNav(true)}
          className="mobile-topbar-menu-button"
          aria-label="Abrir menú de lecciones"
        >
          ☰
        </button>
        <span className="mobile-topbar-brand">
          <span className="sidebar-logo-mark">{track === 'typescript' ? 'TS' : 'JS'}</span> Adaptive
        </span>
        <div className="mobile-topbar-actions">
          <button
            onClick={() => setShowTransparency(true)}
            className="mobile-topbar-help-button"
            aria-label="Ver por qué el motor adaptó el contenido"
            title="Motor adaptativo"
          >
            🔍
          </button>
          <button
            onClick={toggleTheme}
            className="mobile-topbar-help-button"
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button
            onClick={toggleLanguage}
            className="mobile-topbar-help-button"
            aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a español'}
            title={language === 'es' ? 'English' : 'Español'}
          >
            {language === 'es' ? 'ES' : 'EN'}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="mobile-topbar-help-button"
            aria-label="Ayuda"
          >
            ?
          </button>
        </div>
      </div>

      {showMobileNav && (
        <div
          className="sidebar-backdrop"
          onClick={() => setShowMobileNav(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`lesson-sidebar ${showMobileNav ? 'lesson-sidebar--open' : ''}`}>
        <div className="sidebar-logo">
          <div>
            <div className="sidebar-logo-row">
              <span className="sidebar-logo-mark">{track === 'typescript' ? 'TS' : 'JS'}</span>
              <span className="sidebar-logo-text">Adaptive</span>
            </div>
            <p className="sidebar-tagline">Aprende a tu ritmo, de verdad</p>
            <button
              className="sidebar-switch-track-link"
              onClick={() => setShowTrackSelector(true)}
            >
              {t.sidebarSwitchTrack(track === 'typescript' ? 'TypeScript' : 'JavaScript')}
            </button>
          </div>
          <div className="sidebar-logo-actions">
            <button
              onClick={() => setShowTransparency(true)}
              className="sidebar-help-button"
              title="Motor adaptativo: por qué está pasando esto"
              aria-label="Ver por qué el motor adaptó el contenido"
            >
              🔍
            </button>
            <button
              onClick={toggleTheme}
              className="sidebar-help-button"
              title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button
              onClick={toggleLanguage}
              className="sidebar-help-button"
              title={language === 'es' ? 'English' : 'Español'}
              aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a español'}
            >
              {language === 'es' ? 'ES' : 'EN'}
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="sidebar-help-button"
              title="¿Cómo funciona esta plataforma?"
              aria-label="Ayuda"
            >
              ?
            </button>
            <button
              onClick={() => setShowMobileNav(false)}
              className="sidebar-mobile-close-button"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>
        </div>
        <SidebarStats
          userName={userName}
          points={points}
          streak={streak}
          completedCount={completedLessons.size}
          totalLessons={activeLessons.length}
          unlockedBadgesCount={unlockedBadges.length}
          onOpenBadges={() => setShowBadgesPanel(true)}
          onOpenDashboard={openDashboard}
          onOpenPlayground={openPlayground}
        />
        <LessonNav
          lessons={activeLessons}
          currentLessonId={currentLesson.id}
          currentBlockIndex={profile.currentBlockIndex}
          completedLessons={completedLessons}
          onSelectLesson={handleSelectLesson}
          onResetProgress={() => {
            handleResetProgress();
            setShowMobileNav(false);
          }}
          confidence={profile.confidence}
          learnerState={profile.state}
          startingLevel={startingLevel}
        />
      </aside>

      {/* Main content */}
      <main id="lesson-main-content" className="lesson-main" tabIndex={-1}>
        {/* Header de lección */}
        <div className="lesson-header">
          <div className="lesson-header-meta">
            <span className="lesson-number">
              {t.lessonNumberLabel(activeLessons.findIndex((l) => l.id === currentLesson.id) + 1)}
            </span>
            <BlockProgress
              blocks={currentLesson.blocks}
              currentIndex={profile.currentBlockIndex}
            />
          </div>
          <div>
            <h1 className="lesson-title">{currentLesson.title}</h1>
            <p className="lesson-subtitle">{currentLesson.subtitle}</p>
          </div>
        </div>

        {/* Lesson complete overlay */}
        <AnimatePresence mode="wait">
          {showLessonComplete && allLessonsCompleted && (
            <CourseCompleteScreen
              key="course-complete"
              userName={userName}
              points={points}
              streak={streak}
              unlockedBadges={unlockedBadges}
              totalLessons={activeLessons.length}
              trackLabel={track === 'typescript' ? 'TypeScript' : 'JavaScript'}
              missedItems={missedItems}
              onResolveMissedItem={(itemId) => resolveMissedItem(itemId, true)}
              onRestart={handleResetProgress}
            />
          )}
          {showLessonComplete && !allLessonsCompleted && isLastLesson && (
            <motion.div
              key="almost-done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="lesson-complete-card"
            >
              <div className="lesson-complete-icon">🧭</div>
              <h2 className="lesson-complete-title">
                Llegaste al final del recorrido
              </h2>
              <p className="lesson-complete-subtitle">
                Todavía te {remainingLessons.length === 1 ? 'falta' : 'faltan'}{' '}
                <strong>
                  {remainingLessons.length} {remainingLessons.length === 1 ? 'lección' : 'lecciones'}
                </strong>{' '}
                por completar para conseguir tu certificado — como empezaste desde un
                nivel más avanzado, quedaron sin cursar.
              </p>
              <div className="course-complete-actions">
                <button
                  onClick={() => handleSelectLesson(remainingLessons[0].id)}
                  className="btn-primary btn-lg"
                >
                  Completar lo que falta →
                </button>
                <button
                  onClick={() => setShowFinalExam(true)}
                  className="btn-primary btn-lg btn-review-pending"
                >
                  🎯 Rendir examen final
                </button>
              </div>
              <p className="course-complete-note">
                El examen final tiene una pregunta de cada lección del curso. Aprobarlo
                (70% o más) marca todo como completado sin tener que cursar cada
                lección una por una.
              </p>
            </motion.div>
          )}
          {showLessonComplete && !allLessonsCompleted && !isLastLesson && (
            <motion.div
              key="lesson-complete"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="lesson-complete-card"
            >
              <div className="lesson-complete-icon">🎉</div>
              <h2 className="lesson-complete-title">
                ¡Lección completada!
              </h2>
              <p className="lesson-complete-subtitle">
                Completaste <strong>{currentLesson.title}</strong>
              </p>
              <p className="lesson-complete-points">+50 puntos 🎉</p>
              <button onClick={handleNextLesson} className="btn-primary btn-lg">
                Siguiente lección →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <FinalExam
          open={showFinalExam}
          onClose={() => setShowFinalExam(false)}
          lessons={activeLessons}
          onPass={handlePassFinalExam}
        />

        {/* Adaptive lesson content */}
        {!showLessonComplete && (
          <AdaptiveLesson
            lesson={currentLesson}
            currentBlockIndex={profile.currentBlockIndex}
            onBlockComplete={handleBlockComplete}
          />
        )}
      </main>
    </div>
  );
}
