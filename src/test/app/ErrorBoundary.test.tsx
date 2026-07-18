import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../app/ErrorBoundary';

function Bomb(): never {
  throw new Error('Explosión de prueba');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza a los hijos normalmente cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <div>Contenido normal</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Contenido normal')).toBeInTheDocument();
  });

  it('muestra una pantalla de error recuperable en vez de quedar en blanco', () => {
    // React loguea el error a console.error — lo silenciamos para no ensuciar la salida del test
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Recargar la página')).toBeInTheDocument();
    expect(screen.getByText('Reiniciar progreso y recargar')).toBeInTheDocument();
  });

  it('muestra el mensaje del error para poder diagnosticarlo', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Explosión de prueba')).toBeInTheDocument();
  });
});
