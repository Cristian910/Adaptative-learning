import { useState, useCallback, useRef, useEffect } from 'react';

interface QuizState {
  [questionId: string]: {
    attempts: number;
    solved: boolean;
    selectedOption: string | null;
  };
}

interface UseLessonProgressReturn {
  currentQuizState: QuizState;
  recordQuizAttempt: (questionId: string, selectedOption: string, correct: boolean) => {
    attemptNumber: number;
    correct: boolean;
  };
  isBlockComplete: boolean;
  markBlockComplete: () => void;
  resetBlock: () => void;
  getAttemptCount: (questionId: string) => number;
  allQuestionsAnswered: (questionIds: string[]) => boolean;
}

export function useLessonProgress(blockId: string): UseLessonProgressReturn {
  const [quizState, setQuizState] = useState<QuizState>({});
  const [isBlockComplete, setIsBlockComplete] = useState(false);

  // Ref para leer el valor actual sin stale closures en callbacks
  const quizStateRef = useRef(quizState);
  quizStateRef.current = quizState;

  const recordQuizAttempt = useCallback(
    (questionId: string, selectedOption: string, correct: boolean) => {
      const current = quizStateRef.current[questionId] ?? {
        attempts: 0,
        solved: false,
        selectedOption: null,
      };

      const newAttempts = current.attempts + 1;

      setQuizState((prev) => ({
        ...prev,
        [questionId]: {
          attempts: newAttempts,
          solved: correct,
          selectedOption,
        },
      }));

      return { attemptNumber: newAttempts, correct };
    },
    []
  );

  const markBlockComplete = useCallback(() => {
    setIsBlockComplete(true);
  }, []);

  const resetBlock = useCallback(() => {
    setQuizState({});
    setIsBlockComplete(false);
  }, []);

  // Resetear automáticamente cuando cambia el bloque (nueva variante o nuevo bloque)
  useEffect(() => {
    setQuizState({});
    setIsBlockComplete(false);
  }, [blockId]);

  const getAttemptCount = useCallback((questionId: string) => {
    return quizStateRef.current[questionId]?.attempts ?? 0;
  }, []);

  const allQuestionsAnswered = useCallback((questionIds: string[]) => {
    return questionIds.every(
      (id) => quizStateRef.current[id]?.solved === true
    );
  }, []);

  return {
    currentQuizState: quizState,
    recordQuizAttempt,
    isBlockComplete,
    markBlockComplete,
    resetBlock,
    getAttemptCount,
    allQuestionsAnswered,
  };
}
