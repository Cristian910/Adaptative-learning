import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../testUtils';
import { FinalExam } from '../../../features/lesson/components/FinalExam';
import type { LessonContent } from '../../../types/domain';

function makeLessonWithQuiz(id: string, correctIndex: number): LessonContent {
  return {
    id,
    title: `Lección ${id}`,
    subtitle: '',
    level: 'base',
    track: 'javascript',
    prerequisites: [],
    blocks: [
      {
        id: `${id}-quiz`,
        type: 'quiz',
        estimatedMinutes: 2,
        variants: {
          base: [
            {
              id: `${id}-q1`,
              question: `¿Pregunta de ${id}?`,
              options: [`Opción correcta ${id}`, `Opción mala ${id} 1`, `Opción mala ${id} 2`, `Opción mala ${id} 3`],
              correctIndex,
              explanation: 'Explicación',
              commonMistakes: Object.fromEntries(
                [0, 1, 2, 3].filter((i) => i !== correctIndex).map((i) => [i, `Mal ${i}`])
              ),
            },
          ],
          simplified: [],
          advanced: [],
        },
      },
    ],
  };
}

// 2 lecciones, ambas con correctIndex 0 (la primera opción es siempre la
// correcta) — para poder controlar fácil si el examen se aprueba (elegir
// siempre la primera opción) o se reprueba (elegir siempre otra).
const LESSONS: LessonContent[] = [makeLessonWithQuiz('l1', 0), makeLessonWithQuiz('l2', 0)];

describe('FinalExam', () => {
  it('arma una pregunta por lección', () => {
    renderWithProviders(<FinalExam open lessons={LESSONS} onClose={vi.fn()} onPass={vi.fn()} />);
    expect(screen.getByText('¿Pregunta de l1?')).toBeInTheDocument();
    expect(screen.getByText('¿Pregunta de l2?')).toBeInTheDocument();
  });

  it('el botón de enviar está deshabilitado hasta responder todo', () => {
    renderWithProviders(<FinalExam open lessons={LESSONS} onClose={vi.fn()} onPass={vi.fn()} />);
    expect(screen.getByText('Enviar examen')).toBeDisabled();
  });

  it('responder todo correctamente aprueba y llama a onPass', () => {
    const onPass = vi.fn();
    renderWithProviders(<FinalExam open lessons={LESSONS} onClose={vi.fn()} onPass={onPass} />);

    fireEvent.click(screen.getByText('Opción correcta l1'));
    fireEvent.click(screen.getByText('Opción correcta l2'));
    fireEvent.click(screen.getByText('Enviar examen'));

    expect(onPass).toHaveBeenCalled();
    expect(screen.getByText(/Aprobaste con/)).toBeInTheDocument();
  });

  it('responder todo mal reprueba y NO llama a onPass', () => {
    const onPass = vi.fn();
    renderWithProviders(<FinalExam open lessons={LESSONS} onClose={vi.fn()} onPass={onPass} />);

    fireEvent.click(screen.getByText('Opción mala l1 1'));
    fireEvent.click(screen.getByText('Opción mala l2 1'));
    fireEvent.click(screen.getByText('Enviar examen'));

    expect(onPass).not.toHaveBeenCalled();
    expect(screen.getByText(/necesitas 70% para aprobar/)).toBeInTheDocument();
    expect(screen.getByText('Reintentar examen')).toBeInTheDocument();
  });

  it('no renderiza nada si open es false', () => {
    renderWithProviders(<FinalExam open={false} lessons={LESSONS} onClose={vi.fn()} onPass={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
