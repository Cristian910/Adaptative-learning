// ─── Code Runner Worker ─────────────────────────────────────────────────────
// Ejecuta el código del alumno en un hilo separado. Antes esto corría con
// `new Function(...)` directo en el hilo principal: un `while (true) {}` en el
// código del alumno colgaba toda la pestaña, sin forma de recuperarse.
// Corriéndolo en un Worker, el hilo principal sigue respondiendo y puede
// terminar el worker (worker.terminate()) si se pasa de un timeout.
//
// La lógica real de ejecución/formateo vive en runJs.ts (módulo puro, sin
// dependencias de Worker) para poder testearla directamente con Vitest — aquí
// solo queda el wrapper de mensajes.

import { executeJsCode } from './runJs';

interface RunMessage {
  code: string;
}

self.onmessage = async (event: MessageEvent<RunMessage>) => {
  const { code } = event.data;
  const result = await executeJsCode(code);
  (self as unknown as Worker).postMessage(result);
};
