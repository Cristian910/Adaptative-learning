import type { LessonContent } from '../../../types/domain';

export const lesson8: LessonContent = {
  id: 'lesson-8',
  title: 'Destructuring, Spread/Rest y Template Literals',
  subtitle: 'Sintaxis moderna que vas a ver en casi todo el código JS actual',
  level: 'intermediate',
  track: 'javascript',
  prerequisites: ['lesson-4'],
  blocks: [
    {
      id: 'lesson-8-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Destructuring: sacar valores de un objeto o array

En vez de acceder propiedad por propiedad, puedes "desempaquetar" varias a la vez:

\`\`\`js
const persona = { nombre: 'Ana', edad: 28 };

// Forma larga
const nombre = persona.nombre;
const edad = persona.edad;

// Con destructuring — mismo resultado, menos código
const { nombre, edad } = persona;
\`\`\`

También funciona con arrays, por posición:

\`\`\`js
const colores = ['rojo', 'verde', 'azul'];
const [primero, segundo] = colores;
console.log(primero); // 'rojo'
\`\`\`

## Template literals: strings con variables adentro

\`\`\`js
const nombre = 'Ana';
const edad = 28;

// Forma vieja (concatenación)
console.log('Hola ' + nombre + ', tienes ' + edad + ' años');

// Template literal — con backticks \` y \${...}
console.log(\`Hola \${nombre}, tienes \${edad} años\`);
\`\`\``,

        base: `## Destructuring de objetos y arrays

\`\`\`js
const producto = { nombre: 'Mouse', precio: 25, stock: 10 };

// Renombrar mientras destructuras
const { nombre: nombreProducto, precio } = producto;

// Valor por defecto si la propiedad no existe
const { descuento = 0 } = producto;

// En arrays: puedes saltear posiciones con comas vacías
const [, segundo, tercero] = [10, 20, 30];
console.log(segundo, tercero); // 20 30
\`\`\`

### Destructuring en parámetros de función

\`\`\`js
function saludar({ nombre, edad }) {
  return \`Hola \${nombre}, tienes \${edad} años\`;
}
saludar({ nombre: 'Ana', edad: 28 });
\`\`\`

## Spread (...) y Rest (...)

Mismo símbolo, dos usos opuestos según el contexto:

\`\`\`js
// Spread: "expandir" un array/objeto en sus elementos
const a = [1, 2];
const b = [3, 4];
const combinado = [...a, ...b]; // [1, 2, 3, 4]

const base = { nombre: 'Ana' };
const extendido = { ...base, edad: 28 }; // { nombre: 'Ana', edad: 28 }

// Rest: "recolectar" argumentos sueltos en un array
function sumarTodos(...numeros) {
  return numeros.reduce((acc, n) => acc + n, 0);
}
sumarTodos(1, 2, 3, 4); // 10 — cualquier cantidad de argumentos
\`\`\`

**Regla práctica**: si \`...\` está del lado donde se CREA algo (parámetros de
función, patrón de destructuring), es rest. Si está del lado donde se USA algo
ya existente (dentro de \`[...]\` o \`{...}\` al construir), es spread.`,

        advanced: `## Destructuring anidado, defaults combinados y edge cases

### Destructuring anidado con defaults

\`\`\`js
function crearPerfil({
  nombre,
  edad = 18,
  direccion: { ciudad = 'Desconocida' } = {},
} = {}) {
  return \`\${nombre}, \${edad} años, vive en \${ciudad}\`;
}

crearPerfil({ nombre: 'Ana', direccion: { ciudad: 'Córdoba' } });
// 'Ana, 18 años, vive en Córdoba'

crearPerfil(); // no revienta — el = {} en el parámetro cubre "sin argumento"
// 'undefined, 18 años, vive en Desconocida'
\`\`\`

El \`= {}\` en \`direccion: {...} = {}\` es crítico: sin él, destructurar
\`direccion\` cuando no existe (\`undefined\`) lanzaría un TypeError, porque no
se puede destructurar \`undefined\`.

### Spread es una copia superficial (mismo caveat que en la lección de arrays/objetos)

\`\`\`js
const original = { a: 1, anidado: { b: 2 } };
const copia = { ...original };
copia.anidado.b = 99;
console.log(original.anidado.b); // 99 — el objeto anidado se comparte
\`\`\`

### Rest siempre debe ir al final

\`\`\`js
function f(a, b, ...resto) { }  // ✅ válido
function f(...resto, a, b) { }  // ❌ SyntaxError — rest debe ser el último parámetro
\`\`\`

Lo mismo aplica en destructuring: \`const [primero, ...resto] = arr;\` es
válido, pero \`...resto\` siempre tiene que ir al final del patrón.

### Template literals multilínea y anidados

\`\`\`js
const items = ['a', 'b', 'c'];
const html = \`
  <ul>
    \${items.map(i => \`<li>\${i}</li>\`).join('')}
  </ul>
\`;
// Los template literals pueden anidarse (backtick dentro de \${...})
// y abarcar múltiples líneas sin necesitar \\n explícito
\`\`\``,
      },
    },

    {
      id: 'lesson-8-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-8-simplified',
          title: 'Destructurar un objeto',
          description: 'Extrae nombre y edad de persona usando destructuring.',
          code: `const persona = { nombre: 'Ana', edad: 28, ciudad: 'Córdoba' };

// Destructura nombre y edad en una sola línea

console.log(nombre);
console.log(edad);`,
          expectedOutput: 'Ana\n28',
          hints: [
            'const { nombre, edad } = persona;',
            'No hace falta destructurar ciudad si no la usas',
          ],
          solution: `const persona = { nombre: 'Ana', edad: 28, ciudad: 'Córdoba' };
const { nombre, edad } = persona;
console.log(nombre);
console.log(edad);`,
        },
        base: {
          id: 'code-8-base',
          title: 'Rest parameters y spread',
          description: 'Implementa sumarTodos con rest params, y combina dos arrays con spread.',
          code: `function sumarTodos(...numeros) {
  // Suma todos los números recibidos (puedes usar reduce)
}

console.log(sumarTodos(1, 2, 3));
console.log(sumarTodos(1, 2, 3, 4, 5));

const a = [1, 2];
const b = [3, 4];
// Combina a y b en un solo array usando spread
const combinado = []; // reemplaza esta línea

console.log(combinado.join(','));`,
          expectedOutput: '6\n15\n1,2,3,4',
          hints: [
            'return numeros.reduce((acc, n) => acc + n, 0);',
            'const combinado = [...a, ...b];',
          ],
          solution: `function sumarTodos(...numeros) {
  return numeros.reduce((acc, n) => acc + n, 0);
}

console.log(sumarTodos(1, 2, 3));
console.log(sumarTodos(1, 2, 3, 4, 5));

const a = [1, 2];
const b = [3, 4];
const combinado = [...a, ...b];

console.log(combinado.join(','));`,
        },
        advanced: {
          id: 'code-8-advanced',
          title: 'Destructuring anidado con defaults',
          description:
            'Implementa crearPerfil con destructuring anidado, valores por defecto, y un template literal.',
          code: `function crearPerfil(/* completa los parámetros con destructuring */) {
  // Debe destructurar: nombre, edad (default 18),
  // y direccion.ciudad (default 'Desconocida'), con el objeto completo
  // también con default {} para que crearPerfil() sin argumentos no explote.
  // Devuelve: \`\${nombre}, \${edad} años, vive en \${ciudad}\`
}

console.log(crearPerfil({ nombre: 'Ana', edad: 28, direccion: { ciudad: 'Córdoba' } }));
console.log(crearPerfil({ nombre: 'Luis' }));
console.log(crearPerfil());`,
          expectedOutput:
            'Ana, 28 años, vive en Córdoba\nLuis, 18 años, vive en Desconocida\nundefined, 18 años, vive en Desconocida',
          hints: [
            'function crearPerfil({ nombre, edad = 18, direccion: { ciudad = "Desconocida" } = {} } = {}) { ... }',
            'El = {} en direccion es necesario para que no explote cuando direccion no viene',
          ],
          solution: `function crearPerfil({ nombre, edad = 18, direccion: { ciudad = 'Desconocida' } = {} } = {}) {
  return \`\${nombre}, \${edad} años, vive en \${ciudad}\`;
}

console.log(crearPerfil({ nombre: 'Ana', edad: 28, direccion: { ciudad: 'Córdoba' } }));
console.log(crearPerfil({ nombre: 'Luis' }));
console.log(crearPerfil());`,
        },
      },
    },

    {
      id: 'lesson-8-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'l8-q1-simple',
            question: 'Dado `const { nombre } = persona;`, ¿qué hace esta línea?',
            options: [
              'Crea un objeto nuevo llamado nombre',
              'Extrae la propiedad nombre de persona en una variable',
              'Verifica si persona tiene una propiedad nombre',
              'Elimina la propiedad nombre de persona',
            ],
            correctIndex: 1,
            explanation: 'Esto es destructuring: crea una variable nombre con el valor de persona.nombre, sin modificar persona.',
            commonMistakes: {
              0: 'No crea un objeto — crea una variable simple con el valor extraído.',
              2: 'No es una verificación — si nombre no existe, la variable simplemente queda undefined, sin error.',
              3: 'persona no se modifica en absoluto — destructuring solo LEE valores.',
            },
          },
          {
            id: 'l8-q2-simple',
            question: '¿Qué imprime `console.log(`Hola ${nombre}`)` si nombre vale "Ana"?',
            options: [
              '"Hola ${nombre}"',
              '"Hola undefined"',
              'Error de sintaxis',
              '"Hola Ana"',
            ],
            correctIndex: 3,
            explanation: 'Los template literals (con backticks) interpolan expresiones dentro de ${...} — el resultado incluye el valor real de la variable.',
            commonMistakes: {
              0: 'Eso pasaría si usaras comillas normales en vez de backticks — con backticks, ${} sí se interpola.',
              1: 'nombre tiene un valor asignado ("Ana"), así que no aparece como undefined.',
              2: 'La sintaxis es completamente válida — los template literals están soportados desde ES6.',
            },
          },
        ],
        base: [
          {
            id: 'l8-q1-base',
            question:
              '¿Qué imprime `console.log([...[1,2], ...[3,4]].join("-"))`?',
            options: [
              '"1,2-3,4"',
              'Error',
              '"[1,2][3,4]"',
              '"1-2-3-4"',
            ],
            correctIndex: 3,
            explanation: 'El spread expande ambos arrays en un solo array plano [1,2,3,4], y join("-") une sus elementos con guiones: "1-2-3-4".',
            commonMistakes: {
              0: 'El spread no mantiene los arrays como sub-grupos — los aplana en un solo array de 4 elementos.',
              1: 'La sintaxis es completamente válida — combina spread con join sin ningún problema.',
              2: 'join() no produce esa representación — convierte el array en un string uniendo sus valores.',
            },
          },
          {
            id: 'l8-q2-base',
            question: 'En `function f(a, b, ...resto) {}`, ¿qué tipo de dato es resto?',
            options: ['Un string', 'Un array con los argumentos sobrantes', 'Un objeto', 'undefined siempre'],
            correctIndex: 1,
            explanation: 'Los rest parameters recolectan todos los argumentos que sobran (después de los nombrados) en un array real.',
            commonMistakes: {
              0: 'resto nunca es un string — siempre es un array, aunque esté vacío.',
              2: 'Los rest parameters producen específicamente un array, no un objeto plano (a diferencia del objeto "arguments" legado).',
              3: 'Si no hay argumentos sobrantes, resto es un array VACÍO ([]), no undefined.',
            },
          },
        ],
        advanced: [
          {
            id: 'l8-q1-advanced',
            question:
              '¿Por qué `function crearPerfil({ direccion: { ciudad } = {} } = {}) {}` necesita el `= {}` después de `{ ciudad }`?',
            options: [
              'Es solo una convención de estilo, no cambia el comportamiento',
              'Mejora el rendimiento de la función',
              'Hace que ciudad sea obligatorio',
              'Sin ese default, llamar la función sin pasar `direccion` lanzaría un TypeError al intentar destructurar undefined',
            ],
            correctIndex: 3,
            explanation:
              'Si direccion no viene en el argumento, su valor es undefined. Destructurar undefined ({ ciudad } de undefined) lanza "Cannot destructure property \'ciudad\' of undefined". El = {} da un objeto vacío como fallback antes de intentar destructurarlo, evitando el error.',
            commonMistakes: {
              0: 'Tiene un efecto funcional real y necesario — sin él, el código puede explotar en runtime con ciertos argumentos.',
              1: 'No tiene ningún impacto de performance — es puramente para evitar un TypeError con argumentos incompletos.',
              2: 'Es al revés — el default hace que ciudad sea opcional (con su propio fallback), no obligatorio.',
            },
          },
          {
            id: 'l8-q2-advanced',
            question:
              '¿Qué pasa si escribes `function f(...resto, ultimo) {}`?',
            options: [
              'SyntaxError — el rest parameter debe ser siempre el último parámetro',
              'Funciona normalmente, resto recolecta todo menos el último argumento',
              'ultimo siempre vale undefined',
              'resto queda vacío siempre',
            ],
            correctIndex: 0,
            explanation:
              'El rest parameter tiene que ser el último de la lista de parámetros — JavaScript no sabe cuántos argumentos "reservar" para lo que viene después, así que esto es directamente un error de sintaxis, detectado antes de ejecutar nada.',
            commonMistakes: {
              1: 'No funciona en absoluto — es un error de sintaxis, ni siquiera llega a ejecutarse.',
              2: 'El código no llega a correr para que ultimo tenga ningún valor — falla al parsear.',
              3: 'Tampoco llega a ejecutarse — el error ocurre en tiempo de parseo, antes de cualquier lógica.',
            },
          },
        ],
      },
    },
  ],
};
