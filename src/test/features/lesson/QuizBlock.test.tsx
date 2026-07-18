import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../testUtils';
import { QuizBlock } from '../../../features/lesson/components/QuizBlock';
import type { QuizQuestion } from '../../../types/domain';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: '¿Cuánto es 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctIndex: 1,
    explanation: '2 + 2 es 4.',
    commonMistakes: { 0: 'No, es más que eso.', 2: 'No, es menos que eso.', 3: 'No, es menos que eso.' },
  },
];

function renderQuiz(overrides: Partial<React.ComponentProps<typeof QuizBlock>> = {}) {
  const props: React.ComponentProps<typeof QuizBlock> = {
    questions: QUESTIONS,
    onAnswer: vi.fn(),
    onComplete: vi.fn(),
    onPerfectQuiz: vi.fn(),
    showEncouragement: false,
    canRequestEasier: true,
    onRequestEasier: vi.fn(),
    onQuestionMissed: vi.fn(),
    onQuestionResolved: vi.fn(),
    ...overrides,
  };
  renderWithProviders(<QuizBlock {...props} />);
  return props;
}

describe('QuizBlock', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra la pregunta y las opciones', () => {
    renderQuiz();
    expect(screen.getByText('¿Cuánto es 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('al elegir la opción correcta, avisa onAnswer(true) y muestra el botón de continuar', () => {
    const props = renderQuiz();
    fireEvent.click(screen.getByText('4'));

    expect(props.onAnswer).toHaveBeenCalledWith('q1', true, 1, '4');
    expect(screen.getByText(/Todas las preguntas respondidas correctamente/)).toBeInTheDocument();
  });

  it('al elegir una opción incorrecta, avisa onQuestionMissed y muestra "Intentar de nuevo"', () => {
    const props = renderQuiz();
    fireEvent.click(screen.getByText('3'));

    expect(props.onAnswer).toHaveBeenCalledWith('q1', false, 1, '3');
    expect(props.onQuestionMissed).toHaveBeenCalledWith('q1');
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
    expect(screen.getByText('No, es más que eso.')).toBeInTheDocument();
  });

  it('resolver la pregunta después de haberla fallado antes llama a onQuestionResolved', () => {
    const props = renderQuiz();
    fireEvent.click(screen.getByText('3')); // falla
    fireEvent.click(screen.getByText('Intentar de nuevo'));
    fireEvent.click(screen.getByText('4')); // acierta

    expect(props.onQuestionResolved).toHaveBeenCalledWith('q1');
  });

  it('tras 3 intentos fallidos, revela la respuesta automáticamente', () => {
    renderQuiz();

    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('Intentar de nuevo'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('Intentar de nuevo'));
    fireEvent.click(screen.getByText('3'));

    expect(screen.getByText(/La respuesta correcta es/)).toBeInTheDocument();
  });

  it('si hay una variante más fácil disponible, ofrece pasar a otra pregunta en vez de revelar sin más', () => {
    const props = renderQuiz({ canRequestEasier: true });

    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('Intentar de nuevo'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('Intentar de nuevo'));
    fireEvent.click(screen.getByText('3'));

    const easierBtn = screen.getByText(/pregunta más fácil/);
    fireEvent.click(easierBtn);
    expect(props.onRequestEasier).toHaveBeenCalled();
  });

  it('si NO hay variante más fácil (ya está en la más simple), ofrece confirmar la correcta para continuar', () => {
    renderQuiz({ canRequestEasier: false });

    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('Intentar de nuevo'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('Intentar de nuevo'));
    fireEvent.click(screen.getByText('3'));

    expect(screen.getByText('Entendido, continuar →')).toBeInTheDocument();
    expect(screen.queryByText(/pregunta más fácil/)).not.toBeInTheDocument();
  });
});
