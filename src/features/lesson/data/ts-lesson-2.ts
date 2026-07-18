import type { LessonContent } from '../../../types/domain';

export const tsLesson2: LessonContent = {
  id: 'ts-lesson-2',
  title: 'Interfaces, Type Aliases y Objetos',
  subtitle: 'Cómo describir la forma de tus datos',
  level: 'base',
  track: 'typescript',
  prerequisites: ['ts-lesson-1'],
  blocks: [
    {
      id: 'ts-lesson-2-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Describir la forma de un objeto: interface

Una \`interface\` describe qué propiedades tiene que tener un objeto, y de qué tipo es cada una:

\`\`\`ts
interface Persona {
  nombre: string;
  edad: number;
}

const ana: Persona = { nombre: "Ana", edad: 30 };

const invalido: Persona = { nombre: "Luis" };
// ❌ Error: falta la propiedad 'edad'
\`\`\`

Si el objeto no tiene exactamente las propiedades que pide la interface (con el tipo correcto), TypeScript avisa antes de que el código corra.

### Propiedades opcionales

Agregando \`?\` después del nombre, una propiedad deja de ser obligatoria:

\`\`\`ts
interface Persona {
  nombre: string;
  edad: number;
  telefono?: string; // puede estar o no
}

const luis: Persona = { nombre: "Luis", edad: 25 }; // válido, sin telefono
\`\`\``,

        base: `## interface vs type: dos formas de describir datos

TypeScript tiene dos formas principales de nombrar la "forma" de un dato: \`interface\` y \`type\`. Para objetos simples, son casi intercambiables:

\`\`\`ts
interface Punto { x: number; y: number; }
type PuntoAlias = { x: number; y: number; };
\`\`\`

La diferencia práctica más común: \`interface\` se puede **extender** y **volver a declarar** para agregarle propiedades (útil en librerías); \`type\` es más flexible para describir cosas que no son objetos (uniones, tuplas, tipos primitivos con nombre).

### Propiedades opcionales y readonly

\`\`\`ts
interface Usuario {
  readonly id: number;       // no se puede reasignar después de creado
  nombre: string;
  email?: string;             // puede no estar presente
}

const u: Usuario = { id: 1, nombre: "Ana" };
u.id = 2;      // ❌ Error: id es readonly
u.email = "a@mail.com"; // ✅ válido, aunque no estaba en el objeto original
\`\`\`

### Extender interfaces

\`\`\`ts
interface Animal {
  nombre: string;
}

interface Mascota extends Animal {
  dueno: string;
}

const rex: Mascota = { nombre: "Rex", dueno: "Marta" }; // tiene ambas propiedades
\`\`\`

\`extends\` reutiliza todas las propiedades de la interface base y le permite agregar más — evita repetir la misma forma de datos en varios lugares.`,

        advanced: `## Type aliases avanzados: más allá de los objetos

\`type\` puede nombrar prácticamente cualquier cosa, no solo objetos — algo que \`interface\` no puede hacer:

\`\`\`ts
type ID = string | number;              // unión de tipos primitivos
type Coordenada = [number, number];      // tupla: array de largo fijo con tipos por posición
type Callback = (error: Error | null) => void; // forma de una función
\`\`\`

### Index signatures: objetos con claves dinámicas

Cuando no sabes de antemano los nombres exactos de las propiedades (por ejemplo, un diccionario), se usa una index signature:

\`\`\`ts
interface Inventario {
  [nombreProducto: string]: number;
}

const stock: Inventario = {
  manzanas: 10,
  peras: 5,
};
stock.bananas = 8; // válido: cualquier clave string, valor number
\`\`\`

### Intersección de tipos: combinar varias formas en una

\`&\` combina dos tipos en uno que exige TODAS las propiedades de ambos (a diferencia de \`|\`, que exige solo una de las opciones):

\`\`\`ts
type ConTimestamps = { creadoEn: Date; actualizadoEn: Date };
type Producto = { nombre: string; precio: number };

type ProductoConTimestamps = Producto & ConTimestamps;
// Debe tener nombre, precio, creadoEn y actualizadoEn — las 4 propiedades
\`\`\`

Esto es muy común para "agregarle" metadata común (timestamps, IDs) a varios tipos distintos sin duplicar esas propiedades en cada interface.`,
      },
    },

    {
      id: 'ts-lesson-2-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-ts2-simplified',
          title: 'Usar una interface',
          description: 'Completa describirLibro usando las propiedades de la interface Libro.',
          code: `interface Libro {
  titulo: string;
  autor: string;
  paginas: number;
}

function describirLibro(libro: Libro): string {
  // Completa: devolver "TITULO de AUTOR (PAGINAS paginas)"
  return '';
}

const libro1: Libro = { titulo: 'Dune', autor: 'Frank Herbert', paginas: 412 };
console.log(describirLibro(libro1));`,
          expectedOutput: 'Dune de Frank Herbert (412 paginas)',
          hints: [
            'Usa template literals: `${libro.titulo} ...`',
            'return `${libro.titulo} de ${libro.autor} (${libro.paginas} paginas)`;',
          ],
          solution: `interface Libro {
  titulo: string;
  autor: string;
  paginas: number;
}

function describirLibro(libro: Libro): string {
  return \`\${libro.titulo} de \${libro.autor} (\${libro.paginas} paginas)\`;
}

const libro1: Libro = { titulo: 'Dune', autor: 'Frank Herbert', paginas: 412 };
console.log(describirLibro(libro1));`,
        },
        base: {
          id: 'code-ts2-base',
          title: 'Propiedades opcionales',
          description: 'Completa saludar: si el usuario tiene email, inclúyelo en el saludo.',
          code: `interface Usuario {
  readonly id: number;
  nombre: string;
  email?: string;
}

function saludar(usuario: Usuario): string {
  // Si tiene email, devuelve "Hola NOMBRE (EMAIL)"
  // Si no, devuelve "Hola NOMBRE"
  return '';
}

console.log(saludar({ id: 1, nombre: 'Ana', email: 'ana@mail.com' }));
console.log(saludar({ id: 2, nombre: 'Luis' }));`,
          expectedOutput: 'Hola Ana (ana@mail.com)\nHola Luis',
          hints: [
            'Revisa si usuario.email existe con un if',
            'if (usuario.email) return `Hola ${usuario.nombre} (${usuario.email})`;',
          ],
          solution: `interface Usuario {
  readonly id: number;
  nombre: string;
  email?: string;
}

function saludar(usuario: Usuario): string {
  if (usuario.email) return \`Hola \${usuario.nombre} (\${usuario.email})\`;
  return \`Hola \${usuario.nombre}\`;
}

console.log(saludar({ id: 1, nombre: 'Ana', email: 'ana@mail.com' }));
console.log(saludar({ id: 2, nombre: 'Luis' }));`,
        },
        advanced: {
          id: 'code-ts2-advanced',
          title: 'Extender interfaces',
          description: 'Completa presentar y listarNombres usando la interface extendida Mascota.',
          code: `interface Animal { nombre: string; sonido: string; }
interface Mascota extends Animal { dueno: string; }

function presentar(m: Mascota): string {
  // Completa: "NOMBRE (de DUENO) hace SONIDO"
  return '';
}

function listarNombres(animales: Animal[]): string[] {
  // Completa: devolver un array con solo los nombres
  return [];
}

const perro: Mascota = { nombre: 'Rex', sonido: 'Guau', dueno: 'Marta' };
console.log(presentar(perro));
console.log(listarNombres([perro, { nombre: 'Michi', sonido: 'Miau' }]).join(', '));`,
          expectedOutput: 'Rex (de Marta) hace Guau\nRex, Michi',
          hints: [
            'presentar: return `${m.nombre} (de ${m.dueno}) hace ${m.sonido}`;',
            'listarNombres: animales.map(a => a.nombre)',
          ],
          solution: `interface Animal { nombre: string; sonido: string; }
interface Mascota extends Animal { dueno: string; }

function presentar(m: Mascota): string {
  return \`\${m.nombre} (de \${m.dueno}) hace \${m.sonido}\`;
}

function listarNombres(animales: Animal[]): string[] {
  return animales.map(a => a.nombre);
}

const perro: Mascota = { nombre: 'Rex', sonido: 'Guau', dueno: 'Marta' };
console.log(presentar(perro));
console.log(listarNombres([perro, { nombre: 'Michi', sonido: 'Miau' }]).join(', '));`,
        },
      },
    },

    {
      id: 'ts-lesson-2-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'tsl2-q1-simple',
            question:
              'Dada `interface Persona { nombre: string; edad: number; }`, ¿cuál de estos objetos es válido como Persona?',
            options: [
              '{ nombre: "Ana" }',
              '{ nombre: "Ana", edad: 30 }',
              '{ nombre: "Ana", edad: "30" }',
              '{ edad: 30 }',
            ],
            correctIndex: 1,
            explanation:
              'La interface exige AMBAS propiedades (nombre y edad), con sus tipos correctos (string y number respectivamente). Solo la opción 2 cumple con las dos condiciones.',
            commonMistakes: {
              0: 'Falta la propiedad edad, que la interface exige como obligatoria (no tiene ?).',
              2: 'edad tiene el tipo incorrecto: la interface pide number, pero "30" (entre comillas) es un string.',
              3: 'Falta la propiedad nombre, que también es obligatoria.',
            },
          },
          {
            id: 'tsl2-q2-simple',
            question: '¿Qué significa el `?` en `telefono?: string` dentro de una interface?',
            options: [
              'Que la propiedad es opcional — el objeto puede no tenerla',
              'Que la propiedad es de tipo boolean',
              'Que hay un error de sintaxis',
              'Que la propiedad solo acepta el valor null',
            ],
            correctIndex: 0,
            explanation:
              'El signo ? después del nombre de una propiedad la marca como opcional: un objeto puede cumplir con la interface sin incluir esa propiedad, y si la incluye, tiene que ser del tipo indicado (string, en este caso).',
            commonMistakes: {
              1: 'El ? no cambia el tipo declarado — telefono sigue siendo string, solo que ahora es opcional.',
              2: 'Es sintaxis válida y muy usada en TypeScript, no un error.',
              3: 'No es lo mismo que null — simplemente significa que la propiedad puede estar ausente del objeto.',
            },
          },
        ],
        base: [
          {
            id: 'tsl2-q1-base',
            question:
              'Dada `interface Usuario { readonly id: number; nombre: string; }`, ¿qué pasa si intentas hacer `usuario.id = 5` después de crear el objeto?',
            options: [
              'Funciona sin problema, igual que con cualquier otra propiedad',
              'readonly solo aplica a arrays, no a propiedades individuales',
              'Se actualiza id pero no nombre',
              'TypeScript marca un error: no se puede reasignar una propiedad readonly',
            ],
            correctIndex: 3,
            explanation:
              'readonly en una propiedad de interface impide reasignarla después de que el objeto fue creado — TypeScript marca error en tu editor si lo intentas. Es una garantía de tiempo de compilación, similar en espíritu a const pero para propiedades de objetos.',
            commonMistakes: {
              0: 'Justamente lo que readonly previene es esto — reasignar la propiedad da un error de TypeScript.',
              1: 'readonly se puede usar tanto en propiedades individuales de un objeto como en arrays (readonly string[]) — no es exclusivo de uno u otro.',
              2: 'readonly se aplica específicamente a la propiedad marcada, no afecta a las demás propiedades del objeto.',
            },
          },
          {
            id: 'tsl2-q2-base',
            question: '¿Cuál es la diferencia práctica más común entre `interface` y `type`?',
            options: [
              'interface se puede extender fácilmente con extends; type es más flexible para describir uniones, tuplas y otros tipos que no son objetos',
              'type no puede usarse nunca con objetos',
              'interface es más rápido en tiempo de ejecución',
              'No hay ninguna diferencia real entre ambos',
            ],
            correctIndex: 0,
            explanation:
              'Para objetos simples, interface y type son casi intercambiables. La diferencia práctica: interface tiene una sintaxis dedicada para extender (extends) y volver a declarar, mientras que type es más versátil para nombrar tipos que no son objetos (uniones, tuplas, tipos de función).',
            commonMistakes: {
              1: 'type se usa constantemente con objetos — de hecho es igual de común que interface para ese caso.',
              2: 'Ambos desaparecen por completo al compilar — ninguno tiene ningún costo (ni beneficio) en tiempo de ejecución.',
              3: 'Sí hay diferencias reales, aunque sutiles — sobre todo en extensibilidad y en qué tipo de datos pueden describir.',
            },
          },
        ],
        advanced: [
          {
            id: 'tsl2-q1-advanced',
            question:
              'Dado `type A = { x: number }; type B = { y: number }; type C = A & B;`, ¿qué forma tiene que tener un objeto para ser válido como C?',
            options: [
              'Solo necesita x, o solo y',
              '& es un error de sintaxis en TypeScript',
              'No puede tener ninguna de las dos propiedades',
              'Necesita AMBAS propiedades: x e y',
            ],
            correctIndex: 3,
            explanation:
              '& es una intersección de tipos: combina A y B en un tipo que exige TODAS las propiedades de ambos. A diferencia de | (unión, que pide una U OTRA), & pide una Y la otra — el objeto tiene que satisfacer ambas formas a la vez.',
            commonMistakes: {
              0: 'Eso describiría una unión (A | B), no una intersección (A & B) — & es más exigente, no menos.',
              1: '& es sintaxis válida de TypeScript para intersección de tipos — muy usada para combinar formas de datos.',
              2: 'Es exactamente lo opuesto: & exige tener AMBAS propiedades, no ninguna.',
            },
          },
          {
            id: 'tsl2-q2-advanced',
            question:
              'Dada `interface Inventario { [nombreProducto: string]: number; }`, ¿qué permite hacer una index signature como esta?',
            options: [
              'Que el objeto tenga como máximo una propiedad',
              'Que el objeto acepte cualquier clave de tipo string, siempre que el valor sea number',
              'Que las propiedades del objeto sean inmutables',
              'Que TypeScript ignore por completo ese objeto al chequear tipos',
            ],
            correctIndex: 1,
            explanation:
              'Una index signature describe objetos cuyas claves no se conocen de antemano (como un diccionario): cualquier nombre de propiedad de tipo string es válido, mientras el valor asociado sea del tipo indicado (number, en este caso). Es la forma correcta de tipar objetos usados como mapas/diccionarios dinámicos.',
            commonMistakes: {
              0: 'No hay ningún límite en la cantidad de propiedades — de hecho, el objetivo es permitir cualquier cantidad de claves dinámicas.',
              2: 'La index signature no implica readonly — las propiedades siguen siendo mutables salvo que se agregue readonly explícitamente.',
              3: 'Todo lo contrario: TypeScript sigue validando que los VALORES sean del tipo correcto (number), solo que las claves quedan abiertas.',
            },
          },
        ],
      },
    },
  ],
};
