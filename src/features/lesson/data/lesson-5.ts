import type { LessonContent } from '../../../types/domain';

export const lesson5: LessonContent = {
  id: 'lesson-5',
  title: 'Variables, Tipos de Datos y Operadores',
  subtitle: 'La base de todo: cómo JavaScript guarda y compara información',
  level: 'base',
  track: 'javascript',
  prerequisites: [],
  blocks: [
    {
      id: 'lesson-5-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Guardar información: let, const y var

Una **variable** es un espacio con nombre donde guardas un valor para usarlo después.

\`\`\`js
let edad = 25;        // puede cambiar más adelante
const nombre = "Ana";  // no puede volver a asignarse
\`\`\`

- Usa **const** por defecto (la mayoría de tus variables no necesitan cambiar).
- Usa **let** solo cuando sepas que el valor va a cambiar.
- Evita **var** — es la forma vieja, con reglas más confusas (lo vemos en la lección de funciones y scope).

### Los tipos básicos

\`\`\`js
let numero = 42;           // number
let texto = "Hola";        // string
let esVerdad = true;       // boolean
let vacio = null;          // "vacío a propósito"
let sinDefinir;            // undefined — no se le asignó nada todavía
\`\`\`

### Operadores básicos

\`\`\`js
console.log(5 + 3);   // 8  (suma)
console.log(5 - 3);   // 2  (resta)
console.log(5 * 3);   // 15 (multiplicación)
console.log(5 / 3);   // 1.666... (división)
console.log(5 % 3);   // 2  (resto de la división)
\`\`\``,

        base: `## Declaración de variables: let, const y var

\`\`\`js
let edad = 25;         // reasignable
const PI = 3.14159;    // constante — no se puede reasignar
var legacy = "evitar";  // scope de función, no de bloque (ver lección de scope)
\`\`\`

**Regla práctica**: usa \`const\` por defecto. Cambia a \`let\` solo si el valor
realmente necesita reasignarse (un contador, un acumulador). \`var\` casi nunca
se usa en código moderno.

\`\`\`js
const usuario = { nombre: "Ana" };
usuario.nombre = "Luis"; // válido — const impide reasignar la variable,
                          // no impide mutar el contenido de un objeto/array
usuario = {};             // TypeError: Assignment to constant variable
\`\`\`

### Los tipos primitivos

JavaScript tiene 7 tipos primitivos: \`number\`, \`string\`, \`boolean\`, \`null\`,
\`undefined\`, \`symbol\` y \`bigint\`. Los más comunes en el día a día:

\`\`\`js
typeof 42          // "number"
typeof "hola"       // "string"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object" — sí, es un bug histórico de JavaScript,
                     // se mantiene por compatibilidad hacia atrás
\`\`\`

### Coerción de tipos: == vs ===

\`==\` compara **después de convertir tipos** (coerción). \`===\` compara **sin
convertir nada** (comparación estricta).

\`\`\`js
5 == "5"    // true  — "5" se convierte a número antes de comparar
5 === "5"   // false — tipos distintos, ni se intenta convertir

null == undefined   // true  (caso especial)
null === undefined  // false (tipos distintos)

NaN === NaN  // false — NaN nunca es igual a sí mismo, ni con ===
\`\`\`

**Regla práctica**: usa siempre \`===\` y \`!==\`. La coerción de \`==\` tiene
suficientes casos raros como para evitarla directamente.`,

        advanced: `## Coerción de tipos, precisión numérica y sus trampas

### Coerción implícita: cuándo JavaScript "adivina"

JavaScript convierte tipos automáticamente en varios contextos, y el resultado
no siempre es intuitivo:

\`\`\`js
"5" + 3      // "53"  — + con un string concatena
"5" - 3      // 2     — - fuerza conversión numérica
"5" * "2"    // 10    — * también fuerza numérica
[] + []      // ""    — arrays se convierten a string, "" + "" = ""
[] + {}      // "[object Object]"
\`\`\`

Este tipo de comportamiento es la razón por la que \`===\` y una función de
validación explícita son mejores que confiar en la coerción implícita.

### Precisión de punto flotante

JavaScript usa números de punto flotante (IEEE 754) para *todos* los números,
no solo los decimales. Esto trae una trampa clásica:

\`\`\`js
0.1 + 0.2 === 0.3   // false !
0.1 + 0.2           // 0.30000000000000004
\`\`\`

No es un bug de JavaScript — es cómo funciona la aritmética de punto flotante
binaria en (casi) todos los lenguajes. La solución práctica: comparar con un
margen de tolerancia, o trabajar con enteros cuando la precisión importa (ej:
guardar centavos en vez de pesos con decimales).

\`\`\`js
function sonCercanos(a, b, epsilon = 0.0001) {
  return Math.abs(a - b) < epsilon;
}
sonCercanos(0.1 + 0.2, 0.3); // true
\`\`\`

### typeof no es suficiente para todo

\`\`\`js
typeof null          // "object" (bug histórico)
typeof []             // "object" (los arrays son objetos)
typeof NaN            // "number" (NaN es técnicamente un number)
typeof function(){}   // "function"
\`\`\`

Para distinguir estos casos específicos hace falta más que \`typeof\`:
\`Array.isArray()\`, \`Number.isNaN()\`, o comparar directamente con \`=== null\`.`,
      },
    },

    {
      id: 'lesson-5-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-5-simplified',
          title: 'Convertir Fahrenheit a Celsius',
          description: 'Completa la fórmula de conversión: C = (F - 32) * 5/9',
          code: `let temperaturaF = 212;

// Completa la conversión a Celsius
let temperaturaC = 0; // reemplaza esta línea

console.log(temperaturaC);`,
          expectedOutput: '100',
          hints: [
            'La fórmula es: (temperaturaF - 32) * 5 / 9',
            'let temperaturaC = (temperaturaF - 32) * 5 / 9;',
          ],
          solution: `let temperaturaF = 212;
let temperaturaC = (temperaturaF - 32) * 5 / 9;
console.log(temperaturaC);`,
        },
        base: {
          id: 'code-5-base',
          title: 'Comparación estricta',
          description:
            'Implementa sonIguales usando === (comparación estricta, sin coerción de tipos).',
          code: `function sonIguales(a, b) {
  // Usa el operador de comparación estricta
}

console.log(sonIguales(5, "5"));
console.log(sonIguales(5, 5));
console.log(sonIguales(null, undefined));
console.log(sonIguales(NaN, NaN));`,
          expectedOutput: 'false\ntrue\nfalse\nfalse',
          hints: [
            'return a === b;',
            'Recuerda: NaN === NaN también da false, incluso comparando el mismo valor consigo mismo',
          ],
          solution: `function sonIguales(a, b) {
  return a === b;
}

console.log(sonIguales(5, "5"));
console.log(sonIguales(5, 5));
console.log(sonIguales(null, undefined));
console.log(sonIguales(NaN, NaN));`,
        },
        advanced: {
          id: 'code-5-advanced',
          title: 'Detector de tipos preciso',
          description:
            'Implementa getType distinguiendo null, array y NaN de sus categorías typeof engañosas.',
          code: `function getType(value) {
  // Debe devolver: 'null', 'array', 'nan',
  // o el resultado normal de typeof para el resto
  // Pistas: typeof null es 'object' — hay que comprobarlo aparte
  //         Array.isArray() detecta arrays
  //         Number.isNaN() detecta NaN específicamente
}

console.log(getType(42));
console.log(getType(null));
console.log(getType([1, 2, 3]));
console.log(getType(NaN));
console.log(getType('hola'));
console.log(getType(undefined));`,
          expectedOutput: 'number\nnull\narray\nnan\nstring\nundefined',
          hints: [
            "if (value === null) return 'null'; — revísalo ANTES de typeof",
            "if (Array.isArray(value)) return 'array';",
            "if (typeof value === 'number' && Number.isNaN(value)) return 'nan';",
          ],
          solution: `function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number' && Number.isNaN(value)) return 'nan';
  return typeof value;
}

console.log(getType(42));
console.log(getType(null));
console.log(getType([1, 2, 3]));
console.log(getType(NaN));
console.log(getType('hola'));
console.log(getType(undefined));`,
        },
      },
    },

    {
      id: 'lesson-5-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'l5-q1-simple',
            question: '¿Cuál es la diferencia principal entre let y const?',
            options: [
              'const no permite reasignar la variable después de crearla',
              'const es más rápido de ejecutar',
              'let solo funciona con números',
              'No hay ninguna diferencia real',
            ],
            correctIndex: 0,
            explanation:
              'const crea una variable que no puede volver a asignarse. let sí permite reasignación. La velocidad de ejecución es la misma para ambas.',
            commonMistakes: {
              1: 'No hay diferencia de performance entre let y const — la diferencia es puramente sobre si se puede reasignar o no.',
              2: 'Ambas funcionan con cualquier tipo de dato, no solo números.',
              3: 'Sí hay una diferencia real e importante: const previene la reasignación accidental.',
            },
          },
          {
            id: 'l5-q2-simple',
            question: '¿Qué imprime `console.log(typeof "hola")`?',
            options: [
              '"string"',
              '"hola"',
              '"text"',
              'true',
            ],
            correctIndex: 0,
            explanation:
              'typeof devuelve un string describiendo el tipo del valor. Para cualquier cadena de texto, ese tipo es "string".',
            commonMistakes: {
              1: 'typeof no devuelve el valor en sí, devuelve el nombre del tipo de dato.',
              2: '"text" no es un tipo válido en JavaScript — el nombre correcto es "string".',
              3: 'typeof siempre devuelve un string (el nombre del tipo), nunca un booleano.',
            },
          },
        ],
        base: [
          {
            id: 'l5-q1-base',
            question: '¿Qué imprime `console.log(5 == "5")` y `console.log(5 === "5")`?',
            options: [
              'true, true',
              'false, false',
              'false, true',
              'true, false',
            ],
            correctIndex: 3,
            explanation:
              '== convierte tipos antes de comparar ("5" se convierte a número 5, entonces 5==5 es true). === no convierte nada, y como los tipos son distintos (number vs string), da false.',
            commonMistakes: {
              0: '=== no hace conversión de tipos — al ser number vs string, nunca da true.',
              1: '== sí hace conversión de tipos, así que si los valores coinciden tras convertir, da true.',
              2: 'Es al revés: == es el que hace la conversión (da true), === es el estricto (da false).',
            },
          },
          {
            id: 'l5-q2-base',
            question:
              'Un objeto fue creado con const. ¿Cuál de estas operaciones es válida?',
            options: [
              'Modificar una propiedad del objeto existente',
              'Reasignar la variable a un objeto completamente nuevo',
              'Ninguna — const bloquea cualquier cambio',
              'Solo se puede leer el objeto, nunca modificarlo',
            ],
            correctIndex: 0,
            explanation:
              'const impide reasignar la variable en sí (que apunte a otro objeto), pero no impide mutar las propiedades del objeto al que ya apunta.',
            commonMistakes: {
              1: 'Esto es exactamente lo que const prohíbe — reasignar la variable a otra referencia.',
              2: 'const no congela el objeto — solo protege la variable de ser reasignada. El contenido sigue siendo mutable.',
              3: 'Se puede leer Y modificar propiedades — const no vuelve el objeto de solo lectura.',
            },
          },
        ],
        advanced: [
          {
            id: 'l5-q1-advanced',
            question: '¿Por qué `0.1 + 0.2 === 0.3` da `false` en JavaScript?',
            options: [
              'Es un bug específico de JavaScript que otros lenguajes no tienen',
              'Es una consecuencia de cómo funciona la aritmética de punto flotante binaria (IEEE 754), común a la mayoría de los lenguajes',
              'JavaScript redondea mal los números por diseño',
              '=== no debería usarse nunca con números',
            ],
            correctIndex: 1,
            explanation:
              'La representación binaria de punto flotante no puede expresar exactamente ciertos decimales (igual que 1/3 no tiene representación decimal exacta). Esto afecta a prácticamente todos los lenguajes que usan IEEE 754, no es exclusivo de JavaScript.',
            commonMistakes: {
              0: 'La mayoría de los lenguajes modernos (Python, Java, C++, etc.) tienen exactamente el mismo comportamiento con punto flotante.',
              2: 'No es un tema de redondeo "mal hecho" — es una limitación matemática inherente a representar ciertos decimales en binario.',
              3: '=== sigue siendo la comparación correcta a usar — el problema no es el operador, es comparar floats por igualdad exacta sin margen de tolerancia.',
            },
          },
          {
            id: 'l5-q2-advanced',
            question: '¿Qué devuelve `typeof null`, y por qué es considerado un "bug histórico"?',
            options: [
              '"null" — es coherente con el resto del lenguaje',
              '"object" — un error de la implementación original de JavaScript que se mantiene por compatibilidad',
              '"undefined" — porque null representa ausencia de valor',
              'Lanza un TypeError',
            ],
            correctIndex: 1,
            explanation:
              'typeof null devuelve "object" por un detalle de la implementación original de JavaScript (1995) relacionado con cómo se representaban internamente los tipos. Es ampliamente reconocido como un error, pero corregirlo rompería código existente, así que se mantiene permanentemente.',
            commonMistakes: {
              0: 'De hecho es lo opuesto a coherente — es la excepción rara que todos los desarrolladores de JS terminan memorizando.',
              2: 'undefined y null son valores distintos con typeof distinto: typeof undefined es "undefined", pero typeof null es (incorrectamente) "object".',
              3: 'No lanza ningún error — typeof es seguro de usar con cualquier valor, incluido null, y siempre devuelve un string.',
            },
          },
        ],
      },
    },
  ],
};
