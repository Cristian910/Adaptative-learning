import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrackSelector } from '../../../features/lesson/components/TrackSelector';

describe('TrackSelector', () => {
  it('no renderiza nada cuando open es false', () => {
    render(<TrackSelector open={false} onSelect={vi.fn()} />);
    expect(screen.queryByText('¿Qué quieres estudiar?')).not.toBeInTheDocument();
  });

  it('muestra el paso de elegir curso primero', () => {
    render(<TrackSelector open onSelect={vi.fn()} />);
    expect(screen.getByText('¿Qué quieres estudiar?')).toBeInTheDocument();
    expect(screen.getByText('JavaScript', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('TypeScript', { exact: true })).toBeInTheDocument();
  });

  it('al elegir un curso, pasa al paso de elegir nivel', async () => {
    render(<TrackSelector open onSelect={vi.fn()} />);
    fireEvent.click(screen.getByText('TypeScript', { exact: true }));

    // AnimatePresence mode="wait" hace exit-antes-de-enter: el paso nuevo no
    // aparece en el mismo tick sincrónico del click, incluso en jsdom.
    await waitFor(() => {
      expect(screen.getByText('¿Desde qué nivel arrancamos?')).toBeInTheDocument();
    });
    expect(screen.getByText('Principiante')).toBeInTheDocument();
    expect(screen.getByText('Intermedio')).toBeInTheDocument();
    expect(screen.getByText('Avanzado')).toBeInTheDocument();
  });

  it('al elegir curso y nivel, llama a onSelect con ambos valores', async () => {
    const onSelect = vi.fn();
    render(<TrackSelector open onSelect={onSelect} />);

    fireEvent.click(screen.getByText('TypeScript', { exact: true }));
    await waitFor(() => screen.getByText('Avanzado'));
    fireEvent.click(screen.getByText('Avanzado'));

    expect(onSelect).toHaveBeenCalledWith('typescript', 'advanced');
  });

  it('"elegir otro curso" vuelve al paso anterior sin llamar a onSelect', async () => {
    const onSelect = vi.fn();
    render(<TrackSelector open onSelect={onSelect} />);

    fireEvent.click(screen.getByText('JavaScript', { exact: true }));
    await waitFor(() => screen.getByText('← Elegir otro curso'));
    fireEvent.click(screen.getByText('← Elegir otro curso'));

    await waitFor(() => {
      expect(screen.getByText('¿Qué quieres estudiar?')).toBeInTheDocument();
    });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
