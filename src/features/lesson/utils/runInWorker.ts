// ─── Ejecución aislada en Web Worker ──────────────────────────────────────────
// Antes esto corría con `new Function(...)` directo en el hilo principal: un
// `while (true) {}` en el código del alumno colgaba toda la pestaña sin forma
// de recuperarse. Corre en un Worker (ver codeRunner.worker.ts) con un
// timeout — si se cuelga, se termina y se muestra un error en vez de
// congelar la UI. Extraído a un módulo propio porque tanto CodeExample.tsx
// (ejercicios de lección) como Playground.tsx (práctica libre) necesitan
// exactamente la misma lógica de ejecución.

const CODE_TIMEOUT_MS = 5000;

export function runUserCode(code: string): Promise<{ output: string; error: string | null }> {
  return new Promise((resolve) => {
    let settled = false;
    const worker = new Worker(new URL('./codeRunner.worker.ts', import.meta.url), {
      type: 'module',
    });

    const finish = (result: { output: string; error: string | null }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      worker.terminate();
      resolve(result);
    };

    const timeoutId = setTimeout(() => {
      finish({
        output: '',
        error: `Timeout: el código tardó más de ${CODE_TIMEOUT_MS / 1000}s en ejecutarse (¿un loop infinito?)`,
      });
    }, CODE_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<{ output: string; error: string | null }>) => {
      finish(event.data);
    };

    worker.onerror = (event) => {
      finish({ output: '', error: event.message || 'Error desconocido al ejecutar el código' });
    };

    worker.postMessage({ code });
  });
}
