import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

// ─── ErrorBoundary ──────────────────────────────────────────────────────────
// Sin esto, cualquier excepción no controlada en el árbol de React (un bug en
// una lección, un dato malformado, lo que sea) tira toda la app a una pantalla
// en blanco sin ningún mensaje. Con esto, el usuario ve una pantalla de error
// recuperable en vez de quedar perdido preguntándose "¿por qué no aparece nada?".

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Excepción no controlada:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetProgress = () => {
    try {
      localStorage.removeItem('adaptive-learning-session');
    } catch {
      // localStorage puede no estar disponible (modo privado, etc.) — no es crítico
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">⚠️</div>
            <h2 className="error-boundary-title">Algo salió mal</h2>
            <p className="error-boundary-message">
              La aplicación encontró un error inesperado y no puede continuar en este estado.
            </p>
            {this.state.errorMessage && (
              <pre className="error-boundary-detail">{this.state.errorMessage}</pre>
            )}
            <div className="error-boundary-actions">
              <button onClick={this.handleReload} className="btn-primary btn-lg">
                Recargar la página
              </button>
              <button onClick={this.handleResetProgress} className="btn-ghost btn-sm">
                Reiniciar progreso y recargar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
