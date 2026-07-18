import type { LessonContent } from '../../../types/domain';

export const lesson2: LessonContent = {
  id: 'lesson-2',
  title: 'Closures',
  subtitle: 'Funciones que recuerdan el entorno donde nacieron',
  level: 'intermediate',
  track: 'javascript',
  prerequisites: ['lesson-7'],
  blocks: [
    {
      id: 'lesson-2-explanation',
      type: 'explanation',
      estimatedMinutes: 5,
      variants: {
        simplified: `## Closures: funciones con memoria

Un **closure** ocurre cuando una función "recuerda" las variables del lugar donde fue creada, incluso después de que ese lugar desaparezca.

### Analogía: la mochila invisible

Imagina que cada función lleva una mochila invisible. Cuando la función nace, mete en esa mochila todas las variables que puede ver en ese momento. Aunque se vaya a otro lado, la mochila siempre viaja con ella.

\`\`\`js
function crearContador() {
  let cuenta = 0; // esta variable va a la mochila

  function incrementar() {
    cuenta = cuenta + 1; // usa la variable de la mochila
    return cuenta;
  }

  return incrementar; // devolvemos la función con su mochila
}

const miContador = crearContador();
console.log(miContador()); // 1
console.log(miContador()); // 2
console.log(miContador()); // 3
\`\`\`

La función \`crearContador\` terminó de ejecutarse, pero \`cuenta\` sigue viva dentro de la mochila de \`incrementar\`.`,

        base: `## Closures en JavaScript

Un **closure** es la combinación de una función y el entorno léxico en el que fue declarada. La función "cierra sobre" (closes over) las variables de su scope exterior, manteniéndolas vivas incluso después de que el scope exterior haya terminado de ejecutarse.

### ¿Cuándo se crea un closure?

Siempre que una función accede a variables de un scope externo, se crea un closure. Pero su utilidad real aparece cuando esa función **sobrevive** al scope donde fue creada:

\`\`\`js
function crearSumador(base) {
  // 'base' es capturada por el closure de la función retornada
  return function(numero) {
    return base + numero; // 'base' sigue viva en el closure
  };
}

const sumar5 = crearSumador(5);
const sumar10 = crearSumador(10);

console.log(sumar5(3));  // 8  — base = 5
console.log(sumar10(3)); // 13 — base = 10, closure separado
\`\`\`

Cada llamada a \`crearSumador\` crea un **closure separado** con su propio \`base\`.

### El closure captura la referencia, no el valor

\`\`\`js
function crearFunciones() {
  const funciones = [];
  for (let i = 0; i < 3; i++) {
    // let crea un nuevo binding por iteración — cada closure captura su propio i
    funciones.push(() => i);
  }
  return funciones;
}

const fns = crearFunciones();
console.log(fns[0]()); // 0
console.log(fns[1]()); // 1
console.log(fns[2]()); // 2
// Con var en lugar de let, todas devolverían 3
\`\`\`

### Uso real: módulo con estado privado

\`\`\`js
function crearCuenta(saldoInicial) {
  let saldo = saldoInicial; // privado — nadie puede acceder directamente

  return {
    depositar: (monto) => { saldo += monto; },
    retirar: (monto) => {
      if (monto > saldo) throw new Error('Saldo insuficiente');
      saldo -= monto;
    },
    consultarSaldo: () => saldo,
  };
}

const cuenta = crearCuenta(1000);
cuenta.depositar(500);
console.log(cuenta.consultarSaldo()); // 1500
// No hay forma de modificar 'saldo' directamente desde afuera
\`\`\``,

        advanced: `## Closures: Implementación Interna y Patrones Avanzados

### [[Environment]] y Lexical Environment

Internamente, cada función tiene una propiedad \`[[Environment]]\` que referencia el **Lexical Environment** donde fue creada. Cuando la función se ejecuta, crea un nuevo Lexical Environment con \`[[OuterEnv]]\` apuntando a ese \`[[Environment]]\` capturado.

Esto significa que el Garbage Collector **no puede liberar** el Lexical Environment externo mientras exista alguna función que lo referencia — incluso si el scope padre ya terminó de ejecutarse.

### Memoria y performance

\`\`\`js
// ⚠️ PROBLEMA: closure retiene DOM nodes
function setupHandler() {
  const bigArray = new Array(1000000).fill(0); // 1M elementos
  const button = document.getElementById('btn');

  button.addEventListener('click', () => {
    // bigArray no se usa aquí, pero el closure la retiene
    console.log('clicked');
  });
}
// bigArray nunca será GC'd mientras el botón exista
\`\`\`

### Memoización con closures

\`\`\`js
function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return function(this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as ReturnType<T>;
    const result = fn.apply(this, args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  } as T;
}

const fibonacci = memoize((n: number): number =>
  n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2)
);
\`\`\`

### Partial application y currying

\`\`\`js
// Partial application: fijar algunos argumentos
const multiplicar = (a: number, b: number) => a * b;
const doble = multiplicar.bind(null, 2);
// equivalente con closure explícito:
const triple = (b: number) => multiplicar(3, b);

// Curry: transformar f(a,b,c) en f(a)(b)(c)
const curry = <T>(fn: (...args: T[]) => T) =>
  function curried(...args: T[]): T | ((...rest: T[]) => T) {
    if (args.length >= fn.length) return fn(...args);
    return (...rest: T[]) => curried(...args, ...rest);
  };
\`\`\`

### El patrón IIFE como namespace

\`\`\`js
const MiModulo = (() => {
  // Todo esto es privado al closure de la IIFE
  let estadoInterno = 0;
  const configuracion = { debug: false };

  function logInterno(msg: string) {
    if (configuracion.debug) console.log(msg);
  }

  // Solo esto es público
  return {
    incrementar() { estadoInterno++; logInterno('incrementado'); },
    getEstado: () => estadoInterno,
  };
})();
\`\`\``,
      },
    },

    {
      id: 'lesson-2-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-2-simplified',
          title: 'Crear un contador con memoria',
          description:
            'Completa la función para que el contador recuerde su valor entre llamadas.',
          code: `function crearContador() {
  let cuenta = 0;

  // Esta función tiene que:
  // 1. Sumar 1 a 'cuenta'
  // 2. Retornar el nuevo valor de 'cuenta'
  function incrementar() {
    // Tu código aquí
  }

  return incrementar;
}

const contador = crearContador();
console.log(contador()); // debería imprimir: 1
console.log(contador()); // debería imprimir: 2
console.log(contador()); // debería imprimir: 3`,
          expectedOutput: '1\n2\n3',
          hints: [
            "Para sumar 1 a cuenta: cuenta = cuenta + 1 (o cuenta++)",
            'Después de incrementar, retorna el nuevo valor: return cuenta',
          ],
          solution: `function crearContador() {
  let cuenta = 0;

  function incrementar() {
    cuenta = cuenta + 1;
    return cuenta;
  }

  return incrementar;
}

const contador = crearContador();
console.log(contador());
console.log(contador());
console.log(contador());`,
        },
        base: {
          id: 'code-2-base',
          title: 'Generador de IDs únicos',
          description:
            'Implementa una función que genere IDs únicos con un prefijo configurable.',
          code: `function crearGeneradorId(prefijo) {
  // Necesitas una variable que persista entre llamadas
  // y un contador que se incremente con cada ID generado
  
  return function generarId() {
    // Retorna un string con formato: "prefijo-N"
    // donde N es el número de ID (empieza en 1)
  };
}

const idUsuario = crearGeneradorId('user');
const idProducto = crearGeneradorId('prod');

console.log(idUsuario());   // "user-1"
console.log(idUsuario());   // "user-2"
console.log(idProducto());  // "prod-1" — contador independiente
console.log(idUsuario());   // "user-3"`,
          expectedOutput: 'user-1\nuser-2\nprod-1\nuser-3',
          hints: [
            'Declaras la variable del contador dentro de crearGeneradorId, antes del return',
            'Cada llamada a crearGeneradorId crea un closure separado con su propio contador',
          ],
          solution: `function crearGeneradorId(prefijo) {
  let contador = 0;

  return function generarId() {
    contador = contador + 1;
    return prefijo + '-' + contador;
  };
}

const idUsuario = crearGeneradorId('user');
const idProducto = crearGeneradorId('prod');

console.log(idUsuario());
console.log(idUsuario());
console.log(idProducto());
console.log(idUsuario());`,
        },
        advanced: {
          id: 'code-2-advanced',
          title: 'Implementar memoize con invalidación',
          description:
            'Implementa una versión de memoize que permita invalidar el caché de una entrada específica.',
          code: `function memoizeWithInvalidation(fn) {
  const cache = new Map();

  // La función memoizada debe:
  // 1. Buscar el resultado en caché por los argumentos
  // 2. Si existe, retornarlo sin llamar fn
  // 3. Si no existe, llamar fn, guardar el resultado, y retornarlo

  // También necesitas exponer:
  // - invalidate(...args): elimina una entrada específica del caché
  // - clear(): vacía todo el caché
  // - getCacheSize(): retorna cuántas entradas hay en caché

  const memoized = function(...args) {
    // Implementa aquí
  };

  memoized.invalidate = function(...args) { /* ... */ };
  memoized.clear = function() { /* ... */ };
  memoized.getCacheSize = function() { /* ... */ };

  return memoized;
}

// Test
let llamadas = 0;
const suma = memoizeWithInvalidation((a, b) => {
  llamadas++;
  return a + b;
});

console.log(suma(2, 3));          // 5, llamadas = 1
console.log(suma(2, 3));          // 5, llamadas sigue en 1 (caché hit)
console.log(suma.getCacheSize()); // 1
suma.invalidate(2, 3);
console.log(suma(2, 3));          // 5, llamadas = 2 (recalculó)`,
          expectedOutput: '5\n5\n1\n5',
          hints: [
            'JSON.stringify(args) como clave de caché funciona para argumentos primitivos',
            'El closure sobre `cache` y `fn` persiste aunque devuelvas la función memoized',
          ],
          solution: `function memoizeWithInvalidation(fn) {
  const cache = new Map();

  const memoized = function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };

  memoized.invalidate = function(...args) {
    cache.delete(JSON.stringify(args));
  };
  memoized.clear = function() {
    cache.clear();
  };
  memoized.getCacheSize = function() {
    return cache.size;
  };

  return memoized;
}

let llamadas = 0;
const suma = memoizeWithInvalidation((a, b) => {
  llamadas++;
  return a + b;
});

console.log(suma(2, 3));
console.log(suma(2, 3));
console.log(suma.getCacheSize());
suma.invalidate(2, 3);
console.log(suma(2, 3));`,
        },
      },
    },

    {
      id: 'lesson-2-quiz',
      type: 'quiz',
      estimatedMinutes: 3,
      variants: {
        simplified: [
          {
            id: 'l2-q1-simple',
            question: '¿Qué es un closure?',
            options: [
              'Una función que recuerda las variables del lugar donde fue creada',
              'Una forma de cerrar o terminar una función',
              'Una variable que solo existe dentro de un bloque {}',
              'Un error que ocurre cuando una función no retorna nada',
            ],
            correctIndex: 0,
            explanation:
              'Un closure es cuando una función "lleva consigo" las variables de su entorno de creación. Puede acceder a esas variables incluso cuando se ejecuta en un contexto diferente.',
            commonMistakes: {
              1: '"Closure" viene de "cerrar sobre" variables, no de cerrar/terminar la función.',
              2: 'Estás describiendo el scope de bloque de let/const, no un closure.',
              3: 'Un closure no tiene nada que ver con errores ni con retornar valores.',
            },
          },
          {
            id: 'l2-q2-simple',
            question:
              '¿Qué imprime este código?\n\n```js\nfunction crearSaludo(nombre) {\n  return function() {\n    console.log("Hola, " + nombre);\n  };\n}\nconst saludarAna = crearSaludo("Ana");\nsaludarAna();\n```',
            options: [
              'Hola, Ana',
              'Hola, nombre',
              'undefined',
              'ReferenceError: nombre is not defined',
            ],
            correctIndex: 0,
            explanation:
              'La función interna forma un closure sobre el parámetro nombre = "Ana". Aunque crearSaludo() ya terminó de ejecutarse, nombre sigue viva dentro del closure y la función interna puede acceder a ella.',
            commonMistakes: {
              1: 'nombre es una variable, no un texto literal. El closure capturó su valor "Ana".',
              2: 'nombre no es undefined — tiene el valor "Ana" capturado en el closure.',
              3: 'nombre sí está definida — vive en el closure de la función interna.',
            },
          },
          {
            id: 'l2-q3-simple',
            question:
              'Si llamas a crearSumador(5) y crearSumador(10) por separado, ¿comparten el mismo closure?',
            options: [
              'Sí, comparten el mismo closure con la última base asignada',
              'Depende de si las funciones tienen el mismo nombre',
              'No, cada llamada crea un closure independiente con su propio valor',
              'Sí, pero solo si se guardan en la misma variable',
            ],
            correctIndex: 2,
            explanation:
              'Cada invocación de una función de fábrica (factory function) crea un Lexical Environment nuevo e independiente. crearSumador(5) y crearSumador(10) producen closures completamente separados.',
            commonMistakes: {
              0: 'Incorrecto. Cada llamada a crearSumador() crea su propio closure con su propio valor de base.',
              1: 'El nombre de la función no tiene nada que ver. Lo que importa es que cada invocación crea un nuevo entorno.',
              3: 'El closure se crea en el momento de la llamada, independientemente de cómo se guarde el resultado.',
            },
          },
        ],
        base: [
          {
            id: 'l2-q1-base',
            question:
              '¿Cuántas veces se ejecuta el console.log del siguiente código y qué imprime?\n\n```js\nfunction outer() {\n  let x = 0;\n  return () => ++x;\n}\nconst f1 = outer();\nconst f2 = outer();\nf1(); f1(); f2();\nconsole.log(f1()); // ???\nconsole.log(f2()); // ???\n```',
            options: [
              '3 y 3 — comparten el mismo x',
              '3 y 2 — f1 se llamó una vez más',
              '4 y 2 — error de conteo',
              '3 y 1 — closures independientes, f2 solo fue llamada una vez antes',
            ],
            correctIndex: 3,
            explanation:
              'f1 y f2 son closures independientes con su propio x. f1 fue llamada 3 veces antes del console.log (f1(), f1(), f1()), así que x = 3. f2 fue llamada 1 vez (f2()), así que x = 1. El console.log llama a cada una una vez más: f1() = 4, f2() = 2.',
            commonMistakes: {
              0: 'f1 y f2 NO comparten x. Cada llamada a outer() crea un closure separado.',
              1: 'Cuenta las llamadas: f1 se llamó 2 veces con f1(); f1(); antes del último f1() en console.log. Total para f1: 3 llamadas → x = 3.',
              2: 'El conteo correcto: f1() + f1() = x es 2, luego f1() en el log = 3. f2() = x es 1, luego f2() en el log = 2.',
            },
          },
          {
            id: 'l2-q2-base',
            question:
              'Los closures "capturan referencias, no valores". ¿Qué significa esto en la práctica?',
            options: [
              'El closure guarda una copia del valor al momento de crearse',
              'El closure puede leer la variable pero no modificarla',
              'El closure accede a la variable actual, que puede haber cambiado',
              'Solo funciona con let, no con const',
            ],
            correctIndex: 2,
            explanation:
              'Los closures no hacen una copia del valor — referencian la variable en sí. Si la variable cambia después de crear el closure, el closure verá el valor nuevo. Esto es por qué con var en un loop todas las closures ven el valor final de i.',
            commonMistakes: {
              0: 'Incorrecto: es la confusión más común. El closure no snapshot el valor — mantiene una referencia viva a la variable.',
              1: 'Los closures pueden modificar variables capturadas. Es precisamente lo que hace un contador con closure.',
              3: 'const también puede ser capturada en un closure. La distinción let/const no es relevante aquí.',
            },
          },
          {
            id: 'l2-q3-base',
            question:
              '¿Cuál es el patrón correcto para crear estado privado con closures?',
            options: [
              'Usar variables globales con nombre único para evitar colisiones',
              'Retornar una función o un objeto de métodos que acceden a variables locales',
              'Usar this dentro de la función para guardar el estado',
              'Declarar las variables con const para que no puedan modificarse',
            ],
            correctIndex: 1,
            explanation:
              'El patrón Module con closures: una función factory declara variables privadas, y retorna funciones que las manipulan. Las variables son inaccesibles desde afuera — solo los métodos retornados pueden interactuar con ellas.',
            commonMistakes: {
              0: 'Las variables globales son exactamente lo opuesto a privadas. Cualquier código puede accederlas y modificarlas.',
              2: 'this requiere una clase o un contexto de objeto. Los closures proveen privacidad sin necesitar this.',
              3: 'const solo previene re-asignación de la variable en sí, no hace que el valor sea privado ni inaccesible.',
            },
          },
        ],
        advanced: [
          {
            id: 'l2-q1-advanced',
            question:
              '¿Qué problema de memoria puede crear este código y cómo se solucionaría?\n\n```js\nfunction attachHandler(element) {\n  const data = new Array(10000).fill("datos");\n  element.addEventListener("click", () => {\n    console.log("clicked");\n  });\n}\n```',
            options: [
              'Memory leak: el closure retiene data aunque no la use',
              'Ninguno — el GC libera data cuando attachHandler termina',
              'Stack overflow: la función recursiva no tiene base case',
              'ReferenceError: element puede ser null',
            ],
            correctIndex: 0,
            explanation:
              'El arrow function del event handler crea un closure que retiene todo el Lexical Environment de attachHandler, incluyendo data (10000 elementos). Aunque el handler no usa data, el GC no puede liberarla mientras el event listener exista. Solución: extraer la variable data fuera del scope, o hacer null explícito después de usarla.',
            commonMistakes: {
              1: 'El GC no puede liberar el Lexical Environment mientras exista una referencia viva (el event listener). data queda atrapada.',
              2: 'No hay recursión aquí. El problema es retención de memoria por closure.',
              3: 'El ReferenceError es secundario y depende del contexto. El problema principal es la memoria.',
            },
          },
          {
            id: 'l2-q2-advanced',
            question:
              '¿Cuál es la diferencia entre partial application y currying?',
            options: [
              'Partial application fija N argumentos; currying transforma f(a,b,c) en f(a)(b)(c)',
              'Son sinónimos — ambos fijan algunos argumentos de una función',
              'Currying solo funciona con funciones puras; partial application con cualquiera',
              'Partial application usa bind(); currying requiere una librería',
            ],
            correctIndex: 0,
            explanation:
              'Partial application: fijas uno o más argumentos, retornas una función que acepta el resto. Puede llamarse con múltiples argumentos. Currying: transforma una función de N argumentos en N funciones de 1 argumento encadenadas — siempre una función unaria por paso.',
            commonMistakes: {
              1: 'No son sinónimos. Tienen comportamientos distintos aunque ambos usan closures.',
              2: 'Ambas técnicas funcionan con cualquier tipo de función. La pureza no es requisito.',
              3: 'Ambas pueden implementarse nativamente con closures, sin librerías.',
            },
          },
          {
            id: 'l2-q3-advanced',
            question:
              'Una IIFE (Immediately Invoked Function Expression) crea un closure. ¿Cuál es su principal ventaja en el contexto de módulos?',
            options: [
              'Crea un scope privado que no contamina el scope global',
              'Permite exportar valores al scope global de forma controlada',
              'Ejecuta el código más rápido que una función regular',
              'Elimina la necesidad de usar let y const',
            ],
            correctIndex: 0,
            explanation:
              'El patrón IIFE fue la solución pre-ES6 modules al problema de contaminación del scope global. Todo lo declarado dentro de la IIFE es privado al closure. Solo lo que se retorna o se asigna explícitamente llega al exterior. Esto permitía encapsulamiento antes de tener import/export.',
            commonMistakes: {
              1: 'Exportar al scope global es precisamente lo que se busca EVITAR con IIFE. Se puede, pero es el anti-patrón.',
              2: 'La velocidad de ejecución es idéntica a una función llamada normalmente. El beneficio es de arquitectura, no performance.',
              3: 'let y const son buenas prácticas independientemente del contexto. IIFE no las hace innecesarias.',
            },
          },
        ],
      },
    },
  ],
};
