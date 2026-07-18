import type { LessonContent } from '../../../types/domain';

export const lesson7: LessonContent = {
  id: 'lesson-7',
  title: 'Arrays y Objetos: Fundamentos',
  subtitle: 'Las dos estructuras de datos que vas a usar todo el tiempo',
  level: 'base',
  track: 'javascript',
  prerequisites: ['lesson-1'],
  blocks: [
    {
      id: 'lesson-7-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Arrays: listas ordenadas

\`\`\`js
const frutas = ['manzana', 'banana', 'pera'];

console.log(frutas[0]);      // 'manzana' — el primer elemento (índice 0)
console.log(frutas.length);  // 3 — cuántos elementos tiene
\`\`\`

### Agregar y quitar elementos

\`\`\`js
frutas.push('kiwi');     // agrega al final
frutas.pop();             // quita el último
frutas.unshift('uva');   // agrega al principio
frutas.shift();            // quita el primero
\`\`\`

## Objetos: datos con nombre

\`\`\`js
const persona = {
  nombre: 'Ana',
  edad: 28,
};

console.log(persona.nombre);   // 'Ana'
console.log(persona['edad']);  // 28 — también funciona con corchetes
\`\`\`

### Agregar y cambiar propiedades

\`\`\`js
persona.ciudad = 'Córdoba'; // agrega una propiedad nueva
persona.edad = 29;           // cambia una existente
\`\`\``,

        base: `## Arrays en profundidad

\`\`\`js
const numeros = [10, 20, 30, 40];

numeros[0];          // 10 — acceso por índice (empieza en 0)
numeros.length;      // 4
numeros[numeros.length - 1]; // 40 — el último elemento
\`\`\`

### Métodos útiles para buscar

\`\`\`js
numeros.includes(20);   // true — ¿el array contiene este valor?
numeros.indexOf(30);    // 2 — en qué índice está (o -1 si no está)
numeros.slice(1, 3);    // [20, 30] — copia parcial, sin modificar el original
\`\`\`

## Objetos en profundidad

\`\`\`js
const producto = { nombre: 'Mouse', precio: 25, stock: true };

Object.keys(producto);    // ['nombre', 'precio', 'stock']
Object.values(producto);  // ['Mouse', 25, true]
Object.entries(producto); // [['nombre','Mouse'], ['precio',25], ['stock',true]]
\`\`\`

### Notación con punto vs corchetes

\`\`\`js
producto.nombre;          // acceso normal
producto['nombre'];       // igual, útil cuando la clave es dinámica

const clave = 'precio';
producto[clave];          // 25 — con punto esto no sería posible
\`\`\`

### Arrays de objetos (el patrón más común en la práctica)

\`\`\`js
const usuarios = [
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'Luis' },
];

const encontrado = usuarios.find(u => u.id === 2);
console.log(encontrado.nombre); // 'Luis'
\`\`\``,

        advanced: `## Mutabilidad, referencias y estructuras anidadas

### Arrays y objetos se pasan por referencia

\`\`\`js
const original = { valor: 1 };
const copia = original;   // NO es una copia — es la MISMA referencia
copia.valor = 2;
console.log(original.valor); // 2 — se modificó el original también!
\`\`\`

Para copiar de verdad (shallow copy):

\`\`\`js
const copiaReal = { ...original };       // spread — copia un nivel
const copiaArray = [...numeros];          // igual para arrays
const copiaConObjectAssign = Object.assign({}, original);
\`\`\`

**Importante**: estas copias son "superficiales" (shallow) — si el objeto
tiene propiedades que son a su vez objetos/arrays, esos anidados SIGUEN siendo
la misma referencia:

\`\`\`js
const usuario = { nombre: 'Ana', direccion: { ciudad: 'CBA' } };
const copia = { ...usuario };
copia.direccion.ciudad = 'BA';
console.log(usuario.direccion.ciudad); // 'BA' — también cambió el original!
\`\`\`

### Mutación vs inmutabilidad

Métodos que MUTAN el array original: \`push\`, \`pop\`, \`shift\`, \`unshift\`,
\`splice\`, \`sort\`, \`reverse\`.

Métodos que NO mutan (devuelven uno nuevo): \`map\`, \`filter\`, \`slice\`,
\`concat\`, el operador spread.

\`\`\`js
const arr = [3, 1, 2];
const ordenado = [...arr].sort(); // copiar ANTES de ordenar
console.log(arr);        // [3, 1, 2] — el original queda intacto
console.log(ordenado);   // [1, 2, 3]
\`\`\`

Este detalle es la fuente de bugs más común al trabajar con estado en
aplicaciones reales (React, Redux, etc. dependen de que sepas cuándo estás
mutando y cuándo no).`,
      },
    },

    {
      id: 'lesson-7-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-7-simplified',
          title: 'Agregar un elemento',
          description: 'Usa push para agregar "kiwi" al final del array, y muestra el nuevo largo.',
          code: `const frutas = ['manzana', 'banana', 'pera'];

// Agrega 'kiwi' al final con push

console.log(frutas.length);
console.log(frutas[3]);`,
          expectedOutput: '4\nkiwi',
          hints: [
            "frutas.push('kiwi');",
            'push agrega el elemento al final y modifica el array original',
          ],
          solution: `const frutas = ['manzana', 'banana', 'pera'];
frutas.push('kiwi');
console.log(frutas.length);
console.log(frutas[3]);`,
        },
        base: {
          id: 'code-7-base',
          title: 'Modificar un objeto',
          description: 'Agrega una propiedad stock y actualiza el precio del producto.',
          code: `const producto = {
  nombre: 'Teclado',
  precio: 50,
};

// 1. Agrega una propiedad 'stock' con valor 10
// 2. Cambia 'precio' a 45

console.log(producto.nombre);
console.log(producto.precio);
console.log(producto.stock);
console.log(Object.keys(producto).length);`,
          expectedOutput: 'Teclado\n45\n10\n3',
          hints: [
            'producto.stock = 10;',
            'producto.precio = 45;',
          ],
          solution: `const producto = {
  nombre: 'Teclado',
  precio: 50,
};

producto.stock = 10;
producto.precio = 45;

console.log(producto.nombre);
console.log(producto.precio);
console.log(producto.stock);
console.log(Object.keys(producto).length);`,
        },
        advanced: {
          id: 'code-7-advanced',
          title: 'Actualizar un objeto dentro de un array',
          description:
            'Implementa actualizarUsuario: busca un usuario por id y le aplica los cambios (Object.assign o spread).',
          code: `const usuarios = [
  { id: 1, nombre: 'Ana', activo: true },
  { id: 2, nombre: 'Luis', activo: false },
  { id: 3, nombre: 'Carla', activo: true },
];

function actualizarUsuario(usuarios, id, cambios) {
  // 1. Encuentra el usuario con ese id (usuarios.find)
  // 2. Aplicale los cambios (Object.assign(usuario, cambios))
  // 3. Devuelve el usuario actualizado (o null si no se encontró)
}

actualizarUsuario(usuarios, 2, { activo: true, nombre: 'Luis Gómez' });
console.log(usuarios[1].nombre);
console.log(usuarios[1].activo);
console.log(usuarios.filter(u => u.activo).length);`,
          expectedOutput: 'Luis Gómez\ntrue\n3',
          hints: [
            'const usuario = usuarios.find(u => u.id === id);',
            'if (!usuario) return null; Object.assign(usuario, cambios); return usuario;',
          ],
          solution: `const usuarios = [
  { id: 1, nombre: 'Ana', activo: true },
  { id: 2, nombre: 'Luis', activo: false },
  { id: 3, nombre: 'Carla', activo: true },
];

function actualizarUsuario(usuarios, id, cambios) {
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return null;
  Object.assign(usuario, cambios);
  return usuario;
}

actualizarUsuario(usuarios, 2, { activo: true, nombre: 'Luis Gómez' });
console.log(usuarios[1].nombre);
console.log(usuarios[1].activo);
console.log(usuarios.filter(u => u.activo).length);`,
        },
      },
    },

    {
      id: 'lesson-7-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'l7-q1-simple',
            question: '¿Cuál es el índice del primer elemento de un array?',
            options: [
              '1',
              '-1',
              '0',
              'Depende del array',
            ],
            correctIndex: 2,
            explanation: 'Los arrays en JavaScript (como en la mayoría de los lenguajes) empiezan a contar desde el índice 0.',
            commonMistakes: {
              0: 'El índice 1 apunta al SEGUNDO elemento, no al primero.',
              1: '-1 no es un índice válido para acceso directo (aunque algunos métodos lo usan para indicar "no encontrado").',
              3: 'Siempre es 0, sin importar el contenido o tamaño del array.',
            },
          },
          {
            id: 'l7-q2-simple',
            question: 'Dado `const persona = { nombre: "Ana" }`, ¿cómo accedes al nombre?',
            options: [
              'persona[0]',
              'persona->nombre',
              'persona.nombre',
              'persona::nombre',
            ],
            correctIndex: 2,
            explanation: 'Se accede a las propiedades de un objeto con notación de punto (persona.nombre) o con corchetes (persona["nombre"]).',
            commonMistakes: {
              0: 'Los objetos (a diferencia de los arrays) no se acceden por índice numérico — se accede por el nombre de la propiedad.',
              1: '-> es la sintaxis de otros lenguajes como PHP o C++, no de JavaScript.',
              3: ':: tampoco es sintaxis de JavaScript para acceso a propiedades.',
            },
          },
        ],
        base: [
          {
            id: 'l7-q1-base',
            question: '¿Qué devuelve `[10, 20, 30].includes(20)`?',
            options: ['0', '1', 'true', 'undefined'],
            correctIndex: 2,
            explanation: 'includes() devuelve un booleano: true si el valor está en el array, false si no.',
            commonMistakes: {
              0: 'includes() no devuelve el índice — eso lo hace indexOf(). includes() devuelve un booleano.',
              1: 'No hay ningún "1" involucrado aquí — la respuesta es un booleano, no un índice ni un conteo.',
              3: 'includes() siempre devuelve true o false, nunca undefined.',
            },
          },
          {
            id: 'l7-q2-base',
            question:
              '¿Qué imprime este código?\n\n```js\nconst original = { valor: 1 };\nconst copia = original;\ncopia.valor = 2;\nconsole.log(original.valor);\n```',
            options: ['1', '2', 'undefined', 'Error'],
            correctIndex: 1,
            explanation:
              'copia = original no crea una copia — ambas variables apuntan al MISMO objeto en memoria. Modificar copia.valor también modifica original.valor porque son la misma referencia.',
            commonMistakes: {
              0: 'original no queda "protegido" — copia y original son la misma referencia, así que el cambio se ve en ambas variables.',
              2: 'La propiedad valor sigue existiendo, solo que con el valor actualizado (2), no undefined.',
              3: 'Este código es completamente válido — no lanza ningún error, simplemente el comportamiento de "no copia" sorprende a quien no lo conoce.',
            },
          },
        ],
        advanced: [
          {
            id: 'l7-q1-advanced',
            question:
              '¿Qué imprime `usuario.direccion.ciudad` después de este código?\n\n```js\nconst usuario = { nombre: "Ana", direccion: { ciudad: "CBA" } };\nconst copia = { ...usuario };\ncopia.direccion.ciudad = "BA";\n```',
            options: [
              '"CBA"',
              'undefined',
              '"BA"',
              'Error de tipo',
            ],
            correctIndex: 2,
            explanation:
              'El spread ({...usuario}) hace una copia SUPERFICIAL (shallow): copia las propiedades de primer nivel, pero direccion sigue siendo la MISMA referencia al objeto anidado en ambos. Modificar copia.direccion.ciudad también afecta a usuario.direccion.ciudad.',
            commonMistakes: {
              0: 'Si direccion no cambiara, "CBA" seguiría — pero como es una copia superficial, el objeto anidado se comparte y sí cambia.',
              1: 'La propiedad sigue existiendo con un valor válido ("BA"), no queda undefined.',
              3: 'No hay ningún error de tipo aquí — el código es válido, el resultado solo es contraintuitivo si no conoces la diferencia entre copia superficial y profunda.',
            },
          },
          {
            id: 'l7-q2-advanced',
            question: '¿Cuál de estos métodos de array NO muta el array original?',
            options: [
              'push',
              'sort',
              'slice',
              'splice',
            ],
            correctIndex: 2,
            explanation:
              'slice() devuelve una copia parcial nueva sin tocar el original. push, sort y splice sí modifican (mutan) el array sobre el que se llaman.',
            commonMistakes: {
              0: 'push SÍ muta — agrega el elemento directamente al array original.',
              1: 'sort SÍ muta — reordena los elementos del array original in-place.',
              3: 'splice SÍ muta — inserta/elimina elementos directamente en el array original.',
            },
          },
        ],
      },
    },
  ],
};
