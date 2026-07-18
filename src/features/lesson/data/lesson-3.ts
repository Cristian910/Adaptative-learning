import type { LessonContent } from '../../../types/domain';

export const lesson3: LessonContent = {
  id: 'lesson-3',
  title: 'Promises y Async/Await',
  subtitle: 'Manejar operaciones que toman tiempo sin bloquear el programa',
  level: 'advanced',
  track: 'javascript',
  prerequisites: ['lesson-8'],
  blocks: [
    {
      id: 'lesson-3-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## El problema: esperar sin bloquear

Imagina que pides una pizza. Si tu programa "bloquea" mientras espera, no puedes hacer nada más hasta que llegue. Las **Promises** son la solución: le dices al programa "cuando llegue la pizza, haz esto", y mientras tanto puedes seguir haciendo otras cosas.

### Promesas: tres estados posibles

Una Promise puede estar en uno de tres estados:
- **Pendiente (pending)**: la pizza está en camino
- **Resuelta (fulfilled)**: la pizza llegó ✅  
- **Rechazada (rejected)**: la pizzería cerró ❌

\`\`\`js
// Crear una promesa
const miPromesa = new Promise((resolve, reject) => {
  const exito = true;
  
  if (exito) {
    resolve("¡Pizza llegó!");  // éxito
  } else {
    reject("Pizzería cerrada"); // error
  }
});

// Usar la promesa
miPromesa
  .then(resultado => console.log(resultado))  // si sale bien
  .catch(error => console.log(error));         // si hay error
\`\`\`

### async/await: leer promesas como código normal

\`\`\`js
async function pedirPizza() {
  try {
    const pizza = await miPromesa; // espera aquí, pero sin bloquear
    console.log(pizza);
  } catch (error) {
    console.log("Error:", error);
  }
}
\`\`\``,

        base: `## Promises y Async/Await

### El modelo de concurrencia de JavaScript

JavaScript es **single-threaded**: ejecuta una sola operación a la vez. Las operaciones asíncronas (I/O, timers, fetch) se delegan al entorno del runtime (browser/Node), y sus callbacks se encolan en el **Event Loop** para ejecutarse cuando el call stack está vacío.

### Promises

Una Promise representa el resultado eventual de una operación asíncrona:

\`\`\`js
// Constructor: recibe executor function con resolve y reject
const fetchUsuario = (id) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) {
      resolve({ id, nombre: "Ana" });
    } else {
      reject(new Error("ID inválido"));
    }
  }, 1000);
});

// Consumir con .then()/.catch()/.finally()
fetchUsuario(1)
  .then(usuario => usuario.nombre)      // transforma el valor
  .then(nombre => console.log(nombre))  // usa el valor transformado
  .catch(error => console.error(error)) // maneja cualquier error en la cadena
  .finally(() => console.log("listo")); // siempre se ejecuta
\`\`\`

### Async/Await

Syntactic sugar sobre Promises. Una función async siempre retorna una Promise:

\`\`\`js
async function cargarPerfil(userId) {
  try {
    const usuario = await fetchUsuario(userId);
    const posts = await fetchPosts(usuario.id);    // secuencial — espera al anterior
    return { usuario, posts };
  } catch (error) {
    console.error('Error cargando perfil:', error);
    throw error; // re-throw para que el caller pueda manejarlo
  }
}
\`\`\`

### Paralelismo con Promise.all

\`\`\`js
// ❌ Secuencial (innecesariamente lento si son independientes)
const usuario = await fetchUsuario(1);  // 1 segundo
const config = await fetchConfig();     // 1 segundo más
// Total: 2 segundos

// ✅ Paralelo
const [usuario, config] = await Promise.all([
  fetchUsuario(1),   // ambas inician simultáneamente
  fetchConfig(),     // 
]);
// Total: ~1 segundo (el más lento de los dos)
\`\`\``,

        advanced: `## Promises, Async/Await y el Event Loop

### El Event Loop en detalle

\`\`\`
Call Stack → (vacío) → Microtask Queue → Macrotask Queue
\`\`\`

Los **microtasks** (resoluciones de Promise, queueMicrotask) se procesan completos antes del siguiente macrotask (setTimeout, setInterval, I/O). Esto tiene implicaciones importantes:

\`\`\`js
console.log('1');

setTimeout(() => console.log('2'), 0); // macrotask

Promise.resolve().then(() => console.log('3')); // microtask

console.log('4');

// Output: 1, 4, 3, 2
// El microtask (3) se ejecuta antes del macrotask (2)
// aunque setTimeout sea 0ms
\`\`\`

### Promise internals y thenable protocol

Cualquier objeto con un método \`then\` es un **thenable** y puede ser awaited:

\`\`\`js
// Promise.resolve() unwrappea thenables
const thenable = {
  then(resolve: (v: string) => void) {
    resolve("soy un thenable");
  }
};

const result = await Promise.resolve(thenable);
console.log(result); // "soy un thenable"
\`\`\`

### Manejo de errores robusto

\`\`\`js
// Patrón: Result type en lugar de try/catch por todas partes
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

async function safeAsync<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    return { ok: true, value: await promise };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

const result = await safeAsync(fetchUsuario(1));
if (result.ok) {
  console.log(result.value.nombre);
} else {
  console.error(result.error.message);
}
\`\`\`

### Promise combinators

\`\`\`js
// Promise.all — falla si alguna falla
const [a, b] = await Promise.all([p1, p2]);

// Promise.allSettled — espera todas, sin fallar
const results = await Promise.allSettled([p1, p2]);
results.forEach(r => r.status === 'fulfilled' 
  ? console.log(r.value) 
  : console.error(r.reason));

// Promise.race — resuelve/rechaza con la primera que termine
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('timeout')), 5000));
const result2 = await Promise.race([fetchData(), timeout]);

// Promise.any — resuelve con la primera que tenga éxito
const fastest = await Promise.any([mirror1, mirror2, mirror3]);
\`\`\``,
      },
    },

    {
      id: 'lesson-3-code',
      type: 'code',
      estimatedMinutes: 7,
      variants: {
        simplified: {
          id: 'code-3-simplified',
          title: 'Tu primera promesa',
          description:
            'Completa la función para que retorne una Promise que resuelve con un saludo.',
          code: `function saludarAsync(nombre) {
  // Retorna una Promise que:
  // - Si nombre no está vacío: resolve con "Hola, {nombre}!"
  // - Si nombre está vacío: reject con "El nombre no puede estar vacío"
  
  return new Promise((resolve, reject) => {
    // Tu código aquí
  });
}

// Usarla
saludarAsync("Ana")
  .then(saludo => console.log(saludo))
  .catch(error => console.log("Error:", error));

saludarAsync("")
  .then(saludo => console.log(saludo))
  .catch(error => console.log("Error:", error));`,
          expectedOutput: 'Hola, Ana!\nError: El nombre no puede estar vacío',
          hints: [
            "Comprueba si nombre está vacío: if (nombre === '') { reject(...) }",
            'Si no está vacío, llama resolve con el string de saludo',
          ],
          solution: `function saludarAsync(nombre) {
  return new Promise((resolve, reject) => {
    if (nombre === '') {
      reject('El nombre no puede estar vacío');
    } else {
      resolve('Hola, ' + nombre + '!');
    }
  });
}

saludarAsync("Ana")
  .then(saludo => console.log(saludo))
  .catch(error => console.log("Error:", error));

saludarAsync("")
  .then(saludo => console.log(saludo))
  .catch(error => console.log("Error:", error));`,
        },
        base: {
          id: 'code-3-base',
          title: 'Retry con backoff exponencial',
          description:
            'Implementa una función que reintente una promesa N veces con espera creciente.',
          code: `function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, maxRetries = 3, baseDelayMs = 100) {
  // Intenta llamar fn() hasta maxRetries veces
  // Si falla, espera baseDelayMs * 2^intento antes del siguiente intento
  // Si agotas los reintentos, tira el último error
  // Si tiene éxito, retorna el resultado
  
  // Tu implementación aquí
}

// Test: función que falla las primeras 2 veces
let intentos = 0;
const fnInestable = () => new Promise((resolve, reject) => {
  intentos++;
  if (intentos < 3) {
    reject(new Error(\`Fallo intento \${intentos}\`));
  } else {
    resolve(\`Éxito en intento \${intentos}\`);
  }
});

try {
  const resultado = await withRetry(fnInestable);
  console.log(resultado);
} catch (err) {
  console.log("Todos los intentos fallaron:", err.message);
}`,
          expectedOutput: 'Éxito en intento 3',
          hints: [
            'Usa un loop for con await sleep() para el delay entre reintentos',
            'Guarda el último error en una variable y tírala si se agotan los intentos',
          ],
          solution: `function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, maxRetries = 3, baseDelayMs = 100) {
  let lastError;
  for (let intento = 1; intento <= maxRetries; intento++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (intento < maxRetries) {
        await sleep(baseDelayMs * Math.pow(2, intento));
      }
    }
  }
  throw lastError;
}

let intentos = 0;
const fnInestable = () => new Promise((resolve, reject) => {
  intentos++;
  if (intentos < 3) {
    reject(new Error(\`Fallo intento \${intentos}\`));
  } else {
    resolve(\`Éxito en intento \${intentos}\`);
  }
});

try {
  const resultado = await withRetry(fnInestable);
  console.log(resultado);
} catch (err) {
  console.log("Todos los intentos fallaron:", err.message);
}`,
        },
        advanced: {
          id: 'code-3-advanced',
          title: 'Implementar Promise.all desde cero',
          description:
            'Implementa myPromiseAll sin usar Promise.all — manteniendo la semántica exacta.',
          code: `function myPromiseAll(promises) {
  // Implementa con la semántica exacta de Promise.all:
  // - Resuelve cuando TODAS las promesas resuelven, con array de resultados en orden
  // - Rechaza inmediatamente si CUALQUIER promesa rechaza, con el primer error
  // - Acepta no-promesas en el array (los trata como ya resueltos)
  // - Array vacío → resuelve con []
  
  return new Promise((resolve, reject) => {
    // Tu implementación aquí
  });
}

// Tests
myPromiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(console.log); // [1, 2, 3]

myPromiseAll([
  Promise.resolve("a"),
  Promise.reject(new Error("fallo")),
  Promise.resolve("c"),
]).catch(e => console.log(e.message)); // "fallo"

myPromiseAll([]).then(console.log); // []

myPromiseAll([1, 2, Promise.resolve(3)]).then(console.log); // [1, 2, 3]`,
          expectedOutput: '[]\n[1, 2, 3]\nfallo\n[1, 2, 3]',
          hints: [
            'Necesitas un contador de cuántas promesas ya resolvieron',
            'Guarda los resultados en un array en el índice correcto (no en orden de resolución)',
          ],
          solution: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    const results = new Array(promises.length);
    let completed = 0;
    promises.forEach((p, index) => {
      Promise.resolve(p).then((value) => {
        results[index] = value;
        completed++;
        if (completed === promises.length) {
          resolve(results);
        }
      }, reject);
    });
  });
}

myPromiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(console.log);

myPromiseAll([
  Promise.resolve("a"),
  Promise.reject(new Error("fallo")),
  Promise.resolve("c"),
]).catch(e => console.log(e.message));

myPromiseAll([]).then(console.log);

myPromiseAll([1, 2, Promise.resolve(3)]).then(console.log);`,
        },
      },
    },

    {
      id: 'lesson-3-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'l3-q1-simple',
            question: '¿Cuáles son los tres estados posibles de una Promise?',
            options: [
              'inicio, ejecución, fin',
              'loading, success, error',
              'pending, fulfilled, rejected',
              'open, closed, done',
            ],
            correctIndex: 2,
            explanation:
              'Una Promise siempre está en uno de estos tres estados: pending (esperando), fulfilled (resuelta con éxito) o rejected (rechazada con error). Una vez que pasa de pending a fulfilled o rejected, no puede cambiar de estado.',
            commonMistakes: {
              0: 'Esos no son estados de Promise. Describen fases de ejecución genéricas.',
              1: 'loading/success/error son patrones de UI comunes, pero no los estados reales de la Promise API.',
              3: 'open/closed/done son estados de WebSockets o streams, no de Promises.',
            },
          },
          {
            id: 'l3-q2-simple',
            question: '¿Qué hace `await` frente a una Promise?',
            options: [
              'Cancela la promesa si tarda mucho',
              'Pausa la ejecución de la función async hasta que la promesa resuelva',
              'Ejecuta la promesa en un thread separado',
              'Convierte la promesa en un valor síncrono permanentemente',
            ],
            correctIndex: 1,
            explanation:
              'await pausa la ejecución de la función async (no del programa completo) hasta que la Promise resuelva. Durante esa pausa, el Event Loop puede procesar otros eventos. Cuando resuelve, la función continúa con el valor resuelto.',
            commonMistakes: {
              0: 'await no tiene timeout ni cancela nada. Solo espera el resultado.',
              2: 'JavaScript es single-threaded. No hay threads separados. La asincronía viene del Event Loop.',
              3: 'El valor solo es accesible dentro de la función async con await. No se convierte en síncrono globalmente.',
            },
          },
          {
            id: 'l3-q3-simple',
            question:
              '¿Cuándo usarías `Promise.all` en lugar de `await` uno por uno?',
            options: [
              'Cuando quieres que las operaciones se ejecuten en orden estricto',
              'Cuando una operación depende del resultado de la anterior',
              'Cuando solo te importa el resultado de la más rápida',
              'Cuando quieres que las operaciones se ejecuten en paralelo para ser más rápido',
            ],
            correctIndex: 3,
            explanation:
              'Promise.all inicia todas las promesas al mismo tiempo. Si tienes 3 operaciones de 1 segundo cada una que son independientes, await en secuencia tarda 3 segundos; Promise.all tarda ~1 segundo.',
            commonMistakes: {
              0: 'Para orden estricto, await en secuencia es lo correcto, no Promise.all.',
              1: 'Si una depende de la anterior, necesitas await secuencial, no Promise.all.',
              2: 'Para quedarte solo con la más rápida, usas Promise.race o Promise.any.',
            },
          },
        ],
        base: [
          {
            id: 'l3-q1-base',
            question:
              '¿Qué imprime este código?\n\n```js\nasync function ejemplo() {\n  console.log("A");\n  await Promise.resolve();\n  console.log("B");\n}\nejemplo();\nconsole.log("C");\n```',
            options: [
              'A, B, C',
              'A, C, B',
              'C, A, B',
              'B, A, C',
            ],
            correctIndex: 1,
            explanation:
              'ejemplo() comienza sincrónico e imprime "A". El await suspende la función y devuelve control al caller. El caller imprime "C". Luego el microtask queue procesa la continuación de ejemplo() e imprime "B". Orden: A, C, B.',
            commonMistakes: {
              0: 'await suspende la función async, no el programa. El código que sigue a la llamada de ejemplo() continúa.',
              2: 'La función async comienza a ejecutarse inmediatamente, de forma síncrona hasta el primer await.',
              3: '"B" solo puede imprimirse después de que la Promise resuelva, lo que ocurre después de "C".',
            },
          },
          {
            id: 'l3-q2-base',
            question:
              '¿Qué ocurre si una Promise dentro de `Promise.all` rechaza?',
            options: [
              'Promise.all espera que todas terminen antes de reportar el error',
              'Promise.all rechaza inmediatamente con el primer error, ignorando las demás',
              'Promise.all resuelve con los valores que sí funcionaron',
              'Promise.all reintenta la promesa que falló automáticamente',
            ],
            correctIndex: 1,
            explanation:
              'Promise.all tiene semántica "todo o nada": en cuanto cualquier promesa rechaza, el resultado completo rechaza con ese error. Las otras promesas siguen ejecutándose (no se cancelan), pero sus resultados se ignoran.',
            commonMistakes: {
              0: 'Promise.allSettled es el que espera a todas sin importar errores. Promise.all falla rápido.',
              2: 'Eso sería Promise.allSettled. Promise.all no da resultados parciales.',
              3: 'Promise.all no tiene lógica de retry. Usarías una función de retry propia.',
            },
          },
          {
            id: 'l3-q3-base',
            question:
              '¿Cuál es la diferencia entre `.catch(handler)` y el segundo parámetro de `.then(null, handler)`?',
            options: [
              'Son idénticos en todos los casos',
              '.catch solo funciona con errores de red; el segundo parámetro de .then con cualquier error',
              'El segundo parámetro de .then es más moderno y debería usarse siempre',
              '.catch también captura errores lanzados en el .then anterior; el segundo parámetro de .then no',
            ],
            correctIndex: 3,
            explanation:
              '.catch(handler) equivale a .then(undefined, handler), pero hay una diferencia clave: si escribes .then(onFulfilled, onRejected), el onRejected NO captura errores lanzados por onFulfilled. .catch() al final de la cadena sí los captura porque es un .then() separado que viene después.',
            commonMistakes: {
              0: 'No son idénticos. La diferencia está en si capturan errores del handler anterior.',
              1: 'Ambos capturan cualquier tipo de error/rejection, no solo errores de red.',
              2: 'El segundo parámetro de .then() tiene un caso de uso específico pero no es "más moderno". .catch() es más seguro en la mayoría de casos.',
            },
          },
        ],
        advanced: [
          {
            id: 'l3-q1-advanced',
            question:
              '¿Por qué los microtasks (Promises) se procesan antes que los macrotasks (setTimeout)?\n\n```js\nsetTimeout(() => console.log("macro"), 0);\nPromise.resolve().then(() => console.log("micro"));\n// Output: micro, macro\n```',
            options: [
              'Porque el Event Loop drena la Microtask Queue completa después de cada macrotask',
              'Porque Promise es más nuevo que setTimeout en la spec',
              'Porque 0ms en setTimeout significa "después de las promesas"',
              'Porque las Promises usan un thread separado más rápido',
            ],
            correctIndex: 0,
            explanation:
              'El Event Loop funciona así: ejecuta un macrotask → drena completamente la Microtask Queue (procesando todos los microtasks, incluyendo los que se encolan durante el proceso) → renderiza si es necesario → toma el siguiente macrotask. Por eso los microtasks siempre van antes del siguiente macrotask, independientemente del timing.',
            commonMistakes: {
              1: 'La antigüedad en la spec no determina el orden de ejecución.',
              2: '0ms significa "lo más pronto posible como macrotask", pero los microtasks pendientes van antes.',
              3: 'JavaScript es single-threaded. No hay threads separados para Promises.',
            },
          },
          {
            id: 'l3-q2-advanced',
            question:
              '¿Qué problema tiene este código con async/await?\n\n```js\nasync function cargarTodo() {\n  const a = await fetch("/api/a");\n  const b = await fetch("/api/b");\n  const c = await fetch("/api/c");\n  return [a, b, c];\n}\n```',
            options: [
              'Ninguno — es la forma correcta de hacer múltiples fetches',
              'Debería usar Promise.race para mayor velocidad',
              'fetch no es compatible con async/await',
              'Los fetches son secuenciales cuando podrían ser paralelos',
            ],
            correctIndex: 3,
            explanation:
              'Cada await espera al anterior antes de iniciar el siguiente. Si cada fetch tarda 500ms, el total es ~1500ms. Como los tres son independientes, deberían iniciarse en paralelo: const [a, b, c] = await Promise.all([fetch("/api/a"), fetch("/api/b"), fetch("/api/c")]). Tiempo total: ~500ms.',
            commonMistakes: {
              0: 'Funciona, pero es innecesariamente lento para requests independientes.',
              1: 'Promise.race solo retorna el primero que resuelve. No sirve para necesitar todos los resultados.',
              2: 'fetch es completamente compatible con async/await — retorna una Promise.',
            },
          },
          {
            id: 'l3-q3-advanced',
            question:
              '¿Qué ocurre si haces `await` sobre un valor no-Promise (un número, un objeto, etc.)?',
            options: [
              'Lanza un TypeError — await solo funciona con Promises',
              'Se comporta como await Promise.resolve(valor) — resuelve inmediatamente con ese valor',
              'El valor se ignora y await devuelve undefined',
              'Se convierte a Promise automáticamente pero en el siguiente tick',
            ],
            correctIndex: 1,
            explanation:
              'await envuelve cualquier valor no-thenable en Promise.resolve(). Esto significa que await 42 es equivalente a await Promise.resolve(42), que resuelve en el mismo microtask tick con el valor 42. Es una característica intencional que hace al código más robusto.',
            commonMistakes: {
              0: 'JavaScript no lanza error — await sobre cualquier valor es válido.',
              2: 'await devuelve el valor tal cual, no undefined.',
              3: 'Aunque técnicamente pasa por la Microtask Queue, el efecto es "inmediato" desde la perspectiva del código. No hay un tick adicional observable.',
            },
          },
        ],
      },
    },
  ],
};
