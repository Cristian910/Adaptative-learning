import type { LessonContent } from '../../../types/domain';

export const lesson1: LessonContent = {
  id: 'lesson-1',
  title: 'Funciones y Scope',
  subtitle: 'Cómo JavaScript decide qué variables puede ver cada función',
  level: 'base',
  track: 'javascript',
  prerequisites: ['lesson-6'],
  blocks: [
    // ─── Block 1: Explanation ───────────────────────────────────────────────
    {
      id: 'lesson-1-explanation',
      type: 'explanation',
      estimatedMinutes: 4,
      variants: {
        simplified: `## Funciones: guardar acciones para usar después

Una **función** es como una receta guardada. La escribes una vez y la puedes ejecutar cuantas veces quieras.

\`\`\`js
function saludar() {
  console.log("Hola!");
}

saludar(); // "Hola!"
saludar(); // "Hola!" otra vez
\`\`\`

### ¿Qué es el scope?

El **scope** define qué variables puede "ver" cada parte de tu código. Piénsalo como habitaciones en una casa:

- Las variables del **exterior** las pueden ver **todos**
- Las variables del **interior** de una función solo las puede ver **esa función**

\`\`\`js
let nombre = "Ana"; // exterior — todos la ven

function saludar() {
  let mensaje = "Hola " + nombre; // puede usar 'nombre'
  console.log(mensaje);
}

console.log(mensaje); // ❌ ERROR — 'mensaje' solo existe dentro de saludar()
\`\`\`

La variable \`mensaje\` "nació" dentro de \`saludar()\`, entonces muere cuando la función termina.`,

        base: `## Funciones y Scope en JavaScript

Las **funciones** encapsulan comportamiento reutilizable. El **scope** (ámbito) determina la visibilidad de las variables — qué identificadores son accesibles en cada punto del código.

### Declaración de funciones

\`\`\`js
// Declaración clásica — se eleva (hoisting)
function sumar(a, b) {
  return a + b;
}

// Expresión de función — NO se eleva
const multiplicar = function(a, b) {
  return a * b;
};

// Arrow function — sintaxis moderna
const dividir = (a, b) => a / b;
\`\`\`

### Scope léxico (Lexical Scope)

JavaScript usa **scope léxico**: la visibilidad se determina en tiempo de escritura, no de ejecución.

\`\`\`js
let global = "soy global";

function externa() {
  let enExterna = "soy de externa";

  function interna() {
    let enInterna = "soy de interna";
    console.log(global);    // ✅ accede al scope global
    console.log(enExterna); // ✅ accede al scope padre
    console.log(enInterna); // ✅ accede a su propio scope
  }

  interna();
  console.log(enInterna); // ❌ ReferenceError — scope hijo no visible al padre
}
\`\`\`

### La Scope Chain (cadena de scopes)

Cuando JavaScript busca una variable, sube por la cadena:
1. Scope actual → 2. Scope padre → 3. Global → 4. ReferenceError

Este mecanismo es la base de los closures (lección siguiente).`,

        advanced: `## Funciones, Scope y el Motor de JavaScript

El scope en JavaScript es **léxico y estático**: la cadena de scopes se construye en tiempo de parseo (antes de la ejecución), no en runtime.

### Execution Context y Variable Environment

Cada invocación de función crea un **Execution Context** con:
- **Variable Environment (VE)**: bindings de \`var\` y declaraciones de funciones
- **Lexical Environment (LE)**: bindings de \`let\`, \`const\`, y el outer reference
- **This binding**: determinado por el modo de invocación

\`\`\`js
// Hoisting: var vs let/const
console.log(x); // undefined — var se eleva declaración pero no valor
console.log(y); // ReferenceError — let está en "temporal dead zone"

var x = 1;
let y = 2;
\`\`\`

### Scope Chain en el AST

\`\`\`js
const outer = (() => {
  const secret = 42;

  // Esta función captura 'secret' en su [[Environment]] interno
  // aunque se ejecute fuera del bloque donde fue definida
  return () => secret;
})();

console.log(outer()); // 42 — scope léxico preservado
\`\`\`

### var vs let vs const: diferencias de scope

| | \`var\` | \`let\` | \`const\` |
|---|---|---|---|
| Scope | función | bloque | bloque |
| Hoisting | sí (undefined) | sí (TDZ) | sí (TDZ) |
| Re-declaración | sí | no | no |
| Re-asignación | sí | sí | no |

Las diferencias de scope entre \`var\` y \`let\` generan uno de los bugs más comunes en loops con closures — veremos exactamente por qué en la siguiente lección.`,
      },
    },

    // ─── Block 2: Code Example ──────────────────────────────────────────────
    {
      id: 'lesson-1-code',
      type: 'code',
      estimatedMinutes: 5,
      variants: {
        simplified: {
          id: 'code-1-simplified',
          title: 'Tu primera función con scope',
          description:
            'Modifica la función para que use la variable del exterior.',
          code: `// Esta variable existe fuera de la función
let nombre = "Mundo";

// La función puede ver 'nombre' porque está en un scope exterior
function saludar() {
  // Modifica esta línea para incluir el nombre
  console.log("Hola!");
}

saludar(); // debería imprimir: "Hola, Mundo!"`,
          expectedOutput: 'Hola, Mundo!',
          hints: [
            "Usa el operador + para concatenar strings: 'Hola, ' + nombre",
            "El resultado debería ser: console.log('Hola, ' + nombre + '!')",
          ],
          solution: `let nombre = "Mundo";

function saludar() {
  console.log("Hola, " + nombre + "!");
}

saludar();`,
        },
        base: {
          id: 'code-1-base',
          title: 'Scope chain en acción',
          description:
            'Modifica la función interna para retornar la suma de todas las variables accesibles.',
          code: `let base = 10;

function externa(x) {
  let multiplicador = 2;

  function interna(y) {
    // Desde aquí puedes acceder a: base, x, multiplicador, y
    // Completa el return para calcular: (base + x) * multiplicador + y
    return 0; // reemplaza esto
  }

  return interna;
}

const operacion = externa(5);
console.log(operacion(3)); // debería imprimir: 33
// Razón: (10 + 5) * 2 + 3 = 33`,
          expectedOutput: '33',
          hints: [
            'La función interna puede ver todas las variables de los scopes exteriores',
            'El cálculo es: (base + x) * multiplicador + y',
          ],
          solution: `let base = 10;

function externa(x) {
  let multiplicador = 2;

  function interna(y) {
    return (base + x) * multiplicador + y;
  }

  return interna;
}

const operacion = externa(5);
console.log(operacion(3));`,
        },
        advanced: {
          id: 'code-1-advanced',
          title: 'var vs let en loops: el bug clásico',
          description:
            'Explica por qué el primer loop imprime siempre 3, y arregla usando let.',
          code: `// BUG: ¿Por qué este loop imprime siempre 3?
var funciones = [];
for (var i = 0; i < 3; i++) {
  funciones.push(function() { return i; });
}
console.log(funciones.map(f => f())); // [3, 3, 3] — ¿por qué?

// ARREGLO: usando let (scope de bloque)
var funcionesFixed = [];
// Reescribe el loop usando let en lugar de var
// y verifica que imprime [0, 1, 2]

console.log(funcionesFixed.map(f => f())); // debería ser [0, 1, 2]`,
          expectedOutput: '[3, 3, 3]\n[0, 1, 2]',
          hints: [
            'var tiene scope de función, no de bloque — todas las closures comparten la misma variable i',
            'let crea un nuevo binding por cada iteración del loop',
          ],
          solution: `var funciones = [];
for (var i = 0; i < 3; i++) {
  funciones.push(function() { return i; });
}
console.log(funciones.map(f => f()));

var funcionesFixed = [];
for (let i = 0; i < 3; i++) {
  funcionesFixed.push(function() { return i; });
}
console.log(funcionesFixed.map(f => f()));`,
        },
      },
    },

    // ─── Block 3: Quiz ──────────────────────────────────────────────────────
    {
      id: 'lesson-1-quiz',
      type: 'quiz',
      estimatedMinutes: 3,
      variants: {
        simplified: [
          {
            id: 'l1-q1-simple',
            question:
              '¿Puede una función acceder a variables declaradas fuera de ella?',
            options: [
              'Solo con funciones de flecha (arrow functions)',
              'No, cada función solo ve sus propias variables',
              'Solo si la variable se llama igual',
              'Sí, siempre puede acceder a variables del exterior',
            ],
            correctIndex: 3,
            explanation:
              'Las funciones en JavaScript pueden acceder a variables de sus scopes exteriores gracias a la scope chain. Una función busca variables primero en su propio scope, luego en el scope padre, y así hasta el scope global.',
            commonMistakes: {
              0: 'Todas las funciones tienen acceso a variables exteriores, no solo las arrow functions.',
              1: 'Incorrecto. Las funciones sí pueden ver variables exteriores — es la base de los closures que veremos en la lección 2.',
              2: 'El nombre de la variable no influye. Lo que importa es dónde fue declarada en el código.',
            },
          },
          {
            id: 'l1-q2-simple',
            question:
              '¿Qué pasa cuando intentas usar una variable declarada dentro de una función desde afuera?',
            options: [
              'Obtienes un ReferenceError',
              'JavaScript retorna null',
              'La variable vale undefined',
              'La variable se comparte automáticamente',
            ],
            correctIndex: 0,
            explanation:
              'Las variables declaradas con let o const dentro de una función tienen scope local. Intentar acceder a ellas desde afuera resulta en un ReferenceError porque no existen en ese scope.',
            commonMistakes: {
              1: 'null es un valor intencional. No se retorna automáticamente en este caso.',
              2: 'undefined aparece cuando una variable existe pero no tiene valor. Aquí la variable directamente no existe en ese scope.',
              3: 'JavaScript no comparte variables automáticamente entre scopes. Hay que retornarlas o pasarlas explícitamente.',
            },
          },
          {
            id: 'l1-q3-simple',
            question: '¿Qué imprime este código?\n\n```js\nlet x = 1;\nfunction f() {\n  let x = 2;\n  console.log(x);\n}\nf();\nconsole.log(x);\n```',
            options: [
              '2, 1',
              '1, 2',
              '2, 2',
              '1, 1',
            ],
            correctIndex: 0,
            explanation:
              'Dentro de f(), la variable local x = 2 "sombrea" a la variable global. La función imprime su propia x (2). Fuera de la función, la x global (1) no fue modificada.',
            commonMistakes: {
              1: 'La función imprime su propia x (2) primero. Después el console.log de afuera imprime la global (1). El orden es 2, 1.',
              2: 'La x dentro de f() es una variable diferente — no modifica la x global.',
              3: 'Dentro de la función, la x local (2) "sombrea" a la global. La función no ve la x = 1.',
            },
          },
        ],
        base: [
          {
            id: 'l1-q1-base',
            question:
              '¿Cuál es el resultado de este código?\n\n```js\nfunction externa() {\n  let x = 10;\n  function interna() {\n    return x * 2;\n  }\n  return interna();\n}\nconsole.log(externa());\n```',
            options: [
              'undefined',
              'ReferenceError',
              '10',
              '20',
            ],
            correctIndex: 3,
            explanation:
              'La función interna puede acceder a x = 10 del scope de externa gracias a la scope chain. Retorna 10 * 2 = 20. Luego externa() retorna ese valor y console.log lo imprime.',
            commonMistakes: {
              0: 'interna() sí puede ver x — está en su scope padre. No es undefined.',
              1: 'No hay ReferenceError porque x existe en el scope de externa, accesible desde interna por la scope chain.',
              2: 'interna() retorna x * 2, no x. El resultado es 10 * 2 = 20.',
            },
          },
          {
            id: 'l1-q2-base',
            question:
              'El scope léxico significa que la visibilidad de una variable se determina...',
            options: [
              'En el momento en que se ejecuta la función',
              'Por el nombre de la variable',
              'Por el orden en que se llaman las funciones',
              'Por la posición en el código donde fue definida',
            ],
            correctIndex: 3,
            explanation:
              'El scope léxico (o estático) se determina en tiempo de escritura/parseo por la posición en el código fuente. JavaScript puede saber exactamente qué variables serán accesibles antes de ejecutar una sola línea.',
            commonMistakes: {
              0: 'Eso sería "scope dinámico", que JavaScript NO usa. El scope se determina antes de la ejecución.',
              1: 'El nombre es irrelevante para el scope. Puedes tener dos variables con el mismo nombre en scopes distintos (variable shadowing).',
              2: 'El orden de llamada no afecta qué variables son visibles. Sólo importa dónde está escrita la función.',
            },
          },
          {
            id: 'l1-q3-base',
            question:
              '¿Qué diferencia de scope hay entre `var` y `let`?\n\n```js\nfor (var i = 0; i < 3; i++) { /* ... */ }\nconsole.log(i); // ???\n\nfor (let j = 0; j < 3; j++) { /* ... */ }\nconsole.log(j); // ???\n```',
            options: [
              'Ambos dan ReferenceError fuera del loop',
              'var da 3, let da ReferenceError',
              'var da undefined, let da 3',
              'Ambos dan 3',
            ],
            correctIndex: 1,
            explanation:
              'var tiene scope de función (o global si está fuera de función). Después del loop, i = 3 es accesible. let tiene scope de bloque — j solo existe dentro del bloque for, por lo que acceder a j fuera del loop produce ReferenceError.',
            commonMistakes: {
              0: 'var no tiene scope de bloque — i sobrevive al loop y vale 3.',
              2: 'var no da undefined aquí — i fue declarada e inicializada, su valor final es 3.',
              3: 'let tiene scope de bloque. j no existe fuera del for, así que da ReferenceError.',
            },
          },
        ],
        advanced: [
          {
            id: 'l1-q1-advanced',
            question:
              '¿Qué imprime este código y por qué?\n\n```js\nlet x = "global";\n(function() {\n  console.log(x);\n  let x = "local";\n})();\n```',
            options: [
              '"global" — accede al scope exterior antes de la declaración local',
              'ReferenceError — no se puede acceder a x antes de su inicialización (TDZ)',
              'undefined — la variable local está en TDZ al momento del log',
              '"local" — la declaración local sobreescribe la global',
            ],
            correctIndex: 1,
            explanation:
              'Este es el "Temporal Dead Zone" (TDZ). let hace hoisting de la declaración de x dentro de la IIFE, pero NO de su inicialización. Como el motor ya "reservó" el nombre x para el scope local en cuanto parseó ese let, la línea console.log(x) referencia esa x local — no la global — y como todavía no fue inicializada, lanza ReferenceError: Cannot access \'x\' before initialization. Esto no tiene que ver con estar dentro de una IIFE (cualquier bloque produciría el mismo resultado): es puramente por el TDZ.',
            commonMistakes: {
              0: 'Incorrecto. La let local "tapa" el acceso a la global desde ese punto del scope — nunca llega a leer la global, ni siquiera antes de inicializarse.',
              2: 'undefined es lo que pasaría con var (hoisting sin inicialización, sin TDZ). Con let, acceder a la variable antes de inicializarla lanza un error en vez de dar undefined — esa es justamente la diferencia clave entre var y let.',
              3: 'La declaración local no llega a ejecutarse todavía en el momento del console.log, así que no puede haber "sobreescrito" nada.',
            },
          },
          {
            id: 'l1-q2-advanced',
            question:
              'En una arrow function, ¿cómo se determina el valor de `this`?',
            options: [
              'Por el objeto que llama la función en runtime',
              'Siempre es undefined en strict mode',
              'Se hereda léxicamente del scope donde fue definida',
              'Depende del método que la contenga (call, apply, bind)',
            ],
            correctIndex: 2,
            explanation:
              'Las arrow functions no tienen su propio this binding. Heredan el this del scope léxico donde fueron definidas — el mismo mecanismo de scope que aplica a variables. Esto las hace ideales para callbacks donde quieres preservar el this del contexto padre.',
            commonMistakes: {
              0: 'Eso describe el comportamiento de las funciones regulares. Las arrow functions ignoran cómo son llamadas.',
              1: 'Las arrow functions pueden tener this definido — es el del scope léxico, no undefined necesariamente.',
              3: 'call/apply/bind no cambian el this de una arrow function. El this léxico no se puede sobreescribir.',
            },
          },
          {
            id: 'l1-q3-advanced',
            question:
              '¿Cuántos scopes distintos crea este código y cuáles son?\n\n```js\nconst a = 1;\n{\n  const b = 2;\n  if (true) {\n    const c = 3;\n    function f() {\n      const d = 4;\n    }\n  }\n}\n```',
            options: [
              '2 scopes: global y la función f',
              '3 scopes: global, el bloque externo, y la función f',
              '4 scopes: global, bloque externo, bloque if, y la función f',
              '5 scopes: global, bloque externo, bloque if, función f, y el bloque de f',
            ],
            correctIndex: 3,
            explanation:
              'Cada par de llaves {} crea un nuevo scope de bloque para let/const. Hay: 1) scope global (a), 2) bloque externo (b), 3) bloque if (c), 4) scope de la función f (d) — que incluye además su propio bloque implícito. Total: 4-5 dependiendo de cómo se cuente el scope de bloque de la función vs su Variable Environment.',
            commonMistakes: {
              0: 'Los bloques {} con let/const crean sus propios scopes. No solo las funciones.',
              1: 'Faltan los scopes de bloque creados por {} y por el if.',
              2: 'Correcto en cantidad de scopes de bloque, pero la función también crea su propio scope distinto.',
            },
          },
        ],
      },
    },
  ],
};
