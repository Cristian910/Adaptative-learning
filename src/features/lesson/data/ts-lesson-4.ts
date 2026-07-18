import type { LessonContent } from '../../../types/domain';

export const tsLesson4: LessonContent = {
  id: 'ts-lesson-4',
  title: 'Unions, Narrowing y Enums',
  subtitle: 'Cuando un valor puede ser de más de un tipo',
  level: 'intermediate',
  track: 'typescript',
  prerequisites: ['ts-lesson-3'],
  blocks: [
    {
      id: 'ts-lesson-4-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Union types: "esto puede ser A o B"

Con \`|\` (pipe) se describe un valor que puede ser de más de un tipo:

\`\`\`ts
function formatearId(id: string | number): string {
  return \`ID-\${id}\`;
}

formatearId(42);     // válido — es number
formatearId("abc");   // válido — es string
formatearId(true);    // ❌ Error — boolean no está permitido
\`\`\`

\`string | number\` significa "tiene que ser string, o tiene que ser number" — cualquier otro tipo no es válido para ese parámetro.`,

        base: `## Narrowing: usar typeof para "achicar" un union type

Cuando un parámetro puede ser de varios tipos, antes de usar un método específico de uno de ellos hay que verificar cuál es, con \`typeof\`:

\`\`\`ts
function describirValor(valor: string | number | boolean): string {
  if (typeof valor === 'string') {
    return 'texto: ' + valor.trim(); // aquí TS ya sabe que valor es string
  }
  if (typeof valor === 'number') {
    return 'numero: ' + valor.toFixed(0); // aquí ya sabe que es number
  }
  return 'booleano: ' + valor;
}
\`\`\`

Dentro de cada \`if\`, TypeScript "achica" (narrows) el tipo del union al caso verificado — por eso puedes usar \`.trim()\` (método de string) sin que se queje, aun cuando el tipo declarado del parámetro sea el union completo.

### Narrowing con Array.isArray y otras validaciones

\`typeof\` no distingue arrays de objetos (ambos dan "object"). Para esos casos se usan otras validaciones:

\`\`\`ts
function procesar(valor: number[] | string): number {
  if (Array.isArray(valor)) {
    return valor.length; // TS sabe que aquí es number[]
  }
  return valor.length; // TS sabe que aquí es string
}
\`\`\``,

        advanced: `## Discriminated unions: el patrón más usado para modelar variantes

Cuando tienes varias "formas" posibles de un dato, cada una con una propiedad en común que las distingue (el *discriminante*), TypeScript puede usarla para saber automáticamente con cuál está trabajando:

\`\`\`ts
interface Circulo {
  tipo: 'circulo';
  radio: number;
}
interface Rectangulo {
  tipo: 'rectangulo';
  ancho: number;
  alto: number;
}
type Forma = Circulo | Rectangulo;

function area(forma: Forma): number {
  if (forma.tipo === 'circulo') {
    return Math.PI * forma.radio ** 2; // aquí TS sabe que forma es Circulo
  }
  return forma.ancho * forma.alto; // aquí sabe que es Rectangulo
}
\`\`\`

La propiedad \`tipo\` (con un valor literal distinto en cada interface: \`'circulo'\` vs \`'rectangulo'\`) es el discriminante. Al comparar \`forma.tipo === 'circulo'\`, TypeScript no solo verifica el valor — también "achica" el tipo de \`forma\` a \`Circulo\` dentro de ese bloque, dándote acceso seguro a \`radio\` sin necesidad de un cast manual.

### Enums vs. unions de literales

TypeScript tiene \`enum\` para nombrar un conjunto fijo de valores, pero en código moderno es más común usar una unión de strings literales — es más simple y se comporta mejor con JavaScript:

\`\`\`ts
// Con enum:
enum Estado { Pendiente, Completado, Cancelado }

// Alternativa más común hoy en día:
type Estado = 'pendiente' | 'completado' | 'cancelado';

function procesarEstado(estado: Estado) {
  if (estado === 'completado') { /* ... */ }
}
\`\`\`

La unión de literales no genera código extra al compilar (los enums sí generan un objeto JavaScript real), y se integra mejor con APIs externas que ya devuelven strings.`,
      },
    },

    {
      id: 'ts-lesson-4-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-ts4-simplified',
          title: 'Union types básicos',
          description: 'Completa formatearId: recibe un string o un number.',
          code: `function formatearId(id: string | number): string {
  // Completa: devolver "ID-" seguido del id
  return '';
}

console.log(formatearId(42));
console.log(formatearId('abc'));`,
          expectedOutput: 'ID-42\nID-abc',
          hints: ['Usa un template literal: `ID-${id}`'],
          solution: `function formatearId(id: string | number): string {
  return \`ID-\${id}\`;
}

console.log(formatearId(42));
console.log(formatearId('abc'));`,
        },
        base: {
          id: 'code-ts4-base',
          title: 'Narrowing con typeof',
          description: 'Completa describirValor distinguiendo los 3 tipos posibles con typeof.',
          code: `function describirValor(valor: string | number | boolean): string {
  // Si es string: "texto: " + valor
  // Si es number: "numero: " + valor
  // Si es boolean: "booleano: " + valor
  return '';
}

console.log(describirValor('hola'));
console.log(describirValor(42));
console.log(describirValor(true));`,
          expectedOutput: 'texto: hola\nnumero: 42\nbooleano: true',
          hints: [
            "if (typeof valor === 'string') return 'texto: ' + valor;",
            "if (typeof valor === 'number') return 'numero: ' + valor;",
            'Para el caso restante (boolean), no hace falta otro if',
          ],
          solution: `function describirValor(valor: string | number | boolean): string {
  if (typeof valor === 'string') return 'texto: ' + valor;
  if (typeof valor === 'number') return 'numero: ' + valor;
  return 'booleano: ' + valor;
}

console.log(describirValor('hola'));
console.log(describirValor(42));
console.log(describirValor(true));`,
        },
        advanced: {
          id: 'code-ts4-advanced',
          title: 'Discriminated unions',
          description: 'Completa area usando el discriminante "tipo" para distinguir Circulo de Rectangulo.',
          code: `interface Circulo { tipo: 'circulo'; radio: number; }
interface Rectangulo { tipo: 'rectangulo'; ancho: number; alto: number; }
type Forma = Circulo | Rectangulo;

function area(forma: Forma): number {
  // Si forma.tipo === 'circulo': Math.PI * radio^2, redondeado a 2 decimales
  //   (Math.round(x * 100) / 100)
  // Si es 'rectangulo': ancho * alto
  return 0;
}

console.log(area({ tipo: 'circulo', radio: 3 }));
console.log(area({ tipo: 'rectangulo', ancho: 4, alto: 5 }));`,
          expectedOutput: '28.27\n20',
          hints: [
            "if (forma.tipo === 'circulo') { return Math.round(Math.PI * forma.radio * forma.radio * 100) / 100; }",
            'return forma.ancho * forma.alto;',
          ],
          solution: `interface Circulo { tipo: 'circulo'; radio: number; }
interface Rectangulo { tipo: 'rectangulo'; ancho: number; alto: number; }
type Forma = Circulo | Rectangulo;

function area(forma: Forma): number {
  if (forma.tipo === 'circulo') {
    return Math.round(Math.PI * forma.radio * forma.radio * 100) / 100;
  }
  return forma.ancho * forma.alto;
}

console.log(area({ tipo: 'circulo', radio: 3 }));
console.log(area({ tipo: 'rectangulo', ancho: 4, alto: 5 }));`,
        },
      },
    },

    {
      id: 'ts-lesson-4-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'tsl4-q1-simple',
            question: 'Dado `function f(valor: string | number)`, ¿cuál de estas llamadas es inválida?',
            options: ['f(42)', "f('hola')", 'f(true)', 'f(0)'],
            correctIndex: 2,
            explanation:
              'string | number significa que el valor tiene que ser string O number — boolean no es ninguna de las dos opciones, así que f(true) no es válido para este parámetro.',
            commonMistakes: {
              0: '42 es un number, que es una de las dos opciones permitidas por el union — es válido.',
              1: "'hola' es un string, la otra opción permitida por el union — también es válido.",
              3: '0 es un number válido (distinto de string o boolean, pero number sigue siendo una de las opciones permitidas).',
            },
          },
          {
            id: 'tsl4-q2-simple',
            question: '¿Qué significa el símbolo `|` en un tipo como `string | number`?',
            options: [
              'División matemática',
              'Que el valor tiene que ser string Y number al mismo tiempo',
              'Que el valor puede ser string O number (una de las dos opciones)',
              'Un comentario en TypeScript',
            ],
            correctIndex: 2,
            explanation:
              '| (pipe) forma una unión de tipos: el valor puede ser cualquiera de las opciones listadas, pero solo una a la vez. Es lo opuesto a & (intersección), que exige cumplir con todas las opciones simultáneamente.',
            commonMistakes: {
              0: 'En el contexto de tipos, | no es un operador matemático — es la sintaxis para describir una unión de tipos posibles.',
              1: 'Eso describiría una intersección (con &, no con |) — un union permite una opción u otra, no exige ambas a la vez.',
              3: 'No es un comentario — es sintaxis activa que define qué tipos son válidos para ese valor.',
            },
          },
        ],
        base: [
          {
            id: 'tsl4-q1-base',
            question:
              "Dentro de `if (typeof valor === 'string') { /* aquí */ }`, si valor era de tipo `string | number`, ¿qué tipo tiene TypeScript adentro del bloque?",
            options: [
              'Sigue siendo string | number, sin cambios',
              'any',
              'string — TypeScript achicó (narrowed) el tipo según la verificación',
              'El código no compila',
            ],
            correctIndex: 2,
            explanation:
              'Dentro del bloque if, después de verificar typeof valor === \'string\', TypeScript sabe que en ESE bloque específico valor solo puede ser string — descarta la posibilidad de number mientras estás ahí adentro. Esto es narrowing.',
            commonMistakes: {
              0: 'Justamente lo que hace narrowing es cambiar el tipo dentro del bloque — fuera del if, ahí sí seguiría siendo el union completo.',
              1: 'any sería perder toda la información de tipo — es lo opuesto de lo que hace narrowing, que vuelve el tipo MÁS específico, no menos.',
              3: 'El código es perfectamente válido — de hecho, este patrón (typeof + if) es la forma más común de trabajar con union types.',
            },
          },
          {
            id: 'tsl4-q2-base',
            question: '¿Por qué `typeof` no alcanza para distinguir un array de un objeto plano?',
            options: [
              'typeof no existe en TypeScript',
              'Los arrays no tienen ningún tipo en TypeScript',
              'typeof devuelve "object" tanto para arrays como para objetos planos — hace falta Array.isArray() para distinguirlos',
              'typeof siempre devuelve "array" para los arrays',
            ],
            correctIndex: 2,
            explanation:
              'typeof [1,2,3] devuelve "object", igual que typeof {a: 1} — es una particularidad heredada de JavaScript. Para distinguir específicamente si algo es un array, se usa Array.isArray(valor), que sí diferencia correctamente entre ambos casos.',
            commonMistakes: {
              0: 'typeof es un operador válido tanto en JavaScript como en TypeScript — el problema es específicamente su falta de precisión con arrays.',
              1: 'Los arrays sí tienen tipo (number[], string[], etc.) — el problema es que typeof en tiempo de EJECUCIÓN no distingue arrays de objetos.',
              3: 'Ese es justo el error común — typeof de un array da "object", no "array".',
            },
          },
        ],
        advanced: [
          {
            id: 'tsl4-q1-advanced',
            question:
              'En una discriminated union como `{ tipo: "circulo", radio } | { tipo: "rectangulo", ancho, alto }`, ¿qué rol cumple la propiedad `tipo`?',
            options: [
              'Es decorativa, no afecta cómo TypeScript analiza el código',
              'Es el "discriminante": un valor literal distinto en cada variante que TypeScript usa para achicar el tipo automáticamente al compararlo',
              'Sirve solo para mostrarla en pantalla al usuario',
              'Hace que el código corra más lento',
            ],
            correctIndex: 1,
            explanation:
              'La propiedad discriminante (aquí, tipo) tiene un valor literal específico en cada variante de la unión ("circulo" en una, "rectangulo" en otra). Cuando comparas forma.tipo === "circulo", TypeScript no solo evalúa esa condición en runtime — también usa esa información para "achicar" el tipo de forma a Circulo específicamente dentro de ese bloque, dándote acceso type-safe a radio sin ningún cast manual.',
            commonMistakes: {
              0: 'Es todo lo contrario — el discriminante es justamente lo que le permite a TypeScript razonar sobre cuál variante de la unión estás manejando en cada bloque.',
              2: 'Aunque puede mostrarse en pantalla si hace falta, su rol principal en TypeScript es habilitar el narrowing automático, no la presentación.',
              3: 'No tiene ningún costo de performance — es análisis estático que TypeScript hace al compilar, no agrega lógica extra al JavaScript final.',
            },
          },
          {
            id: 'tsl4-q2-advanced',
            question:
              '¿Por qué en código TypeScript moderno se prefiere frecuentemente `type Estado = "pendiente" | "completado"` en vez de `enum Estado { Pendiente, Completado }`?',
            options: [
              'Los enums no existen en TypeScript',
              'Los enums son más rápidos que las uniones de literales',
              'La unión de literales no genera ningún código JavaScript extra al compilar, y se integra directamente con APIs externas que devuelven strings; un enum sí genera un objeto JavaScript real',
              'No hay ninguna diferencia práctica entre ambos enfoques',
            ],
            correctIndex: 2,
            explanation:
              'Un enum compila a un objeto JavaScript real en el código final (código extra que existe en runtime), mientras que una unión de tipos literales es puramente un concepto de TypeScript que desaparece por completo al compilar. Además, si una API externa devuelve el string "completado", compararlo directamente contra una unión de literales es inmediato, mientras que con un enum requeriría mapear ese string al valor del enum primero.',
            commonMistakes: {
              0: 'Los enums sí existen y son válidos en TypeScript — la pregunta es sobre cuál conviene más en código moderno, no sobre si uno de los dos no existe.',
              1: 'La diferencia de performance entre ambos enfoques es insignificante en la práctica — la razón real para preferir uniones es la simplicidad y la integración con JSON/APIs.',
              3: 'Hay diferencias prácticas reales, sobre todo en el código generado y en la interoperabilidad con datos externos.',
            },
          },
        ],
      },
    },
  ],
};
