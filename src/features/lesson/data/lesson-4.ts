import type { LessonContent } from '../../../types/domain';

export const lesson4: LessonContent = {
  id: 'lesson-4',
  title: 'Métodos de Arrays: map, filter y reduce',
  subtitle: 'Transformar y combinar colecciones de datos sin loops manuales',
  level: 'intermediate',
  track: 'javascript',
  prerequisites: ['lesson-2'],
  blocks: [
    {
      id: 'lesson-4-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Trabajar con listas sin loops

Cuando tienes un array y quieres transformarlo, casi nunca hace falta escribir un \`for\`. JavaScript trae funciones que ya hacen el trabajo repetitivo por ti.

### map: transformar cada elemento

\`\`\`js
const precios = [10, 20, 30];

// Con for (la forma larga)
const conIva = [];
for (let i = 0; i < precios.length; i++) {
  conIva.push(precios[i] * 1.21);
}

// Con map (la forma corta)
const conIva2 = precios.map(precio => precio * 1.21);
\`\`\`

\`map\` crea un array **nuevo**, del mismo tamaño, con cada elemento transformado.

### filter: quedarte solo con algunos

\`\`\`js
const edades = [12, 18, 25, 15, 30];

const mayoresDeEdad = edades.filter(edad => edad >= 18);
// [18, 25, 30]
\`\`\`

\`filter\` crea un array nuevo, más chico o igual, solo con los elementos donde la función devuelve \`true\`.

### reduce: combinar todo en un solo valor

\`\`\`js
const numeros = [1, 2, 3, 4];

const suma = numeros.reduce((acumulado, actual) => acumulado + actual, 0);
// 10
\`\`\`

\`reduce\` va "acumulando" un resultado a medida que recorre el array, hasta quedarte con un solo valor final.`,

        base: `## Métodos de Arrays de orden superior

Se llaman así porque reciben una **función como argumento**. En vez de decirle a JavaScript *cómo* recorrer el array (con un \`for\` y un índice), le dices *qué* quieres hacer con cada elemento.

### map — transformar

\`\`\`js
const usuarios = [
  { nombre: 'Ana', edad: 28 },
  { nombre: 'Luis', edad: 34 },
];

const nombres = usuarios.map(u => u.nombre);
// ['Ana', 'Luis']

const conCategoria = usuarios.map(u => ({
  ...u,
  categoria: u.edad >= 30 ? 'senior' : 'junior',
}));
\`\`\`

\`map\` siempre devuelve un array del **mismo largo** que el original. Si el callback no devuelve nada explícitamente, cada elemento se convierte en \`undefined\`.

### filter — seleccionar

\`\`\`js
const productos = [
  { nombre: 'Mouse', stock: 0 },
  { nombre: 'Teclado', stock: 5 },
  { nombre: 'Monitor', stock: 0 },
];

const disponibles = productos.filter(p => p.stock > 0);
// [{ nombre: 'Teclado', stock: 5 }]
\`\`\`

El callback de \`filter\` debe devolver un booleano (o algo "truthy"/"falsy"). Los elementos donde da \`true\` se conservan.

### reduce — acumular

\`reduce\` recibe una función \`(acumulador, actual, índice, array) => nuevoAcumulador\` y un **valor inicial**:

\`\`\`js
const carrito = [
  { nombre: 'Libro', precio: 15 },
  { nombre: 'Lapicera', precio: 2 },
];

const total = carrito.reduce((acc, item) => acc + item.precio, 0);
// 17

// reduce también sirve para construir objetos, no solo números
const porNombre = carrito.reduce((acc, item) => {
  acc[item.nombre] = item.precio;
  return acc;
}, {});
// { Libro: 15, Lapicera: 2 }
\`\`\`

### Encadenar métodos

Como cada método devuelve un array nuevo, se pueden encadenar:

\`\`\`js
const total = carrito
  .filter(item => item.precio > 5)   // solo los caros
  .map(item => item.precio * 1.21)   // con impuesto
  .reduce((acc, precio) => acc + precio, 0); // sumados
\`\`\`

Cada método hace **una sola cosa**, y la cadena se lee de arriba a abajo como una receta.`,

        advanced: `## map/filter/reduce: inmutabilidad, complejidad y trade-offs

### Por qué preferirlos sobre loops imperativos

\`map\`, \`filter\` y \`reduce\` son **puros** cuando el callback lo es: no mutan el array original, no dependen de estado externo mutable, y expresan *intención* en vez de *mecanismo*. Esto los hace más fáciles de testear, paralelizar conceptualmente, y componer.

\`\`\`js
// Composición: cada función es reusable y testeable por separado
const esActivo = user => user.activo;
const aNombre = user => user.nombre;
const nombresActivos = usuarios.filter(esActivo).map(aNombre);
\`\`\`

### Costo real: cada método recorre el array completo

Encadenar \`.filter().map().reduce()\` sobre un array de N elementos hace **3 pasadas** (3N operaciones), no una. Para la mayoría de los casos esto es irrelevante, pero en arrays muy grandes o hot paths, un solo \`reduce\` que filtra, transforma y acumula en una pasada es más eficiente:

\`\`\`js
// 3 pasadas
const resultado1 = datos.filter(d => d.activo).map(d => d.valor).reduce((a, b) => a + b, 0);

// 1 pasada — mismo resultado, menos overhead
const resultado2 = datos.reduce((acc, d) => d.activo ? acc + d.valor : acc, 0);
\`\`\`

### reduce como primitiva universal

Técnicamente, \`map\` y \`filter\` se pueden implementar con \`reduce\`:

\`\`\`js
const myMap = (arr, fn) =>
  arr.reduce((acc, item, i) => (acc.push(fn(item, i)), acc), []);

const myFilter = (arr, predicate) =>
  arr.reduce((acc, item, i) => (predicate(item, i) ? acc.push(item) : null, acc), []);
\`\`\`

Esto no significa que debas usar \`reduce\` para todo — \`map\`/\`filter\` son más legibles para sus casos específicos — pero entender que \`reduce\` es la primitiva más general ayuda a saber cuándo el problema no encaja en \`map\`/\`filter\` (ej: agrupar, construir un objeto, encontrar múltiples valores a la vez).

### Trampa común: reduce sin valor inicial

\`\`\`js
// Sin valor inicial, el primer elemento se usa como acumulador inicial
[].reduce((acc, x) => acc + x); // TypeError: Reduce of empty array with no initial value

// Siempre pasa un valor inicial explícito si el array puede estar vacío
[].reduce((acc, x) => acc + x, 0); // 0 — seguro
\`\`\``,
      },
    },

    {
      id: 'lesson-4-code',
      type: 'code',
      estimatedMinutes: 7,
      variants: {
        simplified: {
          id: 'code-4-simplified',
          title: 'Duplicar precios',
          description: 'Usa map para crear un array con cada precio multiplicado por 2.',
          code: `const precios = [10, 25, 40];

// Usa map para duplicar cada precio
const duplicados = precios; // reemplaza esta línea

console.log(duplicados);`,
          expectedOutput: '[20, 50, 80]',
          hints: [
            'const duplicados = precios.map(precio => precio * 2);',
            'map siempre devuelve un array nuevo del mismo tamaño',
          ],
          solution: `const precios = [10, 25, 40];
const duplicados = precios.map(precio => precio * 2);
console.log(duplicados);`,
        },
        base: {
          id: 'code-4-base',
          title: 'Total del carrito con descuento',
          description:
            'Filtra los productos en stock, aplica un 10% de descuento a los que cuestan más de $50, y suma el total.',
          code: `const productos = [
  { nombre: 'Mouse', precio: 30, stock: true },
  { nombre: 'Monitor', precio: 200, stock: false },
  { nombre: 'Teclado', precio: 60, stock: true },
  { nombre: 'Silla', precio: 150, stock: true },
];

// 1. Filtra solo los productos con stock
// 2. A los que cuestan más de $50, aplicales 10% de descuento
// 3. Suma el total con reduce

const total = 0; // reemplaza esta línea

console.log(total);`,
          expectedOutput: '219',
          hints: [
            'Encadena: productos.filter(...).map(...).reduce(...)',
            'Descuento: p.precio > 50 ? p.precio * 0.9 : p.precio',
          ],
          solution: `const productos = [
  { nombre: 'Mouse', precio: 30, stock: true },
  { nombre: 'Monitor', precio: 200, stock: false },
  { nombre: 'Teclado', precio: 60, stock: true },
  { nombre: 'Silla', precio: 150, stock: true },
];

const total = productos
  .filter(p => p.stock)
  .map(p => p.precio > 50 ? p.precio * 0.9 : p.precio)
  .reduce((acc, precio) => acc + precio, 0);

console.log(total);`,
        },
        advanced: {
          id: 'code-4-advanced',
          title: 'Agrupar con reduce (groupBy)',
          description:
            'Implementa una función groupBy genérica que agrupe elementos de un array según el resultado de una función clave.',
          code: `function groupBy(arr, keyFn) {
  // Debe devolver un objeto donde cada clave es el resultado de keyFn(item)
  // y el valor es un array con todos los items que comparten esa clave.
  
  // Tu implementación aquí (usa reduce)
}

const personas = [
  { nombre: 'Ana', pais: 'AR' },
  { nombre: 'Luis', pais: 'MX' },
  { nombre: 'Carla', pais: 'AR' },
  { nombre: 'Pedro', pais: 'MX' },
  { nombre: 'Sofía', pais: 'CL' },
];

const porPais = groupBy(personas, p => p.pais);
console.log(porPais.AR.length); // 2
console.log(porPais.MX.length); // 2
console.log(porPais.CL.length); // 1`,
          expectedOutput: '2\n2\n1',
          hints: [
            'reduce con valor inicial {} (un objeto vacío)',
            'En cada paso: const clave = keyFn(item); si acc[clave] no existe, créalo como []; después haz push',
          ],
          solution: `function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const clave = keyFn(item);
    if (!acc[clave]) {
      acc[clave] = [];
    }
    acc[clave].push(item);
    return acc;
  }, {});
}

const personas = [
  { nombre: 'Ana', pais: 'AR' },
  { nombre: 'Luis', pais: 'MX' },
  { nombre: 'Carla', pais: 'AR' },
  { nombre: 'Pedro', pais: 'MX' },
  { nombre: 'Sofía', pais: 'CL' },
];

const porPais = groupBy(personas, p => p.pais);
console.log(porPais.AR.length);
console.log(porPais.MX.length);
console.log(porPais.CL.length);`,
        },
      },
    },

    {
      id: 'lesson-4-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'l4-q1-simple',
            question: '¿Qué devuelve `[1, 2, 3].map(x => x * 2)`?',
            options: ['[1, 2, 3]', '[2, 4, 6]', '6', 'undefined'],
            correctIndex: 1,
            explanation:
              'map aplica la función a cada elemento y devuelve un array nuevo con los resultados: [2, 4, 6].',
            commonMistakes: {
              0: 'Ese es el array original sin transformar — map no modifica el array, crea uno nuevo.',
              2: 'map no suma los valores, eso sería trabajo de reduce. Cada elemento se transforma individualmente.',
              3: 'map siempre devuelve un array, nunca undefined, salvo que lo llames sobre algo que no sea un array.',
            },
          },
          {
            id: 'l4-q2-simple',
            question: '¿Qué hace `filter` con los elementos donde la función devuelve `false`?',
            options: [
              'Los transforma en null',
              'Los deja al final del array',
              'Los elimina del array resultante',
              'Lanza un error',
            ],
            correctIndex: 2,
            explanation:
              'filter construye un array nuevo que solo incluye los elementos para los que la función devolvió true (o algo truthy). Los que dan false simplemente no aparecen en el resultado.',
            commonMistakes: {
              0: 'filter no transforma los valores, los incluye o los excluye tal cual están.',
              1: 'filter no reordena nada — mantiene el orden original de los elementos que sí pasan el filtro.',
              3: 'filter nunca lanza error por elementos que no pasan el filtro, simplemente los omite.',
            },
          },
          {
            id: 'l4-q3-simple',
            question: '¿Para qué sirve `reduce`?',
            options: [
              'Para achicar el tamaño de un array eliminando duplicados',
              'Para ordenar un array de menor a mayor',
              'Para combinar todos los elementos de un array en un solo valor',
              'Para revertir el orden de un array',
            ],
            correctIndex: 2,
            explanation:
              'reduce recorre el array acumulando un resultado paso a paso, hasta devolver un único valor final (puede ser un número, un objeto, un string, lo que sea).',
            commonMistakes: {
              0: 'Eliminar duplicados se puede hacer con Set o reduce, pero no es lo que reduce hace por definición.',
              1: 'Ordenar es trabajo de sort(), no de reduce.',
              3: 'Revertir el orden es trabajo de reverse(), no de reduce.',
            },
          },
        ],
        base: [
          {
            id: 'l4-q1-base',
            question:
              '¿Qué imprime este código?\n\n```js\nconst nums = [1, 2, 3, 4, 5];\nconst resultado = nums.filter(n => n % 2 === 0).map(n => n * 10);\nconsole.log(resultado);\n```',
            options: [
              '[20, 40]',
              '[10, 20, 30, 40, 50]',
              '[2, 4]',
              '60',
            ],
            correctIndex: 0,
            explanation:
              'Primero filter se queda con los pares: [2, 4]. Después map multiplica cada uno por 10: [20, 40]. El orden de la cadena importa: primero se filtra, después se transforma lo que quedó.',
            commonMistakes: {
              1: 'Eso pasaría si filter no hiciera nada — pero filter sí descarta los impares antes del map.',
              2: 'Ese es el resultado del filter solo, sin aplicar el map que multiplica por 10.',
              3: 'Ese sería el resultado de sumar con reduce, pero aquí no se usa reduce, se usa map, que devuelve un array.',
            },
          },
          {
            id: 'l4-q2-base',
            question:
              '¿Cuál es el valor inicial correcto para sumar precios con reduce, si el array puede estar vacío?',
            options: [
              'No hace falta pasar valor inicial nunca',
              '`carrito.reduce((acc, item) => acc + item.precio)` sin segundo argumento',
              '`carrito.reduce((acc, item) => acc + item.precio, 0)` con 0 como valor inicial',
              '`carrito.reduce((acc, item) => acc + item.precio, null)`',
            ],
            correctIndex: 2,
            explanation:
              'Pasar 0 como valor inicial explícito evita el error "Reduce of empty array with no initial value" cuando el array está vacío, y además evita bugs sutiles cuando el primer elemento no es un número puro.',
            commonMistakes: {
              0: 'Sin valor inicial, reduce sobre un array vacío lanza TypeError. Siempre conviene pasarlo si el array puede estar vacío.',
              1: 'Sin el segundo argumento, si el array está vacío esto lanza un error en tiempo de ejecución.',
              3: 'null + item.precio da NaN al sumar, no es un valor inicial seguro para una suma numérica.',
            },
          },
          {
            id: 'l4-q3-base',
            question:
              '¿Por qué encadenar `.filter().map()` es preferible a modificar el array original con un `for` que usa `splice`?',
            options: [
              'Es exactamente igual de rápido y seguro en todos los casos',
              'filter/map son más rápidos en absolutamente todos los casos',
              'splice no existe en JavaScript moderno',
              'filter/map no mutan el array original, evitando bugs por referencias compartidas',
            ],
            correctIndex: 3,
            explanation:
              'filter y map siempre devuelven arrays nuevos, dejando el original intacto. Esto evita bugs difíciles de rastrear cuando otra parte del código todavía tiene una referencia al array "original" y no espera que cambie.',
            commonMistakes: {
              0: 'No es igual de seguro: mutar con splice puede romper código que retiene una referencia al array original.',
              1: 'En arrays muy grandes, un solo reduce puede ser más rápido que encadenar varios métodos (varias pasadas).',
              2: 'splice existe y es válido — el problema no es que no exista, sino que muta el array original.',
            },
          },
        ],
        advanced: [
          {
            id: 'l4-q1-advanced',
            question:
              '¿Cuántas veces se recorre el array `datos` (de N elementos) en este código?\n\n```js\nconst resultado = datos\n  .filter(d => d.activo)\n  .map(d => d.valor)\n  .reduce((a, b) => a + b, 0);\n```',
            options: [
              'Una sola vez, porque están encadenados',
              'N veces, una por cada elemento',
              'Tres veces — una por cada método en la cadena',
              'Depende del motor de JavaScript, no es determinístico',
            ],
            correctIndex: 2,
            explanation:
              'Cada método (filter, map, reduce) recorre completamente el array que recibe y produce un array (o valor) nuevo. Encadenarlos no los fusiona en una sola pasada: son 3 recorridos independientes, O(3N) en total. Para la mayoría de los casos esto no importa, pero en hot paths con arrays grandes, un único reduce que hace las tres cosas es más eficiente.',
            commonMistakes: {
              0: 'El encadenamiento es solo azúcar sintáctica para llamar un método sobre el resultado del anterior — cada uno sigue siendo su propio recorrido completo.',
              1: 'N es el tamaño del array, no la cantidad de recorridos — son 3 recorridos de N elementos cada uno.',
              3: 'El comportamiento es determinístico y está definido por la especificación de ECMAScript, no varía entre motores.',
            },
          },
          {
            id: 'l4-q2-advanced',
            question:
              '¿Qué problema tiene esta implementación de `myMap` usando reduce?\n\n```js\nconst myMap = (arr, fn) =>\n  arr.reduce((acc, item) => {\n    acc.push(fn(item));\n    return acc;\n  }, []);\n```',
            options: [
              'push() muta el acumulador en cada paso, lo cual contradice el espíritu de programación pura de reduce, aunque el resultado final sea correcto',
              'No tiene ningún problema, es una implementación correcta y razonable',
              'reduce no puede usarse para implementar map, son incompatibles',
              'El valor inicial [] debería ser null en su lugar',
            ],
            correctIndex: 0,
            explanation:
              'El resultado es correcto, pero mutar el acumulador (con push) en cada iteración es un estilo impuro: si alguien reutilizara el mismo array como valor inicial en múltiples llamadas, o pasara el acumulador por referencia a otro lado, podría haber efectos secundarios inesperados. Una versión más pura usaría [...acc, fn(item)] (aunque es O(n²) por las copias) o aceptar la mutación local como un trade-off consciente de performance, ya que el array acc es interno y no se comparte.',
            commonMistakes: {
              1: 'Funciona y es un patrón común en la práctica, pero técnicamente muta el acumulador, lo cual vale la pena reconocer como trade-off, no ignorar.',
              2: 'reduce sí puede implementar map (y filter) — es la operación más general de las tres.',
              3: 'null rompería el código porque null no tiene el método push(). [] es el valor inicial correcto para acumular un array.',
            },
          },
          {
            id: 'l4-q3-advanced',
            question:
              '¿Qué devuelve `[1, [2, 3], [4, [5, 6]]].reduce((acc, x) => acc.concat(x), [])`?',
            options: [
              '[1, 2, 3, 4, 5, 6] — completamente aplanado',
              '[1, 2, 3, 4, [5, 6]] — aplanado un solo nivel',
              '[1, [2, 3], [4, [5, 6]]] — sin cambios',
              'Error — concat no funciona con reduce',
            ],
            correctIndex: 1,
            explanation:
              'concat() aplana un solo nivel de anidamiento. En cada paso, acc.concat(x) fusiona x en acc sin recursar: 1 se agrega tal cual, [2,3] se aplana un nivel dando 2 y 3 sueltos, y [4, [5,6]] se aplana un nivel dando 4 y [5,6] (este último se mantiene anidado porque concat no es recursivo). Para un aplanado completo se necesitaría recursión o Array.prototype.flat(Infinity).',
            commonMistakes: {
              0: 'Ese sería el resultado de un aplanado recursivo completo (como flat(Infinity)), pero concat solo aplana un nivel por llamada.',
              2: 'concat sí modifica la estructura — no es un no-op, fusiona un nivel de los arrays anidados.',
              3: 'concat es un método de array completamente válido para usar dentro de un reduce, no lanza ningún error aquí.',
            },
          },
        ],
      },
    },
  ],
};
