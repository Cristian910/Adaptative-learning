import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../testUtils';
import { SidebarStats } from '../../../features/lesson/components/SidebarStats';

function renderStats(overrides: Partial<React.ComponentProps<typeof SidebarStats>> = {}) {
  const props: React.ComponentProps<typeof SidebarStats> = {
    userName: 'Ada',
    points: 40,
    streak: 3,
    completedCount: 2,
    totalLessons: 10,
    unlockedBadgesCount: 1,
    onOpenBadges: vi.fn(),
    onOpenDashboard: vi.fn(),
    onOpenPlayground: vi.fn(),
    ...overrides,
  };
  renderWithProviders(<SidebarStats {...props} />);
  return props;
}

describe('SidebarStats', () => {
  it('saluda por el nombre cuando hay uno', () => {
    renderStats({ userName: 'Ada' });
    expect(screen.getByText('Hola, Ada 👋')).toBeInTheDocument();
  });

  it('no muestra saludo si no hay nombre', () => {
    renderStats({ userName: null });
    expect(screen.queryByText(/^Hola,/)).not.toBeInTheDocument();
  });

  it('calcula y muestra el porcentaje de progreso correctamente', () => {
    renderStats({ completedCount: 3, totalLessons: 10 });
    expect(screen.getByText(/30% del curso · 3\/10 lecciones/)).toBeInTheDocument();
  });

  it('no divide por cero si totalLessons es 0', () => {
    renderStats({ completedCount: 0, totalLessons: 0 });
    expect(screen.getByText(/0% del curso · 0\/0 lecciones/)).toBeInTheDocument();
  });

  it('llama a onOpenBadges al hacer click en el botón de rango', () => {
    const props = renderStats();
    fireEvent.click(screen.getByText('⭐').closest('button')!);
    expect(props.onOpenBadges).toHaveBeenCalled();
  });

  it('llama a onOpenDashboard y onOpenPlayground con sus respectivos botones', () => {
    const props = renderStats();
    fireEvent.click(screen.getByText('📊 Ver mi dashboard'));
    fireEvent.click(screen.getByText('🧪 Práctica libre'));
    expect(props.onOpenDashboard).toHaveBeenCalled();
    expect(props.onOpenPlayground).toHaveBeenCalled();
  });
});
