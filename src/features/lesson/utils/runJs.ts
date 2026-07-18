// ─── runJs ───────────────────────────────────────────────────────────────────
// Lógica pura de ejecución/formateo, separada del Worker (codeRunner.worker.ts)
// para que sea testeable directamente con Vitest sin necesitar un entorno de
// Worker real. El worker es solo un wrapper delgado de mensajes sobre esto.

import { transform } from 'sucrase';

export interface RunResult {
  output: string;
  error: string | null;
}

// El track de TypeScript reutiliza este mismo runner — antes de ejecutar,
// se le pasan los tipos/interfaces por sucrase (transform 'typescript'), que
// los elimina dejando JS plano y ejecutable. Se probó empíricamente (con
// interfaces, genéricos, anotaciones de tipo en parámetros/arrays) que el
// comportamiento en runtime queda idéntico al código sin tipos. Para código
// JS plano (el track existente) esto es un no-op seguro: sucrase no toca
// nada que no sea sintaxis específica de TS, así que ambos tracks comparten
// el mismo ejecutor sin necesidad de ramificar por track.
function stripTypeScript(code: string): string {
  try {
    return transform(code, { transforms: ['typescript'] }).code;
  } catch {
    // Si el transpile falla por algún motivo inesperado, se intenta ejecutar
    // el código tal cual — en el peor caso, el error que ve el usuario es el
    // mismo SyntaxError que vería sin este paso, no uno peor.
    return code;
  }
}

// Formatea valores igual que un console.log real (con espacios después de
// comas/dos puntos, strings anidados entre comillas) — JSON.stringify liso
// no alcanza: produce "[20,50,80]" sin espacios, distinto de lo que cualquier
// consola real muestra ("[20, 50, 80]") y de lo que los ejercicios esperan.
export function formatNested(value: unknown, seen: WeakSet<object>): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  const t = typeof value;
  if (t === 'string') return `'${(value as string).replace(/'/g, "\\'")}'`;
  if (t === 'number' || t === 'boolean' || t === 'bigint') return String(value);
  if (t === 'function') {
    const fn = value as (...args: unknown[]) => unknown;
    return `[Function: ${fn.name || 'anonymous'}]`;
  }
  if (t === 'object') {
    const obj = value as object;
    if (seen.has(obj)) return '[Circular]';
    seen.add(obj);
    if (Array.isArray(obj)) {
      return '[' + obj.map((v) => formatNested(v, seen)).join(', ') + ']';
    }
    if (obj instanceof Map) {
      const entries = Array.from(obj.entries()).map(
        ([k, v]) => `${formatNested(k, seen)} => ${formatNested(v, seen)}`
      );
      return `Map(${obj.size}) { ${entries.join(', ')} }`;
    }
    if (obj instanceof Set) {
      const entries = Array.from(obj.values()).map((v) => formatNested(v, seen));
      return `Set(${obj.size}) { ${entries.join(', ')} }`;
    }
    const entries = Object.entries(obj as Record<string, unknown>).map(
      ([k, v]) => `${k}: ${formatNested(v, seen)}`
    );
    if (entries.length === 0) return '{}';
    return '{ ' + entries.join(', ') + ' }';
  }
  return String(value);
}

export function serializeArg(a: unknown): string {
  // Como argumento de primer nivel, un string se imprime tal cual (sin
  // comillas) — igual que console.log("hola") muestra "hola", no "'hola'".
  if (typeof a === 'string') return a;
  try {
    return formatNested(a, new WeakSet());
  } catch {
    return String(a);
  }
}

// Ejecuta código arbitrario capturando console.log. Sin límite de tiempo aquí
// adentro — el timeout/cancelación vive en el nivel del Worker (o, en tests,
// simplemente no se corre código con loops infinitos).
export async function executeJsCode(code: string): Promise<RunResult> {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    logs.push(args.map(serializeArg).join(' '));
  };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (async function() {\n${stripTypeScript(code)}\n})();`);
    await fn();
    // Período de gracia: si el código dispara promesas "sueltas" (.then() sin
    // await, un patrón común y válido), este await por sí solo no las espera —
    // solo espera lo síncrono + el primer nivel de async. Sin este delay, se
    // pierde silenciosamente cualquier console.log() que ocurra en esas
    // promesas sueltas (el console.log ya está restaurado para cuando
    // resuelven). 50ms es suficiente para cualquier cadena de microtasks
    // razonable en un ejercicio educativo.
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { output: logs.join('\n'), error: null };
  } catch (e) {
    return {
      output: logs.join('\n'),
      error: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
    };
  } finally {
    console.log = originalLog;
  }
}
