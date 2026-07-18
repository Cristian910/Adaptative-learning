import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useModalA11y } from '../../app/useModalA11y';

function TestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useModalA11y<HTMLDivElement>(open, onClose);
  if (!open) return null;
  return (
    <div ref={ref} data-testid="modal">
      <button data-testid="first">Primero</button>
      <button data-testid="second">Segundo</button>
      <button data-testid="last">Último</button>
    </div>
  );
}

function Harness({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div>
      <button data-testid="trigger">Abrir modal</button>
      <TestModal open={open} onClose={onClose} />
    </div>
  );
}

describe('useModalA11y', () => {
  it('mueve el foco al primer elemento enfocable del modal al abrirse', async () => {
    const { getByTestId } = render(<Harness open onClose={vi.fn()} />);
    await waitFor(() => {
      expect(getByTestId('first')).toHaveFocus();
    });
  });

  it('Escape llama a onClose', () => {
    const onClose = vi.fn();
    render(<Harness open onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('Tab desde el último elemento vuelve al primero (focus trap)', async () => {
    const { getByTestId } = render(<Harness open onClose={vi.fn()} />);
    await waitFor(() => expect(getByTestId('first')).toHaveFocus());

    const last = getByTestId('last');
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    await waitFor(() => {
      expect(getByTestId('first')).toHaveFocus();
    });
  });

  it('Shift+Tab desde el primer elemento va al último (focus trap inverso)', async () => {
    const { getByTestId } = render(<Harness open onClose={vi.fn()} />);
    await waitFor(() => expect(getByTestId('first')).toHaveFocus());

    const first = getByTestId('first');
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    await waitFor(() => {
      expect(getByTestId('last')).toHaveFocus();
    });
  });

  it('al cerrarse, devuelve el foco al elemento que lo tenía antes de abrir', async () => {
    const { getByTestId, rerender } = render(<Harness open={false} onClose={vi.fn()} />);
    const trigger = getByTestId('trigger');
    trigger.focus();
    expect(trigger).toHaveFocus();

    rerender(<Harness open onClose={vi.fn()} />);
    await waitFor(() => expect(getByTestId('first')).toHaveFocus());

    rerender(<Harness open={false} onClose={vi.fn()} />);
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
