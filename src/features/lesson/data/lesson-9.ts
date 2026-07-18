import type { LessonContent } from '../../../types/domain';

export const lesson9: LessonContent = {
  id: 'lesson-9',
  title: 'This, Prototipos y Clases en JavaScript',
  subtitle: 'Programación orientada a objetos, a la manera de JavaScript',
  level: 'advanced',
  track: 'javascript',
  prerequisites: ['lesson-3'],
  blocks: [
    {
      id: 'lesson-9-explanation',
      type: 'explanation',
      estimatedMinutes: 7,
      variants: {
        simplified: `## Clases: una plantilla para crear objetos

\`\`\`js
class Persona {
  constructor(nombre, edad) {
    this.nombre = nombre;
    this.edad = edad;
  }

  saludar() {
    return \`Hola, soy \${this.nombre}\`;
  }
}

const ana = new Persona('Ana', 28);
console.log(ana.saludar()); // 'Hola, soy Ana'
\`\`\`

- \`constructor\` es una función especial que se ejecuta al crear el objeto con \`new\`.
- \`this\` dentro de la clase se refiere al objeto que se está creando/usando.
- Cada método definido en la clase queda disponible en todas las instancias.

## ¿Qué es this?

\`this\` es una referencia al objeto "dueño" del código que se está ejecutando.
Dentro de un método de una instancia, \`this\` apunta a esa instancia:

\`\`\`js
const contador = {
  cuenta: 0,
  incrementar() {
    this.cuenta++; // this === contador
  },
};
contador.incrementar();
console.log(contador.cuenta); // 1
\`\`\``,

        base: `## Clases: constructor, métodos, this

\`\`\`js
class Contador {
  constructor() {
    this.cuenta = 0;
  }
  incrementar() {
    this.cuenta++;
  }
  obtenerCuenta() {
    return this.cuenta;
  }
}
\`\`\`

### El problema clásico: this pierde su contexto

\`\`\`js
const contador = new Contador();
const fn = contador.incrementar; // se "desconecta" del objeto
fn(); // TypeError o this === undefined en modo estricto — this ya NO es contador
\`\`\`

Esto pasa porque \`this\` se determina por **cómo se llama** la función, no por
dónde se definió. Cuando la separas del objeto (\`contador.incrementar\`) y la
llamas sola (\`fn()\`), pierde la referencia.

### Soluciones: bind, arrow functions

\`\`\`js
// bind: crea una nueva función con this "fijado" para siempre
const fnBoundeada = contador.incrementar.bind(contador);
fnBoundeada(); // ahora sí funciona

// Arrow functions NO tienen su propio this — usan el del scope exterior
class ContadorV2 {
  constructor() {
    this.cuenta = 0;
    // Esta arrow function "captura" el this de la clase para siempre
    this.incrementar = () => {
      this.cuenta++;
    };
  }
}
\`\`\`

Este último patrón es muy común en callbacks de eventos (React, addEventListener,
etc.) donde la función se pasa como referencia y se llama en otro contexto.`,

        advanced: `## Herencia con extends/super, y cómo funciona por dentro

### extends y super

\`\`\`js
class Animal {
  constructor(nombre) {
    this.nombre = nombre;
  }
  hacerSonido() {
    return \`\${this.nombre} hace un sonido\`;
  }
}

class Perro extends Animal {
  constructor(nombre, raza) {
    super(nombre); // llama al constructor de Animal — obligatorio antes de usar 'this'
    this.raza = raza;
  }
  hacerSonido() {
    return \`\${super.hacerSonido()} (Guau!)\`; // extiende el método del padre
  }
}

const rex = new Perro('Rex', 'Labrador');
rex.hacerSonido();      // 'Rex hace un sonido (Guau!)'
rex instanceof Animal;  // true — Perro hereda de Animal
\`\`\`

**Regla del lenguaje**: en un constructor que extiende otra clase, no puedes usar
\`this\` antes de llamar a \`super()\` — el objeto no está "listo" hasta que la
clase padre termina de inicializarlo.

### Las clases son "azúcar sintáctica" sobre prototypes

Por debajo, JavaScript no tiene clases "reales" como Java o C++ — usa
**prototype chains**. \`class\` es una forma más clara de escribir el mismo
mecanismo:

\`\`\`js
// Esto (con class)...
class Punto {
  constructor(x, y) { this.x = x; this.y = y; }
  distanciaAlOrigen() { return Math.sqrt(this.x ** 2 + this.y ** 2); }
}

// ...es equivalente a esto (con prototypes, la forma pre-ES6)
function PuntoViejo(x, y) {
  this.x = x;
  this.y = y;
}
PuntoViejo.prototype.distanciaAlOrigen = function() {
  return Math.sqrt(this.x ** 2 + this.y ** 2);
};
\`\`\`

Cuando llamas \`instancia.metodo()\` y el método no está directamente en el
objeto, JavaScript lo busca en su \`prototype\`, y si no está ahí, en el
\`prototype\` del prototype, y así sucesivamente (la "cadena de prototipos"),
hasta llegar a \`null\`.

### Las 4 reglas de this, en orden de prioridad

1. \`new Fn()\` → this es la instancia nueva.
2. \`fn.call(obj)\` / \`fn.apply(obj)\` / \`fn.bind(obj)\` → this es obj explícitamente.
3. \`obj.metodo()\` → this es obj (quien está "a la izquierda del punto").
4. Llamada suelta \`fn()\` → this es undefined (modo estricto) o el objeto global (modo no estricto).

Las arrow functions no siguen ninguna de estas reglas — no tienen su propio
\`this\`, siempre usan el del scope léxico donde fueron definidas.`,
      },
    },

    {
      id: 'lesson-9-code',
      type: 'code',
      estimatedMinutes: 7,
      variants: {
        simplified: {
          id: 'code-9-simplified',
          title: 'Tu primera clase',
          description: 'Completa la clase Persona con un método saludar.',
          code: `class Persona {
  constructor(nombre, edad) {
    this.nombre = nombre;
    this.edad = edad;
  }

  saludar() {
    // Devuelve: \`Hola, soy \${nombre} y tengo \${edad} años\`
  }
}

const ana = new Persona('Ana', 28);
console.log(ana.saludar());`,
          expectedOutput: 'Hola, soy Ana y tengo 28 años',
          hints: [
            'return `Hola, soy ${this.nombre} y tengo ${this.edad} años`;',
            'Dentro de un método, siempre accede a las propiedades con this.',
          ],
          solution: `class Persona {
  constructor(nombre, edad) {
    this.nombre = nombre;
    this.edad = edad;
  }

  saludar() {
    return \`Hola, soy \${this.nombre} y tengo \${this.edad} años\`;
  }
}

const ana = new Persona('Ana', 28);
console.log(ana.saludar());`,
        },
        base: {
          id: 'code-9-base',
          title: 'Arreglar el this perdido',
          description:
            'incrementarBoundeado pierde el this de contador al desconectarse. Usa bind para arreglarlo.',
          code: `class Contador {
  constructor() {
    this.cuenta = 0;
  }
  incrementar() {
    this.cuenta++;
  }
}

const contador = new Contador();

// Esta línea "desconecta" incrementar de contador — arréglala con .bind(contador)
const incrementarBoundeado = contador.incrementar;

incrementarBoundeado();
incrementarBoundeado();
incrementarBoundeado();
console.log(contador.cuenta);`,
          expectedOutput: '3',
          hints: [
            'const incrementarBoundeado = contador.incrementar.bind(contador);',
            'bind() crea una nueva función donde this siempre será el objeto que le pasas',
          ],
          solution: `class Contador {
  constructor() {
    this.cuenta = 0;
  }
  incrementar() {
    this.cuenta++;
  }
}

const contador = new Contador();
const incrementarBoundeado = contador.incrementar.bind(contador);

incrementarBoundeado();
incrementarBoundeado();
incrementarBoundeado();
console.log(contador.cuenta);`,
        },
        advanced: {
          id: 'code-9-advanced',
          title: 'Herencia con extends y super',
          description: 'Implementa Perro extendiendo Animal, sobreescribiendo hacerSonido.',
          code: `class Animal {
  constructor(nombre) {
    this.nombre = nombre;
  }
  hacerSonido() {
    return \`\${this.nombre} hace un sonido\`;
  }
}

class Perro extends Animal {
  constructor(nombre, raza) {
    // Llama al constructor del padre con super(), y guarda this.raza
  }
  hacerSonido() {
    // Devuelve el sonido del padre + " (Guau!)"
    // Pista: super.hacerSonido()
  }
}

const rex = new Perro('Rex', 'Labrador');
console.log(rex.hacerSonido());
console.log(rex instanceof Animal);
console.log(rex.raza);`,
          expectedOutput: 'Rex hace un sonido (Guau!)\ntrue\nLabrador',
          hints: [
            'constructor(nombre, raza) { super(nombre); this.raza = raza; }',
            'hacerSonido() { return `${super.hacerSonido()} (Guau!)`; }',
          ],
          solution: `class Animal {
  constructor(nombre) {
    this.nombre = nombre;
  }
  hacerSonido() {
    return \`\${this.nombre} hace un sonido\`;
  }
}

class Perro extends Animal {
  constructor(nombre, raza) {
    super(nombre);
    this.raza = raza;
  }
  hacerSonido() {
    return \`\${super.hacerSonido()} (Guau!)\`;
  }
}

const rex = new Perro('Rex', 'Labrador');
console.log(rex.hacerSonido());
console.log(rex instanceof Animal);
console.log(rex.raza);`,
        },
      },
    },

    {
      id: 'lesson-9-quiz',
      type: 'quiz',
      estimatedMinutes: 4,
      variants: {
        simplified: [
          {
            id: 'l9-q1-simple',
            question: '¿Qué palabra clave se usa para crear una instancia de una clase?',
            options: [
              'new',
              'create',
              'make',
              'instance',
            ],
            correctIndex: 0,
            explanation: 'new Persona(...) crea una instancia nueva, ejecutando el constructor de la clase.',
            commonMistakes: {
              1: 'create no es una palabra clave de JavaScript para instanciar clases.',
              2: 'make tampoco existe como sintaxis para esto en JavaScript.',
              3: 'instance no es una palabra clave — new es la sintaxis correcta y única.',
            },
          },
          {
            id: 'l9-q2-simple',
            question: 'Dentro de un método de clase, ¿a qué se refiere this?',
            options: [
              'A la clase en general, no a una instancia específica',
              'Siempre al objeto global (window)',
              'A la instancia particular sobre la que se llamó el método',
              'A la función misma',
            ],
            correctIndex: 2,
            explanation: 'this dentro de un método apunta a la instancia específica desde la que se llamó ese método (ana.saludar() → this es ana).',
            commonMistakes: {
              0: 'this es específico de cada instancia, no de la clase en general — dos instancias distintas tienen this distinto.',
              1: 'Dentro de un método de clase, this NO es el objeto global — apunta a la instancia.',
              3: 'this no se refiere a la función en sí, sino al objeto sobre el que se invocó.',
            },
          },
        ],
        base: [
          {
            id: 'l9-q1-base',
            question: '¿Por qué `const fn = contador.incrementar; fn();` no actualiza contador.cuenta?',
            options: [
              'Porque incrementar tiene un error de sintaxis',
              'Porque al separar el método del objeto, this deja de apuntar a contador',
              'Porque fn() nunca se ejecuta realmente',
              'Porque contador es constante y no se puede modificar',
            ],
            correctIndex: 1,
            explanation: 'this se determina por CÓMO se llama la función, no por dónde se definió. contador.incrementar() tiene this=contador, pero fn() (llamada suelta) no.',
            commonMistakes: {
              0: 'El código es sintácticamente correcto — el problema es de contexto de ejecución (this), no de sintaxis.',
              2: 'fn() sí se ejecuta — el problema es que dentro de esa ejecución, this ya no es contador.',
              3: 'contador es la variable que contiene el objeto (const solo impide reasignar esa variable) — sus propiedades internas (como cuenta) siguen siendo mutables.',
            },
          },
          {
            id: 'l9-q2-base',
            question: '¿Qué hace `.bind(contador)` sobre una función?',
            options: [
              'Ejecuta la función inmediatamente con ese contexto',
              'Solo funciona con arrow functions',
              'Modifica la función original permanentemente',
              'Devuelve una NUEVA función donde this siempre será contador, sin importar cómo se la llame después',
            ],
            correctIndex: 3,
            explanation: 'bind() no ejecuta nada — devuelve una función nueva (no modifica la original) con this fijado para siempre al valor que le pasaste.',
            commonMistakes: {
              0: 'bind() no ejecuta la función — solo la prepara. Para ejecutar inmediatamente con un this específico se usa call() o apply().',
              1: 'bind() funciona con funciones normales — de hecho no tiene sentido usarlo con arrow functions, porque estas no tienen this propio para fijar.',
              2: 'bind() no muta la función original — crea y devuelve una función nueva, distinta.',
            },
          },
        ],
        advanced: [
          {
            id: 'l9-q1-advanced',
            question: '¿Por qué en un constructor que usa `extends`, hay que llamar `super()` antes de usar `this`?',
            options: [
              'Porque el objeto no está inicializado hasta que el constructor de la clase padre termina de correr',
              'Es solo una convención de estilo recomendada, no obligatoria',
              'Porque super() borra cualquier this previo',
              'this no existe en absoluto en clases con extends',
            ],
            correctIndex: 0,
            explanation:
              'Cuando una clase extiende otra, el objeto se termina de construir en dos pasos: primero el constructor padre (via super()) inicializa la parte "heredada", y solo después el objeto está listo para que el constructor hijo use this. Usar this antes de super() es un ReferenceError.',
            commonMistakes: {
              1: 'No es una convención — es una regla del lenguaje. Usar this antes de super() lanza un ReferenceError en tiempo de ejecución.',
              2: 'super() no "borra" nada — inicializa la parte del objeto correspondiente a la clase padre.',
              3: 'this sí existe, pero no está disponible/inicializado hasta después de que se ejecuta super().',
            },
          },
          {
            id: 'l9-q2-advanced',
            question: '¿Qué son realmente las clases de JavaScript "por debajo"?',
            options: [
              'Azúcar sintáctica sobre el sistema de prototypes que JavaScript ya tenía',
              'Un tipo de dato completamente nuevo, sin relación con el resto del lenguaje',
              'Una implementación idéntica a las clases de Java',
              'Objetos especiales que no se pueden instanciar más de una vez',
            ],
            correctIndex: 0,
            explanation:
              'class es una forma más clara y familiar de escribir el mismo mecanismo de herencia prototípica que JavaScript siempre tuvo (function + prototype). No introduce un paradigma nuevo, solo mejora la sintaxis.',
            commonMistakes: {
              1: 'Las clases usan el mismo sistema de prototypes por debajo — no es un mecanismo aislado o nuevo.',
              2: 'Aunque la sintaxis se parece a la de Java, el mecanismo interno (prototypes, objetos dinámicos) es fundamentalmente distinto al de Java (clases estáticas compiladas).',
              3: 'Se pueden crear tantas instancias como se quiera con new — no hay ninguna restricción de unicidad por defecto.',
            },
          },
        ],
      },
    },
  ],
};
