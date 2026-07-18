export type Language = 'es' | 'en';

export interface StringsShape {
  welcomeTitle: string;
  welcomeIntro: string;
  welcomeBullet1: string;
  welcomeBullet2: string;
  welcomeBullet3: string;
  welcomeBullet4: string;
  welcomeBullet5: string;
  welcomeBullet6: string;
  welcomeBullet7: string;
  welcomeFootnote: string;
  welcomeNamePlaceholder: string;
  welcomeStartButton: string;
  helpTitle: string;
  helpCloseButton: string;
  sidebarGreeting: (name: string) => string;
  sidebarProgressLabel: (percent: number, completed: number, total: number) => string;
  sidebarDashboardButton: string;
  sidebarPlaygroundButton: string;
  sidebarSwitchTrack: (track: string) => string;
  navResetButton: string;
  navFooterCompleted: (completed: number, total: number) => string;
  lessonNumberLabel: (n: number) => string;
  continueButton: string;
  quizTitle: string;
  quizCorrect: string;
  quizIncorrect: string;
  quizRetryButton: string;
  quizAllCorrect: string;
  codeRunButton: string;
  codeRunningLabel: string;
  codeResetButton: string;
  codeOutputLabel: string;
  codeErrorLabel: string;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
// Cubre el "camino principal" que recorre cualquiera que entra por primera
// vez: bienvenida, ayuda, sidebar, navegación de lecciones, y las
// interacciones core de quiz/código. Las pantallas más profundas (dashboard,
// certificado, playground, panel de transparencia, repaso) quedan en
// español por ahora — traducirlas es mecánicamente lo mismo que esto, pero
// se priorizó cobertura completa y consistente del recorrido principal en
// vez de una cobertura parcial de TODA la app.

export const STRINGS: Record<Language, StringsShape> = {
  es: {
    // WelcomeModal
    welcomeTitle: 'Bienvenido a JS Adaptive',
    welcomeIntro:
      'Este curso observa cómo interactúas con cada lección — tu velocidad, tus aciertos y errores en los quizzes, si te quedas trabado — y adapta el contenido automáticamente para ti.',
    welcomeBullet1: 'Si te cuesta un concepto, el contenido se simplifica solo.',
    welcomeBullet2: 'Si te quedas sin avanzar, puede aparecer una pista — generada con IA cuando está configurada, o una pista de respaldo si no.',
    welcomeBullet3: 'Si respondes mal un quiz varias veces, te llega una explicación alternativa (con IA si está disponible, o una fija si no).',
    welcomeBullet4: 'Si te va muy bien, se desbloquean variantes más avanzadas.',
    welcomeBullet5:
      'En los ejercicios de código, el resultado tiene que ser el correcto para poder avanzar — si te cuesta, aparecen pistas solas, y como último recurso, la solución.',
    welcomeBullet6:
      'Ganas puntos por cada quiz y ejercicio resuelto, que se traducen en un Rango (Novato → Maestro) y en logros para desbloquear.',
    welcomeBullet7:
      'Después de esto vas a elegir si quieres estudiar JavaScript o TypeScript, y desde qué nivel arrancar.',
    welcomeFootnote: 'No tienes que hacer nada especial — solo avanza por la lección con normalidad.',
    welcomeNamePlaceholder: '¿Cómo te llamas? (opcional)',
    welcomeStartButton: 'Entendido, empezar →',
    // HelpModal
    helpTitle: 'Cómo funciona esta plataforma',
    helpCloseButton: 'Entendido',
    // Sidebar
    sidebarGreeting: (name: string) => `Hola, ${name} 👋`,
    sidebarProgressLabel: (percent: number, completed: number, total: number) =>
      `${percent}% del curso · ${completed}/${total} lecciones`,
    sidebarDashboardButton: '📊 Ver mi dashboard',
    sidebarPlaygroundButton: '🧪 Práctica libre',
    sidebarSwitchTrack: (track: string) => `Curso: ${track} · cambiar`,
    // LessonNav
    navResetButton: '↺ Reiniciar progreso',
    navFooterCompleted: (completed: number, total: number) => `${completed}/${total} lecciones completadas`,
    // Lesson header
    lessonNumberLabel: (n: number) => `Lección ${n}`,
    continueButton: 'Continuar →',
    // Quiz
    quizTitle: 'Quiz',
    quizCorrect: 'Correcto.',
    quizIncorrect: 'No es correcto.',
    quizRetryButton: 'Intentar de nuevo',
    quizAllCorrect: '✓ Todas las preguntas respondidas correctamente',
    // Code
    codeRunButton: '▶ Ejecutar',
    codeRunningLabel: 'Ejecutando…',
    codeResetButton: '↺ Reiniciar',
    codeOutputLabel: '✓ Output',
    codeErrorLabel: '✕ Error',
  },
  en: {
    welcomeTitle: 'Welcome to JS Adaptive',
    welcomeIntro:
      "This course watches how you interact with each lesson — your speed, your right and wrong answers on quizzes, whether you get stuck — and adapts the content for you automatically.",
    welcomeBullet1: "If a concept is hard for you, the content simplifies itself.",
    welcomeBullet2: "If you get stuck, a hint may show up — AI-generated when configured, or a fallback hint if not.",
    welcomeBullet3: "If you answer a quiz wrong a few times, you get an alternative explanation (AI-powered when available, or a fixed one if not).",
    welcomeBullet4: "If you're doing great, more advanced variants unlock.",
    welcomeBullet5:
      "On code exercises, the output has to match the expected one to move on — if you're struggling, hints show up on their own, and as a last resort, the solution.",
    welcomeBullet6:
      'You earn points for every quiz and exercise you solve, which turn into a Rank (Novice → Master) and unlockable achievements.',
    welcomeBullet7: "After this you'll choose whether to study JavaScript or TypeScript, and from which level to start.",
    welcomeFootnote: "You don't need to do anything special — just go through the lesson normally.",
    welcomeNamePlaceholder: "What's your name? (optional)",
    welcomeStartButton: "Got it, let's start →",
    helpTitle: 'How this platform works',
    helpCloseButton: 'Got it',
    sidebarGreeting: (name: string) => `Hi, ${name} 👋`,
    sidebarProgressLabel: (percent: number, completed: number, total: number) =>
      `${percent}% of the course · ${completed}/${total} lessons`,
    sidebarDashboardButton: '📊 View my dashboard',
    sidebarPlaygroundButton: '🧪 Free practice',
    sidebarSwitchTrack: (track: string) => `Course: ${track} · switch`,
    navResetButton: '↺ Reset progress',
    navFooterCompleted: (completed: number, total: number) => `${completed}/${total} lessons completed`,
    lessonNumberLabel: (n: number) => `Lesson ${n}`,
    continueButton: 'Continue →',
    quizTitle: 'Quiz',
    quizCorrect: 'Correct.',
    quizIncorrect: "That's not correct.",
    quizRetryButton: 'Try again',
    quizAllCorrect: '✓ All questions answered correctly',
    codeRunButton: '▶ Run',
    codeRunningLabel: 'Running…',
    codeResetButton: '↺ Reset',
    codeOutputLabel: '✓ Output',
    codeErrorLabel: '✕ Error',
  },
};

export type StringKey = keyof StringsShape;
