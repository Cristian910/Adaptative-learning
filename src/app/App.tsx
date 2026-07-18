import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LessonPage } from './LessonPage';
import { ErrorBoundary } from './ErrorBoundary';
import { LanguageProvider } from './LanguageContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // No refetch automático — las respuestas de IA son determinísticas para un contexto dado
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <LessonPage />
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
