import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'adaptive-learning-theme';

function readInitialTheme(): Theme {
  // En el primer render, document.documentElement.dataset.theme ya fue
  // seteado por el script inline de index.html (ver ahí el porqué) — así que
  // alcanza con leerlo de vuelta aquí para que el estado de React arranque en
  // sync con lo que ya está pintado en pantalla, sin ningún salto visual.
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
  }
  return 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage inaccesible — el tema simplemente no persiste entre
      // sesiones, pero la UI sigue funcionando con normalidad.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
