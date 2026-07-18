import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad de modal: hasta ahora, ningún modal del proyecto (Welcome,
 * TrackSelector, Help, Badges, Dashboard, Certificate, Review, Transparency)
 * atrapaba el foco, cerraba con Escape, o devolvía el foco a lo que estaba
 * antes al cerrarse — cosas básicas para navegación por teclado y lectores
 * de pantalla. En vez de repetir esta lógica en cada componente, vive aquí
 * una sola vez.
 *
 * @param open Si el modal está abierto
 * @param onClose Callback para cerrar (se llama al presionar Escape)
 * @returns ref para poner en el contenedor raíz del contenido del modal (la
 *          card, no el backdrop)
 */
export function useModalA11y<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const containerRef = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Foco inicial: el primer elemento enfocable dentro del modal, o el
    // propio contenedor si no hay ninguno (así el lector de pantalla anuncia
    // el modal igual).
    const container = containerRef.current;
    const focusables = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusables && focusables.length > 0 ? focusables[0] : container;
    // rAF: esperar a que Framer Motion termine de montar el contenido antes
    // de intentar enfocar — si no, a veces el elemento todavía no está en
    // el DOM en el mismo tick.
    const raf = requestAnimationFrame(() => first?.focus());

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !container) return;

      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) return;

      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      // Devolver el foco a donde estaba antes de abrir el modal — sin esto,
      // alguien navegando por teclado "pierde el lugar" cada vez que cierra
      // un modal.
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  return containerRef;
}
