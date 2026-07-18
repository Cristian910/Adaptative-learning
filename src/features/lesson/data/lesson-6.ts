import type { LessonContent } from '../../../types/domain';

export const lesson6: LessonContent = {
  id: 'lesson-6',
  title: 'Estructuras de Control: Condicionales y Bucles',
  subtitle: 'Cómo tomar decisiones y repetir tareas en tu código',
  level: 'base',
  track: 'javascript',
  prerequisites: ['lesson-5'],
  blocks: [
    {
      id: 'lesson-6-explanation',
      type: 'explanation',
      estimatedMinutes: 6,
      variants: {
        simplified: `## Tomar decisiones: if / else

\`\`\`js
let edad = 20;

if (edad >= 18) {
  console.log("Sos mayor de edad");
} else {
  console.log("Sos menor de edad");
}
\`\`\`

Puedes encadenar varias condiciones con \`else if\`:

\`\`\`js
if (nota >= 7) {
  console.log("Aprobado");
} else if (nota >= 4) {
  console.log("Regular");
} else {
  console.log("Desaprobado");
}
\`\`\`

## Repetir tareas: el bucle for

\`\`\`js
for (let i = 0; i < 5; i++) {
  console.log(i); // imprime 0, 1, 2, 3, 4
}
\`\`\`

Un \`for\` tiene 3 partes separadas por \`;\`: dónde empezar (\`let i = 0\`), hasta
cuándo seguir (\`i < 5\`), y qué hacer en cada vuelta (\`i++\`, sumar 1).`,

        base: `## Condicionales: if / else / else if

\`\`\`js
function clasificar(nota) {
  if (nota >= 7) {
    return "Aprobado";
  } else if (nota >= 4) {
    return "Regular";
  } else {
    return "Desaprobado";
  }
}
\`\`\`

### El operador ternario (atajo para if/else simples)

\`\`\`js
const mensaje = edad >= 18 ? "Mayor de edad" : "Menor de edad";
// equivalente a:
// if (edad >= 18) { mensaje = "Mayor de edad"; } else { mensaje = "Menor de edad"; }
\`\`\`

### switch (cuando hay muchas opciones sobre el mismo valor)

\`\`\`js
switch (diaSemana) {
  case 0:
    console.log("Domingo");
    break;
  case 6:
    console.log("Sábado");
    break;
  default:
    console.log("Día de semana");
}
\`\`\`

El \`break\` es importante — sin él, la ejecución "cae" al siguiente \`case\`.

## Bucles: for, while y for...of

\`\`\`js
// for clásico: cuando sabes cuántas veces repetir
for (let i = 0; i < numeros.length; i++) {
  console.log(numeros[i]);
}

// for...of: cuando solo te interesan los VALORES de una colección
for (const numero of numeros) {
  console.log(numero);
}

// while: cuando repites hasta que se cumpla una condición (no sabes cuántas veces)
let intentos = 0;
while (intentos < 3) {
  intentos++;
}
\`\`\`

\`break\` corta el bucle por completo. \`continue\` salta a la siguiente vuelta
sin ejecutar el resto del cuerpo.`,

        advanced: `## Control de flujo: casos avanzados y trampas comunes

### for...in vs for...of

Se confunden seguido, pero recorren cosas distintas:

\`\`\`js
const arr = ['a', 'b', 'c'];

for (const index in arr) {
  console.log(index); // '0', '1', '2' — los ÍNDICES (como strings!)
}

for (const value of arr) {
  console.log(value); // 'a', 'b', 'c' — los VALORES
}
\`\`\`

**Regla práctica**: para arrays, casi siempre quieres \`for...of\`. \`for...in\`
recorre propiedades enumerables (incluidas las heredadas del prototype en
algunos casos), lo cual es más apropiado para objetos planos, no arrays.

### Fall-through en switch: a veces es intencional

\`\`\`js
function esDiaDeFinDeSemana(dia) {
  switch (dia) {
    case 'sábado':
    case 'domingo':
      return true; // ambos casos "caen" al mismo return — es intencional
    default:
      return false;
  }
}
\`\`\`

### Bucles y closures: la trampa de var

\`\`\`js
// Con var: todas las funciones comparten la MISMA variable i
var funciones = [];
for (var i = 0; i < 3; i++) {
  funciones.push(() => i);
}
funciones.map(f => f()); // [3, 3, 3] — sorpresa

// Con let: cada iteración tiene su PROPIO binding de i
var funcionesOk = [];
for (let i = 0; i < 3; i++) {
  funcionesOk.push(() => i);
}
funcionesOk.map(f => f()); // [0, 1, 2] — el esperado
\`\`\`

Esto se explica en profundidad en la lección de Funciones y Scope — aquí alcanza
con saber que \`let\` en un \`for\` crea un scope de bloque nuevo por iteración.

### Early return en vez de anidar ifs

\`\`\`js
// Anidado — más difícil de leer
function procesar(usuario) {
  if (usuario) {
    if (usuario.activo) {
      return usuario.nombre;
    }
  }
  return null;
}

// Early return — mismo resultado, más plano
function procesarV2(usuario) {
  if (!usuario) return null;
  if (!usuario.activo) return null;
  return usuario.nombre;
}
\`\`\``,
      },
    },

    {
      id: 'lesson-6-code',
      type: 'code',
      estimatedMinutes: 6,
      variants: {
        simplified: {
          id: 'code-6-simplified',
          title: 'Clasificar un número',
          description: 'Completa la función para clasificar un número como positivo, negativo o cero.',
          code: `function clasificar(numero) {
  // Retorna 'positivo', 'negativo' o 'cero' según corresponda
}

console.log(clasificar(5));
console.log(clasificar(-3));
console.log(clasificar(0));`,
          expectedOutput: 'positivo\nnegativo\ncero',
          hints: [
            "if (numero > 0) return 'positivo';",
            "Después revisa if (numero < 0) return 'negativo'; y por último return 'cero';",
          ],
          solution: `function clasificar(numero) {
  if (numero > 0) return 'positivo';
  if (numero < 0) return 'negativo';
  return 'cero';
}

console.log(clasificar(5));
console.log(clasificar(-3));
console.log(clasificar(0));`,
        },
        base: {
          id: 'code-6-base',
          title: 'Sumar los números pares',
          description: 'Usa un bucle for para sumar solo los números pares de un array.',
          code: `function sumarPares(numeros) {
  let total = 0;
  // Completa el loop: recorre numeros y suma a total
  // solo los que sean pares (numero % 2 === 0)

  return total;
}

console.log(sumarPares([1, 2, 3, 4, 5, 6]));
console.log(sumarPares([1, 3, 5]));`,
          expectedOutput: '12\n0',
          hints: [
            'for (let i = 0; i < numeros.length; i++) { ... }',
            'Dentro del loop: if (numeros[i] % 2 === 0) { total += numeros[i]; }',
          ],
          solution: `function sumarPares(numeros) {
  let total = 0;
  for (let i = 0; i < numeros.length; i++) {
    if (numeros[i] % 2 === 0) {
      total += numeros[i];
    }
  }
  return total;
}

console.log(sumarPares([1, 2, 3, 4, 5, 6]));
console.log(sumarPares([1, 3, 5]));`,
        },
        advanced: {
          id: 'code-6-advanced',
          title: 'FizzBuzz',
          description:
            'El clásico: del 1 al n, múltiplos de 3 dicen Fizz, de 5 dicen Buzz, de ambos dicen FizzBuzz.',
          code: `function fizzBuzz(n) {
  const resultado = [];
  // Para cada número de 1 a n (inclusive):
  // - múltiplo de 3 y 5 → 'FizzBuzz'
  // - múltiplo de 3 → 'Fizz'
  // - múltiplo de 5 → 'Buzz'
  // - si no → el número como string

  return resultado;
}

console.log(fizzBuzz(15).join(','));`,
          expectedOutput: '1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz',
          hints: [
            'Revisa primero el múltiplo de 15 (3 Y 5) — si lo dejas para el final, nunca se va a alcanzar esa rama',
            'i % 15 === 0 antes que i % 3 === 0 y i % 5 === 0',
          ],
          solution: `function fizzBuzz(n) {
  const resultado = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) resultado.push('FizzBuzz');
    else if (i % 3 === 0) resultado.push('Fizz');
    else if (i % 5 === 0) resultado.push('Buzz');
    else resultado.push(String(i));
  }
  return resultado;
}

console.log(fizzBuzz(15).join(','));`,
        },
      },
    },

    {
      id: 'lesson-6-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'l6-q1-simple',
            question: '¿Qué hace `break` dentro de un bucle?',
            options: [
              'Salta a la siguiente vuelta del bucle',
              'Termina el bucle por completo, inmediatamente',
              'Pausa el bucle unos segundos',
              'Reinicia el bucle desde cero',
            ],
            correctIndex: 1,
            explanation:
              'break sale del bucle inmediatamente, sin ejecutar más vueltas, y el código continúa después del bucle.',
            commonMistakes: {
              0: 'Eso es lo que hace continue, no break.',
              2: 'break no pausa nada — termina el bucle de forma permanente e inmediata.',
              3: 'break no reinicia el bucle, lo termina — la ejecución sigue con el código de después.',
            },
          },
          {
            id: 'l6-q2-simple',
            question: '¿Cuántas veces se ejecuta `for (let i = 0; i < 3; i++) { ... }`?',
            options: [
              '3 veces',
              '2 veces',
              '4 veces',
              'Infinitas veces',
            ],
            correctIndex: 0,
            explanation:
              'i empieza en 0 y sigue mientras i < 3, incrementando de a 1: i vale 0, 1, 2 (tres vueltas), y se detiene cuando i llega a 3.',
            commonMistakes: {
              1: 'Cuenta de nuevo: i toma los valores 0, 1 y 2 — son 3 vueltas, no 2.',
              2: 'El bucle se detiene apenas i deja de ser menor que 3, es decir, en la 3ra vuelta (i=2) es la última.',
              3: 'El bucle tiene una condición de corte clara (i < 3) y un incremento (i++), así que sí termina.',
            },
          },
        ],
        base: [
          {
            id: 'l6-q1-base',
            question:
              '¿Cuál es la diferencia principal entre `for...in` y `for...of` sobre un array?',
            options: [
              'No hay ninguna diferencia, son intercambiables',
              'for...in solo funciona con objetos, nunca con arrays',
              'for...of es más lento que for...in',
              'for...in recorre los índices (como strings), for...of recorre los valores',
            ],
            correctIndex: 3,
            explanation:
              'for...in itera sobre las claves/índices enumerables (en arrays, los índices como "0", "1", "2"...). for...of itera directamente sobre los valores. Para arrays, for...of es casi siempre lo que uno quiere.',
            commonMistakes: {
              0: 'Son bastante distintos — uno da índices, el otro da valores directamente.',
              1: 'for...in sí funciona con arrays (los arrays son objetos), pero da los índices en vez de los valores — por eso no es lo ideal para arrays.',
              2: 'La diferencia no es de performance, es de QUÉ te entrega cada uno en cada vuelta.',
            },
          },
          {
            id: 'l6-q2-base',
            question:
              '¿Qué imprime este switch si `dia` vale "sábado"?\n\n```js\nswitch (dia) {\n  case "sábado":\n  case "domingo":\n    console.log("Fin de semana");\n    break;\n  default:\n    console.log("Día de semana");\n}\n```',
            options: [
              'Nada, porque falta código en el case "sábado"',
              'Un error de sintaxis',
              '"Día de semana"',
              '"Fin de semana"',
            ],
            correctIndex: 3,
            explanation:
              'Cuando un case no tiene código propio, "cae" (fall-through) al siguiente case hasta encontrar un break. Aquí es intencional: tanto "sábado" como "domingo" ejecutan el mismo console.log.',
            commonMistakes: {
              0: 'Esto es fall-through intencional, no un error — "sábado" cae directo al código de "domingo".',
              1: 'La sintaxis es completamente válida — el fall-through entre cases sin break es un patrón común y legal.',
              2: 'default solo se ejecuta si NINGÚN case coincide — aquí "sábado" sí coincide.',
            },
          },
        ],
        advanced: [
          {
            id: 'l6-q1-advanced',
            question:
              '¿Qué imprime `funciones.map(f => f())` en este código?\n\n```js\nvar funciones = [];\nfor (var i = 0; i < 3; i++) {\n  funciones.push(() => i);\n}\n```',
            options: [
              '[3, 3, 3]',
              '[0, 1, 2]',
              '[undefined, undefined, undefined]',
              'Error de sintaxis',
            ],
            correctIndex: 0,
            explanation:
              'var tiene scope de función, no de bloque — las 3 funciones flecha comparten la MISMA variable i. Para cuando se ejecutan (después de terminar el loop), i ya vale 3.',
            commonMistakes: {
              1: 'Eso pasaría con let, no con var — con var todas las closures comparten la misma variable.',
              2: 'i sí tiene un valor final (3), no queda undefined — el problema es que las 3 funciones comparten esa única variable.',
              3: 'El código es sintácticamente válido — el resultado es sorprendente, pero no es un error.',
            },
          },
          {
            id: 'l6-q2-advanced',
            question:
              '¿Por qué se prefiere el "early return" sobre anidar múltiples if en funciones largas?',
            options: [
              'El early return es más rápido de ejecutar',
              'Reduce el nivel de anidamiento y hace el flujo de casos inválidos más fácil de leer',
              'Anidar ifs está deprecado en JavaScript moderno',
              'No hay ninguna razón real, es solo preferencia estética sin impacto',
            ],
            correctIndex: 1,
            explanation:
              'Con early return, cada condición de "salida temprana" (casos inválidos, nulos, etc.) se resuelve en una línea y el resto de la función puede asumir que esos casos ya están descartados — evita el "código en forma de pirámide" con muchos niveles de indentación.',
            commonMistakes: {
              0: 'La diferencia de performance entre ambos estilos es insignificante — la ventaja es de legibilidad, no de velocidad.',
              2: 'Anidar ifs sigue siendo válido y a veces necesario — no está deprecado, simplemente el early return suele ser más legible para casos de validación.',
              3: 'Sí tiene impacto real en legibilidad y mantenibilidad, especialmente en funciones con varias validaciones previas al caso "normal".',
            },
          },
        ],
      },
    },
  ],
};
