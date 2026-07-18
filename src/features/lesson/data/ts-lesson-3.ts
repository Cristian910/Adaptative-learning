import type { LessonContent } from '../../../types/domain';

export const tsLesson3: LessonContent = {
  id: 'ts-lesson-3',
  title: 'Funciones tipadas y Generics',
  subtitle: 'Parámetros, valores de retorno, y código que funciona con cualquier tipo',
  level: 'intermediate',
  track: 'typescript',
  prerequisites: ['ts-lesson-2'],
  blocks: [
    {
      id: 'ts-lesson-3-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Parámetros opcionales y por defecto

Un parámetro con \`?\` es opcional; uno con \`= valor\` tiene un valor por defecto si no se pasa nada:

\`\`\`ts
function saludar(nombre: string, saludo: string = "Hola"): string {
  return \`\${saludo}, \${nombre}!\`;
}

saludar("Ana");            // "Hola, Ana!"
saludar("Ana", "Buenas");   // "Buenas, Ana!"
\`\`\`

\`\`\`ts
function sumarExtra(base: number, extra?: number): number {
  return extra !== undefined ? base + extra : base;
}

sumarExtra(10);      // 10 — no se pasó 'extra'
sumarExtra(10, 5);   // 15
\`\`\`

Un parámetro opcional puede no venir; uno con valor por defecto siempre tiene un valor (el que le diste, o el default).`,

        base: `## Funciones como valores: function types

En TypeScript puedes describir la "forma" de una función (qué parámetros recibe y qué devuelve) igual que describes la forma de un objeto:

\`\`\`ts
function aplicarOperacion(
  a: number,
  b: number,
  operacion: (x: number, y: number) => number
): number {
  return operacion(a, b);
}

const sumar = (x: number, y: number): number => x + y;
aplicarOperacion(4, 5, sumar); // 9
\`\`\`

El tipo \`(x: number, y: number) => number\` describe: "una función que recibe dos numbers y devuelve un number". Cualquier función que cumpla esa forma sirve como argumento.

### Funciones que devuelven funciones

\`\`\`ts
function crearMultiplicador(factor: number): (n: number) => number {
  return (n) => n * factor;
}

const porTres = crearMultiplicador(3);
porTres(7); // 21
\`\`\`

El tipo de retorno \`(n: number) => number\` dice: "esta función devuelve OTRA función, que recibe un number y devuelve un number".`,

        advanced: `## Generics: escribir código que funciona con cualquier tipo, sin perder seguridad

Sin generics, tendrías que elegir entre usar \`any\` (perder toda seguridad de tipos) o escribir una función distinta para cada tipo. Los generics resuelven esto con un **parámetro de tipo**:

\`\`\`ts
function primerElemento<T>(items: T[]): T | undefined {
  return items[0];
}

primerElemento([10, 20, 30]);      // T se infiere como number → devuelve number | undefined
primerElemento(['a', 'b', 'c']);    // T se infiere como string → devuelve string | undefined
\`\`\`

\`<T>\` es un "parámetro de tipo": una variable que representa un tipo, no un valor. TypeScript lo infiere automáticamente según lo que le pases, y usa esa misma T en todo el resto de la función — por eso \`primerElemento([10, 20, 30])\` sabe que el resultado es \`number | undefined\`, no \`any\`.

### Generics en tipos de objeto

\`\`\`ts
function envolver<T>(valor: T): { value: T } {
  return { value: valor };
}

envolver(42);     // { value: number }
envolver("hola");  // { value: string }
\`\`\`

### Por qué esto es mejor que any

\`\`\`ts
function primerElementoAny(items: any[]): any {
  return items[0];
}

const resultado = primerElementoAny(['a', 'b']);
resultado.toFixed(2); // TypeScript no se queja... pero resultado es un string, esto explota en runtime
\`\`\`

Con \`any\`, TypeScript "olvida" de qué tipo eran los datos originales. Con generics, la relación entre el tipo de entrada y el de salida se mantiene — TypeScript sabe que si entra un array de strings, sale un string, y te avisa si intentas usarlo como si fuera otra cosa.`,
      },
    },

    {
      id: 'ts-lesson-3-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-ts3-simplified',
          title: 'Parámetros opcionales y por defecto',
          description: 'Completa sumarTodos usando un parámetro opcional.',
          code: `function crearSaludo(nombre: string, saludo: string = 'Hola'): string {
  return \`\${saludo}, \${nombre}!\`;
}

function sumarTodos(base: number, extra?: number): number {
  // Si 'extra' viene, sumalo a base. Si no, devuelve base tal cual.
  return 0;
}

console.log(crearSaludo('Ana'));
console.log(crearSaludo('Luis', 'Buenas'));
console.log(sumarTodos(10));
console.log(sumarTodos(10, 5));`,
          expectedOutput: 'Hola, Ana!\nBuenas, Luis!\n10\n15',
          hints: [
            'Un parámetro opcional que no se pasó vale undefined',
            'return extra !== undefined ? base + extra : base;',
          ],
          solution: `function crearSaludo(nombre: string, saludo: string = 'Hola'): string {
  return \`\${saludo}, \${nombre}!\`;
}

function sumarTodos(base: number, extra?: number): number {
  return extra !== undefined ? base + extra : base;
}

console.log(crearSaludo('Ana'));
console.log(crearSaludo('Luis', 'Buenas'));
console.log(sumarTodos(10));
console.log(sumarTodos(10, 5));`,
        },
        base: {
          id: 'code-ts3-base',
          title: 'Funciones como parámetros',
          description: 'Completa crearMultiplicador: debe devolver una función.',
          code: `function aplicarOperacion(a: number, b: number, operacion: (x: number, y: number) => number): number {
  return operacion(a, b);
}

const sumar = (x: number, y: number): number => x + y;
const multiplicar = (x: number, y: number): number => x * y;

console.log(aplicarOperacion(4, 5, sumar));
console.log(aplicarOperacion(4, 5, multiplicar));

function crearMultiplicador(factor: number): (n: number) => number {
  // Completa: devolver una función que multiplique su argumento por 'factor'
  return (n) => n;
}
const porTres = crearMultiplicador(3);
console.log(porTres(7));`,
          expectedOutput: '9\n20\n21',
          hints: [
            'Tienes que devolver una función, no un número',
            'return (n) => n * factor;',
          ],
          solution: `function aplicarOperacion(a: number, b: number, operacion: (x: number, y: number) => number): number {
  return operacion(a, b);
}

const sumar = (x: number, y: number): number => x + y;
const multiplicar = (x: number, y: number): number => x * y;

console.log(aplicarOperacion(4, 5, sumar));
console.log(aplicarOperacion(4, 5, multiplicar));

function crearMultiplicador(factor: number): (n: number) => number {
  return (n) => n * factor;
}
const porTres = crearMultiplicador(3);
console.log(porTres(7));`,
        },
        advanced: {
          id: 'code-ts3-advanced',
          title: 'Generics: funciones que funcionan con cualquier tipo',
          description: 'Completa envolver y contarCoincidencias usando un parámetro de tipo genérico <T>.',
          code: `function primerElemento<T>(items: T[]): T | undefined {
  return items[0];
}

function envolver<T>(valor: T): { value: T } {
  // Completa: devolver un objeto { value: valor }
  return { value: valor };
}

console.log(primerElemento([10, 20, 30]));
console.log(primerElemento(['a', 'b', 'c']));
console.log(envolver(42).value);
console.log(envolver('hola').value);

function contarCoincidencias<T>(items: T[], objetivo: T): number {
  // Completa: contar cuántas veces aparece 'objetivo' en 'items'
  return 0;
}
console.log(contarCoincidencias([1, 2, 2, 3, 2], 2));`,
          expectedOutput: '10\na\n42\nhola\n3',
          hints: [
            'envolver ya está resuelto en el enunciado — fíjate el patrón',
            'contarCoincidencias: items.filter((i) => i === objetivo).length',
          ],
          solution: `function primerElemento<T>(items: T[]): T | undefined {
  return items[0];
}

function envolver<T>(valor: T): { value: T } {
  return { value: valor };
}

console.log(primerElemento([10, 20, 30]));
console.log(primerElemento(['a', 'b', 'c']));
console.log(envolver(42).value);
console.log(envolver('hola').value);

function contarCoincidencias<T>(items: T[], objetivo: T): number {
  return items.filter((i) => i === objetivo).length;
}
console.log(contarCoincidencias([1, 2, 2, 3, 2], 2));`,
        },
      },
    },

    {
      id: 'ts-lesson-3-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'tsl3-q1-simple',
            question: 'Dado `function f(nombre: string, saludo: string = "Hola")`, ¿qué pasa si llamas `f("Ana")`?',
            options: [
              'Da un error porque falta el segundo argumento',
              'saludo toma automáticamente el valor "Hola"',
              'saludo queda undefined',
              'nombre y saludo quedan intercambiados',
            ],
            correctIndex: 1,
            explanation:
              'Un parámetro con valor por defecto (= "Hola") usa ese valor automáticamente cuando no se le pasa nada — no hace falta pasar todos los argumentos para que la función funcione.',
            commonMistakes: {
              0: 'Justo por tener un valor por defecto, la función NO exige ese segundo argumento — llamarla sin él es válido.',
              2: 'undefined pasaría si el parámetro fuera opcional (con ?) sin valor por defecto — aquí tiene un default, así que toma ese valor.',
              3: 'Los parámetros no se intercambian — cada uno mantiene su posición y su propio comportamiento.',
            },
          },
          {
            id: 'tsl3-q2-simple',
            question: 'Dado `function f(base: number, extra?: number)`, si llamas `f(10)` sin el segundo argumento, ¿qué valor tiene `extra` dentro de la función?',
            options: [
              '0',
              'null',
              'undefined',
              'Un error impide que la función se ejecute',
            ],
            correctIndex: 2,
            explanation:
              'Un parámetro opcional (con ?) que no recibe ningún argumento vale undefined dentro de la función — a diferencia de un parámetro con valor por defecto, que tomaría ese valor en vez de undefined.',
            commonMistakes: {
              0: '0 no es el valor automático de un parámetro opcional no provisto — eso sería si tuviera = 0 como valor por defecto.',
              1: 'null y undefined son valores distintos en JavaScript/TypeScript — un parámetro opcional no provisto es undefined, no null.',
              3: 'Los parámetros opcionales están diseñados justamente para que la función pueda llamarse sin ellos, sin ningún error.',
            },
          },
        ],
        base: [
          {
            id: 'tsl3-q1-base',
            question: '¿Qué describe el tipo `(x: number, y: number) => number`?',
            options: [
              'Un objeto con dos propiedades x e y',
              'Una comparación entre x e y',
              'Un array de dos números',
              'Una función que recibe dos parámetros number y devuelve un number',
            ],
            correctIndex: 3,
            explanation:
              'La sintaxis (parámetros) => tipoDeRetorno describe la FORMA de una función: qué recibe y qué devuelve. Cualquier función que reciba dos numbers y devuelva un number es compatible con este tipo, sin importar el nombre que le hayas puesto a la función real.',
            commonMistakes: {
              0: 'Esa forma describiría un objeto como { x: number, y: number } — con => en el medio, es un tipo de función, no de objeto.',
              1: 'No hay ninguna comparación implícita — es puramente la descripción de la forma (parámetros y retorno) de una función.',
              2: 'Un array de números se tipa como number[] — esta sintaxis con paréntesis y => es específica de funciones.',
            },
          },
          {
            id: 'tsl3-q2-base',
            question:
              'Dado `function crear(factor: number): (n: number) => number { return (n) => n * factor; }`, ¿qué devuelve `crear(3)`?',
            options: [
              'El número 3',
              'Una función que, al llamarla con un número, lo multiplica por 3',
              'undefined',
              'Un error de tipos',
            ],
            correctIndex: 1,
            explanation:
              'El tipo de retorno (n: number) => number indica que la función devuelve OTRA función. crear(3) no ejecuta la multiplicación todavía — devuelve una función que, cuando se la llame más adelante con algún número, lo va a multiplicar por 3 (el factor con el que se creó).',
            commonMistakes: {
              0: 'crear(3) no devuelve el número 3 directamente — devuelve una función que USA ese 3 como factor cuando se la invoque.',
              2: 'La función devuelve algo perfectamente válido: otra función, tal como indica su tipo de retorno.',
              3: 'El código es válido — el tipo de retorno (n: number) => number describe correctamente lo que se devuelve.',
            },
          },
        ],
        advanced: [
          {
            id: 'tsl3-q1-advanced',
            question:
              'Dado `function primerElemento<T>(items: T[]): T | undefined`, cuando llamas `primerElemento(["a", "b"])`, ¿qué tipo infiere TypeScript para T?',
            options: [
              'any, porque T puede ser cualquier cosa',
              'string, porque TypeScript infiere T a partir del tipo del array que le pasaste',
              'T siempre queda sin definir hasta que lo especifiques a mano',
              'unknown',
            ],
            correctIndex: 1,
            explanation:
              'TypeScript infiere el valor de T automáticamente a partir de los argumentos que recibe la función — si le pasas un string[], T se vuelve string en esa llamada específica, y el tipo de retorno pasa a ser string | undefined. Cada llamada puede inferir un T distinto.',
            commonMistakes: {
              0: 'Ese es justo el problema que los generics evitan — a diferencia de any, T se resuelve a un tipo concreto y específico en cada llamada.',
              2: 'TypeScript infiere T automáticamente en la mayoría de los casos, sin que haga falta especificarlo a mano (aunque se puede hacer explícito con primerElemento<string>(...) si hiciera falta).',
              3: 'unknown sería el tipo si TypeScript no pudiera determinar nada sobre los datos — pero aquí sí puede inferirlo perfectamente del argumento recibido.',
            },
          },
          {
            id: 'tsl3-q2-advanced',
            question:
              '¿Cuál es la ventaja principal de usar un generic `<T>` en vez de `any` para una función como primerElemento?',
            options: [
              'Los generics hacen que el código corra más rápido',
              'Los generics solo funcionan con arrays',
              'any y los generics son exactamente lo mismo',
              'Los generics mantienen la relación entre el tipo de entrada y el de salida, así TypeScript sigue pudiendo detectar usos incorrectos del resultado',
            ],
            correctIndex: 3,
            explanation:
              'Con any, TypeScript "olvida" de qué tipo eran los datos originales — el resultado puede usarse de cualquier forma sin que se queje, aunque después explote en runtime. Con un generic <T>, la relación se mantiene: si entra un array de strings, T se resuelve a string, y TypeScript te avisa si después intentas usar el resultado como si fuera, por ejemplo, un number.',
            commonMistakes: {
              0: 'Los tipos (generics incluidos) se eliminan por completo al compilar — no tienen ningún efecto en la velocidad de ejecución.',
              1: 'Los generics se pueden usar con cualquier tipo de dato — objetos, funciones, promesas, etc. — no están limitados a arrays.',
              2: 'Son opuestos en este sentido: any renuncia a la verificación de tipos, mientras que los generics la preservan de forma flexible.',
            },
          },
        ],
      },
    },
  ],
};
