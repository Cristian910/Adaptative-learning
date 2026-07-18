import type { LessonContent } from '../../../types/domain';

export const tsLesson5: LessonContent = {
  id: 'ts-lesson-5',
  title: 'Utility Types y buenas prácticas',
  subtitle: 'Transformar tipos existentes en vez de reescribirlos, y cómo escribir TypeScript idiomático',
  level: 'advanced',
  track: 'typescript',
  prerequisites: ['ts-lesson-4'],
  blocks: [
    {
      id: 'ts-lesson-5-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Partial: hacer todas las propiedades opcionales

\`Partial<T>\` toma un tipo existente y devuelve una versión donde todas sus propiedades son opcionales — útil para "actualizaciones parciales":

\`\`\`ts
interface Config {
  tema: string;
  idioma: string;
}

function actualizar(actual: Config, cambios: Partial<Config>): Config {
  return { ...actual, ...cambios };
}

actualizar({ tema: 'oscuro', idioma: 'es' }, { idioma: 'en' });
// { tema: 'oscuro', idioma: 'en' } — no hizo falta pasar TODAS las propiedades en 'cambios'
\`\`\`

Sin \`Partial\`, \`cambios\` tendría que incluir obligatoriamente tema E idioma — con \`Partial<Config>\`, cualquier subconjunto (incluso vacío) es válido.`,

        base: `## Pick y Omit: quedarte con algunas propiedades, o sacar algunas

\`Pick<T, claves>\` arma un nuevo tipo con SOLO las propiedades que elijas de T. \`Omit<T, claves>\` hace lo contrario: todas las propiedades de T MENOS las que indiques.

\`\`\`ts
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcionInterna: string;
}

type ProductoPublico = Omit<Producto, 'descripcionInterna'>;
// { id: number; nombre: string; precio: number } — todo menos descripcionInterna

type ResumenProducto = Pick<Producto, 'nombre' | 'precio'>;
// { nombre: string; precio: number } — solo esas dos
\`\`\`

Son muy comunes al exponer datos hacia afuera (una API pública) a partir de un tipo interno más completo, sin tener que declarar un tipo nuevo desde cero y duplicar las propiedades compartidas.

**Importante**: estos utility types solo cambian la FORMA a nivel de tipos. Si de verdad quieres que una propiedad no exista en el objeto en runtime, hay que sacarla tú mismo (por ejemplo, con destructuring: \`const { descripcionInterna, ...resto } = producto\`).`,

        advanced: `## Record, Readonly y por qué evitar any en código idiomático

\`Record<K, V>\` describe un objeto donde todas las claves son de tipo K y todos los valores son de tipo V — perfecto para diccionarios:

\`\`\`ts
type Inventario = Record<string, number>;

const stock: Inventario = {
  manzanas: 10,
  peras: 5,
};
\`\`\`

Es equivalente a escribir una index signature (\`{ [key: string]: number }\`), pero más legible para este caso común.

### Readonly<T>: inmutabilidad a nivel de tipos

\`\`\`ts
function totalUnidades(inventario: Readonly<Inventario>): number {
  inventario.manzanas = 99; // ❌ Error: no se puede asignar a manzanas porque es de solo lectura
  return Object.values(inventario).reduce((acc, n) => acc + n, 0);
}
\`\`\`

\`Readonly<T>\` aplica \`readonly\` a TODAS las propiedades de T de una — evita tener que escribir \`readonly\` en cada una manualmente, y deja explícito en la firma de la función "esto no debería modificar lo que le pasaste".

### Por qué evitar any en código idiomático

Cada vez que aparece \`any\` en una base de código TypeScript, ese sector del programa pierde toda la verificación de tipos — es, en la práctica, un "agujero" donde TypeScript deja de ayudar. Las alternativas más idiomáticas, de más a menos estricta:

1. **Tipo específico** (\`string\`, \`Producto\`, etc.) — siempre que se pueda saber de antemano.
2. **Generics** (\`<T>\`) — cuando el tipo depende de lo que se le pasa a la función.
3. **unknown** — cuando el tipo realmente no se conoce (datos externos), pero se necesita seguir siendo type-safe.
4. **any** — último recurso, idealmente con un comentario explicando por qué no había otra opción.

Un proyecto en modo \`strict\` (la configuración recomendada de \`tsconfig.json\`) obliga a ser explícito en la mayoría de estos casos, en vez de dejar que TypeScript infiera silenciosamente \`any\` cuando no puede determinar un tipo.`,
      },
    },

    {
      id: 'ts-lesson-5-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-ts5-simplified',
          title: 'Partial para actualizaciones parciales',
          description: 'Completa actualizarConfig usando el spread operator.',
          code: `interface Configuracion {
  tema: string;
  idioma: string;
  notificaciones: boolean;
}

function actualizarConfig(actual: Configuracion, cambios: Partial<Configuracion>): Configuracion {
  // Completa: combinar 'actual' con 'cambios' en un objeto nuevo
  return actual;
}

const config: Configuracion = { tema: 'oscuro', idioma: 'es', notificaciones: true };
const nuevaConfig = actualizarConfig(config, { idioma: 'en' });
console.log(nuevaConfig.tema, nuevaConfig.idioma, nuevaConfig.notificaciones);`,
          expectedOutput: 'oscuro en true',
          hints: [
            'El spread operator permite combinar objetos: { ...a, ...b }',
            'return { ...actual, ...cambios };',
          ],
          solution: `interface Configuracion {
  tema: string;
  idioma: string;
  notificaciones: boolean;
}

function actualizarConfig(actual: Configuracion, cambios: Partial<Configuracion>): Configuracion {
  return { ...actual, ...cambios };
}

const config: Configuracion = { tema: 'oscuro', idioma: 'es', notificaciones: true };
const nuevaConfig = actualizarConfig(config, { idioma: 'en' });
console.log(nuevaConfig.tema, nuevaConfig.idioma, nuevaConfig.notificaciones);`,
        },
        base: {
          id: 'code-ts5-base',
          title: 'Omit + destructuring',
          description: 'Completa aPublico: tiene que sacar descripcionInterna de verdad, no solo a nivel de tipos.',
          code: `interface Producto { id: number; nombre: string; precio: number; descripcionInterna: string; }
type ProductoPublico = Omit<Producto, 'descripcionInterna'>;

function aPublico(p: Producto): ProductoPublico {
  // Completa usando destructuring para sacar descripcionInterna de verdad
  return p;
}

const producto: Producto = { id: 1, nombre: 'Silla', precio: 80, descripcionInterna: 'margen 40%' };
const publico = aPublico(producto);
console.log(publico.nombre, publico.precio);
console.log(Object.keys(publico).length);`,
          expectedOutput: 'Silla 80\n3',
          hints: [
            'Omit solo cambia el TIPO — para sacar la propiedad de verdad en runtime hace falta destructuring',
            'const { descripcionInterna, ...resto } = p; return resto;',
          ],
          solution: `interface Producto { id: number; nombre: string; precio: number; descripcionInterna: string; }
type ProductoPublico = Omit<Producto, 'descripcionInterna'>;

function aPublico(p: Producto): ProductoPublico {
  const { descripcionInterna, ...resto } = p;
  return resto;
}

const producto: Producto = { id: 1, nombre: 'Silla', precio: 80, descripcionInterna: 'margen 40%' };
const publico = aPublico(producto);
console.log(publico.nombre, publico.precio);
console.log(Object.keys(publico).length);`,
        },
        advanced: {
          id: 'code-ts5-advanced',
          title: 'Record y Readonly',
          description: 'Completa totalUnidades y categorias trabajando sobre un Record de solo lectura.',
          code: `type Inventario = Record<string, number>;

function totalUnidades(inventario: Readonly<Inventario>): number {
  // Completa: sumar todos los valores del inventario
  return 0;
}

function categorias(inventario: Readonly<Inventario>): string[] {
  // Completa: devolver las claves, ordenadas alfabéticamente
  return [];
}

const stock: Inventario = { manzanas: 10, peras: 5, bananas: 8 };
console.log(totalUnidades(stock));
console.log(categorias(stock).join(', '));`,
          expectedOutput: '23\nbananas, manzanas, peras',
          hints: [
            'Object.values(inventario) te da un array con los valores',
            'totalUnidades: Object.values(inventario).reduce((acc, n) => acc + n, 0)',
            'categorias: Object.keys(inventario).sort()',
          ],
          solution: `type Inventario = Record<string, number>;

function totalUnidades(inventario: Readonly<Inventario>): number {
  return Object.values(inventario).reduce((acc, n) => acc + n, 0);
}

function categorias(inventario: Readonly<Inventario>): string[] {
  return Object.keys(inventario).sort();
}

const stock: Inventario = { manzanas: 10, peras: 5, bananas: 8 };
console.log(totalUnidades(stock));
console.log(categorias(stock).join(', '));`,
        },
      },
    },

    {
      id: 'ts-lesson-5-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'tsl5-q1-simple',
            question: 'Dado `interface Config { tema: string; idioma: string; }`, ¿qué hace `Partial<Config>`?',
            options: [
              'Crea un tipo donde tema e idioma son obligatorios, igual que en Config',
              'Duplica todas las propiedades',
              'Elimina todas las propiedades del tipo',
              'Crea un tipo donde tema e idioma son opcionales — cualquier subconjunto de ellos es válido',
            ],
            correctIndex: 3,
            explanation:
              'Partial<T> toma un tipo existente y devuelve una versión donde TODAS sus propiedades pasan a ser opcionales. Un objeto vacío {} es válido como Partial<Config>, igual que { tema: "oscuro" } solo, o el objeto completo.',
            commonMistakes: {
              0: 'Es justo lo contrario de lo que hace Partial — las propiedades dejan de ser obligatorias, no se mantienen como en el original.',
              1: 'No hay ninguna duplicación — Partial transforma la "obligatoriedad" de las propiedades existentes, no agrega copias.',
              2: 'Partial no elimina propiedades — las mantiene todas, solo que ahora son opcionales en vez de obligatorias.',
            },
          },
          {
            id: 'tsl5-q2-simple',
            question: '¿Para qué se usa típicamente Partial en una función?',
            options: [
              'Para representar una actualización parcial de un objeto, donde no hace falta pasar todas sus propiedades',
              'Para funciones que no reciben ningún parámetro',
              'Para hacer una función más rápida',
              'Solo se puede usar con arrays',
            ],
            correctIndex: 0,
            explanation:
              'Un caso de uso clásico: una función de "actualizar" que recibe solo los campos que cambian, no el objeto completo — eso es exactamente lo que Partial<T> permite expresar en el tipo del parámetro.',
            commonMistakes: {
              1: 'Partial se usa sobre tipos de objetos con propiedades — no está relacionado con la cantidad de parámetros de una función.',
              2: 'Partial no tiene ningún efecto en el rendimiento — es una transformación a nivel de tipos, sin costo en runtime.',
              3: 'Partial se usa sobre tipos de OBJETOS (con propiedades con nombre), no específicamente sobre arrays.',
            },
          },
        ],
        base: [
          {
            id: 'tsl5-q1-base',
            question: 'Dado `interface Producto { id: number; nombre: string; secreto: string; }`, ¿qué representa `Omit<Producto, "secreto">`?',
            options: [
              'Un tipo con solo la propiedad secreto',
              'El mismo tipo que Producto, sin cambios',
              'Un tipo con todas las propiedades de Producto EXCEPTO secreto',
              'Un error, porque Omit no existe en TypeScript',
            ],
            correctIndex: 2,
            explanation:
              'Omit<T, claves> arma un nuevo tipo con todas las propiedades de T, quitando las que se listen. Omit<Producto, "secreto"> da como resultado { id: number; nombre: string } — todo menos secreto.',
            commonMistakes: {
              0: 'Eso es lo que haría Pick<Producto, "secreto"> (quedarse SOLO con esa propiedad) — Omit hace lo opuesto: sacarla.',
              1: 'Omit sí cambia el tipo resultante — específicamente, remueve la(s) propiedad(es) indicada(s).',
              3: 'Omit es un utility type real e integrado en TypeScript, ampliamente usado.',
            },
          },
          {
            id: 'tsl5-q2-base',
            question:
              'Si usas `Omit<Producto, "secreto">` para el TIPO de una función, pero la función simplemente hace `return producto;` sin destructuring, ¿qué pasa con la propiedad secreto en el objeto que se devuelve en RUNTIME?',
            options: [
              'Se elimina automáticamente porque el tipo dice que no debería estar',
              'Sigue estando presente en el objeto real — Omit solo cambia el tipo, no borra propiedades en tiempo de ejecución',
              'La función no compila',
              'Se convierte en undefined automáticamente',
            ],
            correctIndex: 1,
            explanation:
              'Los utility types como Omit son puramente construcciones de TypeScript — se usan para el CHEQUEO de tipos, pero no generan ningún código que modifique el objeto real. Si el objeto original tenía la propiedad secreto, sigue estando ahí en runtime salvo que tú mismo la elimines (por ejemplo, con destructuring).',
            commonMistakes: {
              0: 'Los tipos no tienen ningún poder sobre el objeto en tiempo de ejecución — son información que existe solo mientras se compila el código.',
              2: 'El código compila sin problema — TypeScript solo restringe qué propiedades puedes acceder según el tipo declarado, no valida el contenido real del objeto en runtime.',
              3: 'No se convierte en undefined — la propiedad simplemente sigue existiendo en el objeto tal cual estaba, con su valor original.',
            },
          },
        ],
        advanced: [
          {
            id: 'tsl5-q1-advanced',
            question: '¿Qué describe `Record<string, number>`?',
            options: [
              'Un objeto donde todas las claves son string y todos los valores son number — como un diccionario',
              'Un array de números',
              'Una función que recibe un string y devuelve un number',
              'Una tupla de exactamente dos elementos',
            ],
            correctIndex: 0,
            explanation:
              'Record<K, V> describe un objeto tipo diccionario: todas sus claves son del tipo K, y todos sus valores del tipo V. Record<string, number> es equivalente a una index signature { [key: string]: number } — útil para inventarios, contadores, mapas de configuración, etc.',
            commonMistakes: {
              1: 'Un array de números se tipa directamente como number[] — Record describe un objeto con estructura de diccionario, no un array.',
              2: 'Esa forma correspondería a un tipo de función, como (clave: string) => number — Record describe un objeto, no una función.',
              3: 'Una tupla de dos elementos sería algo como [string, number] — Record no tiene ningún límite fijo de "elementos", puede tener cualquier cantidad de claves.',
            },
          },
          {
            id: 'tsl5-q2-advanced',
            question:
              'En un proyecto TypeScript con modo `strict` activado, ¿por qué se considera mala práctica abusar de `any` en vez de usar tipos específicos, generics o unknown?',
            options: [
              'Porque any hace que el código sea más lento en runtime',
              'No hay ninguna razón real, es solo una preferencia estética',
              'Porque any es sintaxis inválida en modo strict',
              'Porque cada uso de any desactiva la verificación de tipos en ese sector del código, anulando el propósito principal de usar TypeScript ahí',
            ],
            correctIndex: 3,
            explanation:
              'any le dice a TypeScript "deja de revisar este valor" — cualquier operación sobre un any es aceptada sin chequeo, incluso si en runtime termina siendo un error. Cada any en el código es, en la práctica, un punto ciego donde TypeScript deja de poder ayudarte a detectar errores antes de ejecutar el código, que es la razón principal por la que se elige usar TypeScript.',
            commonMistakes: {
              0: 'any no tiene ningún impacto en el rendimiento en runtime — los tipos (incluido any) se eliminan por completo al compilar.',
              1: 'Es una razón técnica concreta, no solo estética: menos any significa que TypeScript puede detectar más errores reales antes de que el código llegue a ejecutarse.',
              2: 'any es sintaxis perfectamente válida incluso en modo strict — el problema no es que no compile, sino que renuncia a la seguridad de tipos en ese punto.',
            },
          },
        ],
      },
    },
  ],
};
