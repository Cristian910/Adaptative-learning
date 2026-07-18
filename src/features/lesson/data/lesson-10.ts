import type { LessonContent } from '../../../types/domain';

export const lesson10: LessonContent = {
  id: 'lesson-10',
  title: 'Manejo de Errores y Patrones Asíncronos Avanzados',
  subtitle: 'Cómo escribir código que falla con elegancia, no con un cuelgue',
  level: 'advanced',
  track: 'javascript',
  prerequisites: ['lesson-9'],
  blocks: [
    {
      id: 'lesson-10-explanation',
      type: 'explanation',
      estimatedMinutes: 7,
      variants: {
        simplified: `## try / catch: capturar errores

Cuando algo puede fallar, envuélvelo en \`try\` y maneja el error en \`catch\`:

\`\`\`js
function dividir(a, b) {
  if (b === 0) {
    throw new Error('No se puede dividir por cero');
  }
  return a / b;
}

try {
  console.log(dividir(10, 2)); // 5
  console.log(dividir(10, 0)); // esto tira el error
} catch (error) {
  console.log('Error:', error.message);
}
\`\`\`

- \`throw\` lanza un error manualmente.
- El código dentro de \`try\` se ejecuta normalmente hasta que algo falla.
- Si algo falla, salta inmediatamente a \`catch\`, sin ejecutar el resto del \`try\`.
- \`finally\` (opcional) se ejecuta siempre, haya error o no.

\`\`\`js
try {
  arriesgado();
} catch (error) {
  console.log('Falló:', error.message);
} finally {
  console.log('Esto se ejecuta siempre');
}
\`\`\``,

        base: `## Errores personalizados

Puedes crear tus propios tipos de error extendiendo la clase \`Error\`:

\`\`\`js
class ValidationError extends Error {
  constructor(message, campo) {
    super(message);
    this.name = 'ValidationError';
    this.campo = campo; // información extra específica de tu error
  }
}

function validarEdad(edad) {
  if (typeof edad !== 'number') {
    throw new ValidationError('La edad debe ser un número', 'edad');
  }
  return true;
}

try {
  validarEdad('veinte');
} catch (error) {
  console.log(error.name);    // 'ValidationError'
  console.log(error.message); // 'La edad debe ser un número'
  console.log(error.campo);   // 'edad'
}
\`\`\`

Esto permite distinguir tipos de error y reaccionar distinto según cuál sea:

\`\`\`js
try {
  procesar();
} catch (error) {
  if (error instanceof ValidationError) {
    mostrarErrorAlUsuario(error.campo);
  } else {
    reportarErrorInesperado(error);
  }
}
\`\`\`

## try/catch con async/await

\`\`\`js
async function obtenerDatos() {
  try {
    const respuesta = await fetch('/api/datos');
    if (!respuesta.ok) {
      throw new Error(\`HTTP \${respuesta.status}\`);
    }
    return await respuesta.json();
  } catch (error) {
    console.log('Falló la petición:', error.message);
    return null;
  }
}
\`\`\`

fetch() no rechaza la promesa por códigos de error HTTP (404, 500) — solo por
fallas de red. Por eso hay que chequear \`respuesta.ok\` manualmente y lanzar
un error propio si hace falta.`,

        advanced: `## Promise.all vs Promise.allSettled vs Promise.race

Las tres corren promesas en paralelo, pero manejan fallas de forma distinta:

\`\`\`js
// Promise.all: falla TODO si UNA falla (fail-fast)
Promise.all([tarea1(), tarea2(), tarea3()])
  .then(resultados => ...)   // solo si TODAS tuvieron éxito
  .catch(error => ...);       // se ejecuta si CUALQUIERA falló

// Promise.allSettled: espera a TODAS, sin importar si fallan o no
const resultados = await Promise.allSettled([tarea1(), tarea2(), tarea3()]);
// cada resultado es { status: 'fulfilled', value } o { status: 'rejected', reason }

// Promise.race: se resuelve/rechaza con la PRIMERA que termine (ganadora o perdedora)
Promise.race([tarea1(), timeout(5000)])
  .then(...) // lo que sea que termine primero
\`\`\`

**Cuándo usar cada una**:
- \`Promise.all\`: cuando necesitas que TODAS tengan éxito para continuar (ej: cargar
  varios recursos obligatorios).
- \`Promise.allSettled\`: cuando quieres el resultado de todas, exitosas o no (ej:
  enviar notificaciones a varios usuarios, algunos pueden fallar sin bloquear al resto).
- \`Promise.race\`: cuando te interesa la primera en resolver (ej: timeout de una petición).

### Procesando resultados de allSettled

\`\`\`js
const resultados = await Promise.allSettled([tarea1(), tarea2(), tarea3()]);

const exitosas = resultados.filter(r => r.status === 'fulfilled');
const fallidas = resultados.filter(r => r.status === 'rejected');

fallidas.forEach(f => console.log('Error:', f.reason.message));
\`\`\`

### Error boundaries en código async: no dejes promesas "sueltas"

\`\`\`js
// Riesgoso — si falla, es un "unhandled promise rejection" silencioso
async function procesarEnBackground() {
  await operacionRiesgosa();
}
procesarEnBackground(); // sin await ni .catch()

// Mejor: siempre atrapa el error, aunque sea solo para loguearlo
procesarEnBackground().catch(error => {
  console.error('Falló en background:', error);
});
\`\`\`

Un error no capturado en una promesa no detiene el programa (a diferencia de
un throw síncrono no capturado), pero tampoco avisa de forma clara — es una de
las fuentes de bugs silenciosos más comunes en aplicaciones async grandes.`,
      },
    },

    {
      id: 'lesson-10-code',
      type: 'code',
      estimatedMinutes: 7,
      variants: {
        simplified: {
          id: 'code-10-simplified',
          title: 'Capturar un error con try/catch',
          description: 'Envuelve las llamadas a dividir en un try/catch para manejar la división por cero.',
          code: `function dividir(a, b) {
  if (b === 0) {
    throw new Error('No se puede dividir por cero');
  }
  return a / b;
}

// Envuelve esto en try/catch
console.log(dividir(10, 2));
console.log(dividir(10, 0));`,
          expectedOutput: '5\nError: No se puede dividir por cero',
          hints: [
            'try { ... } catch (error) { console.log("Error:", error.message); }',
            'El segundo console.log(dividir(...)) es el que va a tirar el error',
          ],
          solution: `function dividir(a, b) {
  if (b === 0) {
    throw new Error('No se puede dividir por cero');
  }
  return a / b;
}

try {
  console.log(dividir(10, 2));
  console.log(dividir(10, 0));
} catch (error) {
  console.log('Error:', error.message);
}`,
        },
        base: {
          id: 'code-10-base',
          title: 'Error personalizado',
          description: 'Completa ValidationError y validarEdad para lanzar errores con información extra.',
          code: `class ValidationError extends Error {
  constructor(message, campo) {
    // Llama a super(message), define this.name = 'ValidationError'
    // y guarda this.campo
  }
}

function validarEdad(edad) {
  if (typeof edad !== 'number') {
    throw new ValidationError('La edad debe ser un número', 'edad');
  }
  if (edad < 0 || edad > 120) {
    throw new ValidationError('La edad debe estar entre 0 y 120', 'edad');
  }
  return true;
}

try {
  validarEdad(-5);
} catch (error) {
  console.log(error.name);
  console.log(error.message);
  console.log(error.campo);
}

console.log(validarEdad(28));`,
          expectedOutput: 'ValidationError\nLa edad debe estar entre 0 y 120\nedad\ntrue',
          hints: [
            "super(message); this.name = 'ValidationError'; this.campo = campo;",
            'Una clase que extiende Error se comporta como cualquier Error, más las propiedades extra que le agregues',
          ],
          solution: `class ValidationError extends Error {
  constructor(message, campo) {
    super(message);
    this.name = 'ValidationError';
    this.campo = campo;
  }
}

function validarEdad(edad) {
  if (typeof edad !== 'number') {
    throw new ValidationError('La edad debe ser un número', 'edad');
  }
  if (edad < 0 || edad > 120) {
    throw new ValidationError('La edad debe estar entre 0 y 120', 'edad');
  }
  return true;
}

try {
  validarEdad(-5);
} catch (error) {
  console.log(error.name);
  console.log(error.message);
  console.log(error.campo);
}

console.log(validarEdad(28));`,
        },
        advanced: {
          id: 'code-10-advanced',
          title: 'Manejar fallas parciales con Promise.allSettled',
          description:
            'Cuenta cuántas tareas tuvieron éxito y cuántas fallaron, usando Promise.allSettled.',
          code: `async function tarea(id, fallar) {
  if (fallar) {
    throw new Error(\`Tarea \${id} falló\`);
  }
  return \`Tarea \${id} completada\`;
}

async function ejecutarTodas() {
  // Usa Promise.allSettled para correr las 3 tareas en paralelo
  const resultados = []; // reemplaza esta línea

  const exitosas = resultados.filter(r => r.status === 'fulfilled').length;
  const fallidas = resultados.filter(r => r.status === 'rejected').length;

  console.log(exitosas);
  console.log(fallidas);
  console.log(resultados[1].reason.message);
}

ejecutarTodas();`,
          expectedOutput: '2\n1\nTarea 2 falló',
          hints: [
            'const resultados = await Promise.allSettled([tarea(1, false), tarea(2, true), tarea(3, false)]);',
            'Cada resultado fallido tiene la forma { status: "rejected", reason: Error }',
          ],
          solution: `async function tarea(id, fallar) {
  if (fallar) {
    throw new Error(\`Tarea \${id} falló\`);
  }
  return \`Tarea \${id} completada\`;
}

async function ejecutarTodas() {
  const resultados = await Promise.allSettled([
    tarea(1, false),
    tarea(2, true),
    tarea(3, false),
  ]);

  const exitosas = resultados.filter(r => r.status === 'fulfilled').length;
  const fallidas = resultados.filter(r => r.status === 'rejected').length;

  console.log(exitosas);
  console.log(fallidas);
  console.log(resultados[1].reason.message);
}

ejecutarTodas();`,
        },
      },
    },

    {
      id: 'lesson-10-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'l10-q1-simple',
            question: '¿Qué hace `throw new Error("algo falló")`?',
            options: [
              'Imprime el mensaje en la consola',
              'Lanza un error, interrumpiendo la ejecución normal del código',
              'Crea una variable llamada error',
              'No hace nada hasta que se llama .catch()',
            ],
            correctIndex: 1,
            explanation: 'throw lanza (levanta) un error inmediatamente, deteniendo la ejecución normal y buscando el catch más cercano que lo maneje.',
            commonMistakes: {
              0: 'throw no imprime nada por sí solo — solo lanza el error, que puede o no ser mostrado luego según cómo se maneje.',
              2: 'No crea ninguna variable — interrumpe el flujo normal lanzando el objeto Error.',
              3: '.catch() es para promesas — throw en código síncrono se maneja con try/catch, y actúa inmediatamente, no de forma diferida.',
            },
          },
          {
            id: 'l10-q2-simple',
            question: '¿Cuándo se ejecuta el bloque `finally`?',
            options: [
              'Siempre, haya habido error o no',
              'Solo si NO hubo ningún error',
              'Solo si hubo un error',
              'Nunca se ejecuta automáticamente',
            ],
            correctIndex: 0,
            explanation: 'finally se ejecuta siempre después de try/catch, sin importar si hubo un error o si todo salió bien — es el lugar típico para limpieza (cerrar conexiones, ocultar loaders, etc.).',
            commonMistakes: {
              1: 'Al revés: finally se ejecuta INCLUSO si hubo error, no solo cuando no lo hay.',
              2: 'finally no depende de que haya habido error — se ejecuta en ambos casos.',
              3: 'finally se ejecuta automáticamente siempre que el try/catch/finally se alcanza, sin necesidad de llamarlo manualmente.',
            },
          },
        ],
        base: [
          {
            id: 'l10-q1-base',
            question: '¿Para qué sirve crear una clase de error personalizada (extends Error)?',
            options: [
              'Es obligatorio en JavaScript, no se puede lanzar Error directamente',
              'Hace que el código corra más rápido',
              'Permite agregar información extra y distinguir tipos de error con instanceof',
              'Solo sirve para cambiar el color del mensaje en la consola',
            ],
            correctIndex: 2,
            explanation: 'Una clase de error personalizada puede llevar propiedades adicionales (como campo en el ejemplo) y permite diferenciar "qué tipo de error fue" con error instanceof MiError, para reaccionar distinto según el caso.',
            commonMistakes: {
              0: 'No es obligatorio — throw new Error("mensaje") directo es perfectamente válido. Las clases personalizadas son una mejora opcional.',
              1: 'No tiene ningún impacto en performance — es puramente para organizar mejor la información y el manejo de errores.',
              3: 'No tiene relación con el color del mensaje — eso depende de cómo el navegador/consola formatea los errores, no del código.',
            },
          },
          {
            id: 'l10-q2-base',
            question:
              '¿Por qué fetch() no rechaza la promesa cuando el servidor responde con un error 404 o 500?',
            options: [
              'Es un bug de la API fetch',
              'fetch() nunca rechaza, bajo ninguna circunstancia',
              'fetch() solo rechaza por fallas de RED (sin conexión, etc.) — un 404/500 es una respuesta HTTP válida, aunque indique error',
              '404 y 500 en realidad sí rechazan la promesa automáticamente',
            ],
            correctIndex: 2,
            explanation: 'Desde la perspectiva de fetch(), recibir CUALQUIER respuesta del servidor (incluso un 404 o 500) es un "éxito" de la petición HTTP en sí — el error de negocio hay que chequearlo manualmente con response.ok o response.status.',
            commonMistakes: {
              0: 'Es un diseño intencional de la API, documentado, no un bug.',
              1: 'fetch() sí rechaza, pero solo ante fallas de red reales (sin conexión, CORS bloqueado, timeout de red, etc.), no ante códigos de error HTTP.',
              3: 'Es exactamente lo opuesto — 404/500 NO rechazan automáticamente, por eso hay que chequear response.ok manualmente.',
            },
          },
        ],
        advanced: [
          {
            id: 'l10-q1-advanced',
            question:
              '¿Cuál es la diferencia clave entre `Promise.all` y `Promise.allSettled` cuando UNA de las promesas falla?',
            options: [
              'No hay diferencia, ambas se comportan igual',
              'Promise.allSettled es simplemente una versión más lenta de Promise.all',
              'Promise.all rechaza inmediatamente con el primer error; Promise.allSettled espera a que TODAS terminen y te da el resultado de cada una',
              'Promise.all ignora los errores automáticamente',
            ],
            correctIndex: 2,
            explanation: 'Promise.all es "fail-fast": ante el primer rechazo, toda la promesa combinada rechaza, sin esperar al resto. Promise.allSettled siempre espera a que todas las promesas terminen (exitosas o no) y devuelve un array con el resultado de cada una.',
            commonMistakes: {
              0: 'Se comportan de forma bastante distinta específicamente en el caso de fallas parciales.',
              1: 'La diferencia no es de velocidad — es de qué información obtienes y cuándo se resuelve la promesa combinada.',
              3: 'Promise.all no ignora errores — todo lo contrario, rechaza inmediatamente en cuanto encuentra uno.',
            },
          },
          {
            id: 'l10-q2-advanced',
            question:
              '¿Qué pasa si una función async lanza un error y se llama SIN await ni .catch()?',
            options: [
              'El programa se detiene inmediatamente (crash)',
              'JavaScript agrega automáticamente un try/catch',
              'El error se ignora silenciosamente sin ningún rastro',
              'Se convierte en un "unhandled promise rejection" — no detiene el programa, pero el error no se maneja de forma visible',
            ],
            correctIndex: 3,
            explanation: 'A diferencia de un throw síncrono no capturado, un error en una promesa sin manejar no detiene la ejecución del programa — pero sí genera una advertencia de "unhandled promise rejection" (visible en la consola/logs), lo cual puede pasar desapercibido en producción si no se está monitoreando activamente.',
            commonMistakes: {
              0: 'Un error de promesa sin manejar NO detiene el programa — esa es justamente la trampa: el programa sigue corriendo como si nada.',
              1: 'JavaScript no agrega manejo de errores automático — es responsabilidad del desarrollador agregar try/catch o .catch().',
              2: 'No es completamente silencioso — genera una advertencia (unhandled rejection) detectable en la consola o en herramientas de monitoreo, aunque es fácil no notarla.',
            },
          },
        ],
      },
    },
  ],
};
