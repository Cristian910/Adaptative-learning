import type { LessonContent } from '../../../types/domain';

export const tsLesson1: LessonContent = {
  id: 'ts-lesson-1',
  title: 'Tipos básicos y anotaciones',
  subtitle: 'Qué le agrega TypeScript a JavaScript y por qué importa',
  level: 'base',
  track: 'typescript',
  prerequisites: [],
  blocks: [
    {
      id: 'ts-lesson-1-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## ¿Qué le agrega TypeScript a JavaScript?

TypeScript es JavaScript **más un sistema de tipos**. Todo el JavaScript que ya sabes sigue funcionando igual — TypeScript solo te deja *decirle al código* qué tipo de dato esperas en cada lugar.

\`\`\`ts
let nombre: string = "Ana";
let edad: number = 30;
let activo: boolean = true;
\`\`\`

Si intentas poner un valor del tipo equivocado, TypeScript te avisa **antes de correr el código** (en tu editor), no cuando ya se rompió en producción:

\`\`\`ts
let edad: number = "treinta"; // ❌ Error: Type 'string' is not assignable to type 'number'
\`\`\`

### Inferencia: no siempre hace falta anotar

Si le das un valor inicial, TypeScript infiere el tipo solo:

\`\`\`ts
let ciudad = "Buenos Aires"; // TypeScript ya sabe que esto es string
\`\`\`

Anotar el tipo (\`: string\`) es más útil en **funciones** (parámetros y valores de retorno), donde TypeScript no tiene un valor inicial del que inferir.`,

        base: `## El sistema de tipos de TypeScript

TypeScript compila a JavaScript plano — los tipos existen solo mientras escribes el código (en tu editor y al compilar), y desaparecen por completo en el JavaScript que termina corriendo. Por eso un error de tipo nunca es un error en tiempo de ejecución: es un error que TypeScript te muestra *antes*, mientras programas.

\`\`\`ts
function sumar(a: number, b: number): number {
  return a + b;
}

sumar(2, 3);        // ✅ 5
sumar(2, "3");       // ❌ Error de tipos en tu editor — en JS puro correría igual
\`\`\`

### Anotar variables, parámetros y retornos

\`\`\`ts
let precio: number = 99.9;
let disponible: boolean = true;

function formatearPrecio(valor: number): string {
  return \`$\${valor.toFixed(2)}\`;
}
\`\`\`

### Arrays tipados

\`\`\`ts
let numeros: number[] = [1, 2, 3];
let nombres: Array<string> = ["Ana", "Luis"]; // sintaxis equivalente a string[]
\`\`\`

### any: la salida de emergencia (y por qué evitarla)

\`\`\`ts
let valor: any = 42;
valor = "ahora soy un string";  // válido — any desactiva la verificación de tipos
valor.metodoQueNoExiste();       // TypeScript no se queja... y explota en runtime
\`\`\`

\`any\` le dice a TypeScript "deja de revisar este valor" — es básicamente volver a JavaScript sin ningún tipo de red de seguridad. Sirve como salida de emergencia puntual, pero abusar de \`any\` anula el propósito de usar TypeScript.`,

        advanced: `## unknown vs any: seguridad real vs. desactivar el chequeo

\`any\` y \`unknown\` se parecen (ambos aceptan cualquier valor), pero se comportan completamente distinto al *usar* ese valor:

\`\`\`ts
let a: any = obtenerDatoExterno();
a.toUpperCase(); // TypeScript no se queja, aunque 'a' pueda no ser un string

let u: unknown = obtenerDatoExterno();
u.toUpperCase(); // ❌ Error: Object is of type 'unknown' — hay que verificar el tipo primero

if (typeof u === 'string') {
  u.toUpperCase(); // ✅ Ahora sí — TypeScript "achicó" (narrowed) el tipo a string
}
\`\`\`

\`unknown\` es el tipo correcto para datos de fuentes externas (respuestas de API, \`JSON.parse\`, inputs de usuario): obliga a verificar antes de operar, en vez de confiar ciegamente.

### Type narrowing con typeof

Esta técnica de "verificar antes de usar" se llama **narrowing** (achicar el tipo). El chequeo \`typeof u === 'string'\` no es solo lógica de JavaScript — TypeScript lo entiende y ajusta el tipo dentro de ese bloque:

\`\`\`ts
function describir(valor: unknown): string {
  if (typeof valor === 'number') {
    return valor.toFixed(2); // aquí adentro, TS ya sabe que valor es number
  }
  if (typeof valor === 'string') {
    return valor.trim();
  }
  return 'tipo desconocido';
}
\`\`\`

### readonly: proteger contra mutaciones accidentales

\`\`\`ts
function imprimirNombres(nombres: readonly string[]): void {
  nombres.push("nuevo"); // ❌ Error: no se puede mutar un array readonly
}
\`\`\`

\`readonly\` no existe como concepto en JavaScript — es una garantía que solo aporta TypeScript, útil para dejar explícito "esta función no debería modificar lo que le pasaste". Al compilar, esa restricción desaparece: en runtime, el array sigue siendo un array común.`,
      },
    },

    {
      id: 'ts-lesson-1-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-ts1-simplified',
          title: 'Completar una función tipada',
          description: 'Completa calcularPrecioFinal: el precio final es el precio menos el descuento (como %).',
          code: `function calcularPrecioFinal(precio: number, descuentoPorcentaje: number): number {
  // Completa la fórmula
  return 0;
}

console.log(calcularPrecioFinal(100, 20));
console.log(calcularPrecioFinal(50, 10));`,
          expectedOutput: '80\n45',
          hints: [
            'El descuento en valor absoluto es: precio * descuentoPorcentaje / 100',
            'return precio - (precio * descuentoPorcentaje / 100);',
          ],
          solution: `function calcularPrecioFinal(precio: number, descuentoPorcentaje: number): number {
  return precio - (precio * descuentoPorcentaje / 100);
}

console.log(calcularPrecioFinal(100, 20));
console.log(calcularPrecioFinal(50, 10));`,
        },
        base: {
          id: 'code-ts1-base',
          title: 'Funciones con tipos de retorno explícitos',
          description: 'Completa promedio (number) y esMayorDeEdad (boolean).',
          code: `function promedio(numeros: number[]): number {
  // Completa: calcular el promedio del array
  return 0;
}

function esMayorDeEdad(edad: number): boolean {
  // Completa: true si edad >= 18
  return false;
}

console.log(promedio([10, 20, 30]));
console.log(esMayorDeEdad(15));
console.log(esMayorDeEdad(18));`,
          expectedOutput: '20\nfalse\ntrue',
          hints: [
            'reduce((acc, n) => acc + n, 0) suma todos los elementos del array',
            'promedio: numeros.reduce((acc, n) => acc + n, 0) / numeros.length',
            'esMayorDeEdad: return edad >= 18;',
          ],
          solution: `function promedio(numeros: number[]): number {
  return numeros.reduce((acc, n) => acc + n, 0) / numeros.length;
}

function esMayorDeEdad(edad: number): boolean {
  return edad >= 18;
}

console.log(promedio([10, 20, 30]));
console.log(esMayorDeEdad(15));
console.log(esMayorDeEdad(18));`,
        },
        advanced: {
          id: 'code-ts1-advanced',
          title: 'any vs unknown: narrowing obligatorio',
          description:
            'Completa procesarEntrada: recibe un valor de tipo unknown y decide qué hacer según su tipo real.',
          code: `function procesarEntrada(valor: unknown): string {
  // Si es string, devuelve el string en mayúsculas.
  // Si es number, devuelve el número multiplicado por 2, como string.
  // Para cualquier otro tipo, devuelve "tipo no soportado".
  return '';
}

console.log(procesarEntrada('hola'));
console.log(procesarEntrada(21));
console.log(procesarEntrada(true));`,
          expectedOutput: 'HOLA\n42\ntipo no soportado',
          hints: [
            'Con unknown, TypeScript te obliga a verificar el tipo con typeof antes de operar',
            "if (typeof valor === 'string') return valor.toUpperCase();",
            "if (typeof valor === 'number') return String(valor * 2);",
          ],
          solution: `function procesarEntrada(valor: unknown): string {
  if (typeof valor === 'string') return valor.toUpperCase();
  if (typeof valor === 'number') return String(valor * 2);
  return 'tipo no soportado';
}

console.log(procesarEntrada('hola'));
console.log(procesarEntrada(21));
console.log(procesarEntrada(true));`,
        },
      },
    },

    {
      id: 'ts-lesson-1-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'tsl1-q1-simple',
            question: '¿Qué hace `let edad: number = 30;`?',
            options: [
              "Declara que 'edad' debe ser siempre un valor de tipo number",
              'Crea una variable que siempre vale 30',
              'Convierte 30 en un string',
              'No hace nada especial, es idéntico a JavaScript sin tipos',
            ],
            correctIndex: 0,
            explanation:
              'La anotación : number le dice a TypeScript que "edad" solo puede contener valores numéricos — si más adelante intentas asignarle un string, TypeScript te avisa en tu editor, antes de ejecutar nada.',
            commonMistakes: {
              1: 'number no fija el VALOR de la variable — edad sigue pudiendo cambiar (con let), solo tiene que seguir siendo un número.',
              2: 'La anotación de tipo no convierte ningún valor — solo restringe qué tipos de valores son válidos para esa variable.',
              3: 'Sí hay una diferencia real: TypeScript valida el tipo mientras escribes código, aunque en tiempo de ejecución termine siendo JavaScript puro sin ningún rastro de esa anotación.',
            },
          },
          {
            id: 'tsl1-q2-simple',
            question: '¿Qué pasa con los tipos de TypeScript cuando el código se ejecuta en el navegador?',
            options: [
              'Se mantienen y el navegador los valida en tiempo real',
              'Se convierten automáticamente en comentarios',
              'Desaparecen por completo — se compilan a JavaScript plano sin ningún rastro de tipos',
              'TypeScript no puede ejecutarse en el navegador',
            ],
            correctIndex: 2,
            explanation:
              'Los tipos son una herramienta de tiempo de compilación/edición. Al compilar TypeScript a JavaScript, todas las anotaciones de tipo se eliminan — el navegador solo llega a ver JavaScript común, exactamente como si nunca hubieras escrito ningún tipo.',
            commonMistakes: {
              0: 'El navegador nunca ve TypeScript — solo corre el JavaScript resultante de compilarlo, sin ningún tipo de validación en runtime.',
              1: 'No quedan ni como comentarios: se eliminan por completo del código compilado.',
              3: 'TypeScript sí puede "ejecutarse" en el navegador — en realidad, se compila a JavaScript primero, y ESE JavaScript es lo que corre.',
            },
          },
        ],
        base: [
          {
            id: 'tsl1-q1-base',
            question: '¿Cuál es la diferencia entre `any` y `unknown`?',
            options: [
              'Son exactamente lo mismo, solo cambia el nombre',
              'unknown solo se puede usar con valores numéricos',
              'any desactiva la verificación de tipos; unknown obliga a verificar el tipo real antes de usarlo',
              'any es más seguro que unknown',
            ],
            correctIndex: 2,
            explanation:
              'any le dice a TypeScript que deje de revisar ese valor por completo — puedes llamar cualquier método sobre él sin que se queje, aunque explote en runtime. unknown también acepta cualquier valor, pero TypeScript exige que verifiques (narrowing) el tipo real antes de operar sobre él, por eso es la opción más segura para datos externos.',
            commonMistakes: {
              0: 'Se comportan de forma opuesta al usar el valor: any no exige ninguna verificación, unknown sí.',
              1: 'unknown puede contener cualquier tipo de valor, no solo números — la diferencia con any es sobre la SEGURIDAD al usarlo, no sobre qué tipos acepta.',
              3: 'Es al revés: unknown es más seguro justamente porque obliga a verificar el tipo antes de poder operar sobre el valor.',
            },
          },
          {
            id: 'tsl1-q2-base',
            question:
              "Dado `function esTexto(valor: unknown): boolean { return typeof valor === 'string'; }`, ¿qué imprime `console.log(esTexto(\"hola\"), esTexto(42))`?",
            options: [
              'true false',
              'true true',
              'false true',
              'false false',
            ],
            correctIndex: 0,
            explanation:
              '"hola" es un string, así que typeof valor === \'string\' es true. 42 es un number, así que la misma comparación da false.',
            commonMistakes: {
              1: '42 no es un string — typeof 42 es "number", no "string", así que esa comparación da false.',
              2: 'Es al revés: "hola" sí es string (true), 42 no lo es (false).',
              3: '"hola" sí es un string — la primera llamada da true, no false.',
            },
          },
        ],
        advanced: [
          {
            id: 'tsl1-q1-advanced',
            question:
              '¿Por qué `readonly string[]` no tiene ningún efecto en el JavaScript compilado?',
            options: [
              'Porque JavaScript no permite declarar arrays',
              'Porque readonly es una garantía de tiempo de compilación que TypeScript agrega — no existe como concepto en JavaScript',
              'Porque los arrays en JavaScript ya son inmutables por defecto',
              'Porque JavaScript convierte readonly en const automáticamente',
            ],
            correctIndex: 1,
            explanation:
              'readonly es puramente una anotación para el compilador de TypeScript: le indica que ese array no debería mutarse dentro de esa función. Al compilar a JavaScript, esa restricción desaparece por completo — en runtime, el array sigue siendo un array común y mutable, con push/pop y todo lo demás disponible.',
            commonMistakes: {
              0: 'JavaScript permite arrays perfectamente — el punto es sobre readonly específicamente, no sobre arrays en general.',
              2: 'Los arrays de JavaScript SON mutables por defecto (push, pop, splice, etc. funcionan) — eso es justo lo que readonly intenta prevenir a nivel de tipos, aunque no a nivel de runtime.',
              3: 'readonly y const son conceptos relacionados pero distintos, y ninguno se "convierte" en el otro: const evita reasignar la variable, readonly (en un array) evita mutar su contenido a nivel de tipos.',
            },
          },
          {
            id: 'tsl1-q2-advanced',
            question:
              "Dado `function f(valor: unknown) { if (typeof valor === 'number') { /* aquí */ } }`, ¿qué significa 'narrowing' dentro de ese bloque if?",
            options: [
              "TypeScript convierte 'valor' a string automáticamente",
              "'narrowing' es un patrón que hay que evitar siempre",
              'El código se vuelve más lento en tiempo de ejecución',
              "Dentro de ese bloque, TypeScript trata a 'valor' como number, aunque su tipo declarado sea unknown",
            ],
            correctIndex: 3,
            explanation:
              'Narrowing es cuando TypeScript usa una verificación en tiempo de ejecución (como typeof) para "achicar" el rango de tipos posibles dentro de un bloque de código. Fuera del if, valor sigue siendo unknown para TypeScript; adentro del bloque, ya sabe que es number, y te deja usar métodos de number sin quejarse.',
            commonMistakes: {
              0: 'No hay ninguna conversión de tipo real — narrowing es sobre cómo TypeScript RAZONA sobre el tipo, no sobre transformar el valor en sí.',
              1: 'Al contrario: narrowing (combinado con unknown) es la forma recomendada y segura de trabajar con datos cuyo tipo no se conoce de antemano.',
              2: 'Narrowing no tiene costo en runtime — es análisis estático que hace TypeScript al compilar, no agrega código extra al JavaScript resultante.',
            },
          },
        ],
      },
    },
  ],
};
