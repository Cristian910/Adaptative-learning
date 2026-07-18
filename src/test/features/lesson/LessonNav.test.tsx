import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testUtils';
import { LessonNav } from '../../../features/lesson/components/LessonNav';
import type { LessonContent } from '../../../types/domain';

function makeLesson(id: string, level: LessonContent['level'], prerequisites: string[]): LessonContent {
  return {
    id,
    title: `Lección ${id}`,
    subtitle: '',
    level,
    track: 'javascript',
    prerequisites,
    blocks: [],
  };
}

const LESSONS: LessonContent[] = [
  makeLesson('l1', 'base', []),
  makeLesson('l2', 'intermediate', ['l1']),
  makeLesson('l3', 'advanced', ['l2']),
];

function renderNav(overrides: Partial<React.ComponentProps<typeof LessonNav>> = {}) {
  const props: React.ComponentProps<typeof LessonNav> = {
    lessons: LESSONS,
    currentLessonId: 'l1',
    currentBlockIndex: 0,
    completedLessons: new Set(),
    onSelectLesson: vi.fn(),
    onResetProgress: vi.fn(),
    confidence: 0.5,
    learnerState: 'normal',
    startingLevel: 'base',
    ...overrides,
  };
  renderWithProviders(<LessonNav {...props} />);
  return props;
}

describe('LessonNav', () => {
  it('con startingLevel base, las lecciones sin completar prerequisites aparecen bloqueadas', () => {
    renderNav({ startingLevel: 'base', currentLessonId: 'l1', completedLessons: new Set() });

    const buttons = screen.getAllByRole('button').filter((b) => b.className.includes('lesson-nav-item'));
    const l2Button = buttons.find((b) => b.textContent?.includes('Lección l2'));
    const l3Button = buttons.find((b) => b.textContent?.includes('Lección l3'));

    expect(l2Button).toBeDisabled();
    expect(l3Button).toBeDisabled();
  });

  it('con startingLevel advanced, TODAS las lecciones quedan desbloqueadas aunque no estén completadas', () => {
    renderNav({ startingLevel: 'advanced', currentLessonId: 'l1', completedLessons: new Set() });

    const buttons = screen.getAllByRole('button').filter((b) => b.className.includes('lesson-nav-item'));
    for (const b of buttons) {
      expect(b).not.toBeDisabled();
    }
  });

  it('una lección completada nunca queda bloqueada, sin importar el nivel de inicio', () => {
    renderNav({
      startingLevel: 'base',
      currentLessonId: 'l3',
      completedLessons: new Set(['l1', 'l2']),
    });

    const buttons = screen.getAllByRole('button').filter((b) => b.className.includes('lesson-nav-item'));
    for (const b of buttons) {
      expect(b).not.toBeDisabled();
    }
  });

  it('agrupa las lecciones por nivel con encabezados de sección', () => {
    renderNav();
    expect(screen.getAllByText('Principiante').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Intermedio').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Avanzado').length).toBeGreaterThan(0);
  });
});
