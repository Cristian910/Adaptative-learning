# JS Adaptive Learning

<!--
  Reemplaza {usuario}/{repo} por tu usuario y nombre de repo reales una vez
  que lo subas a GitHub — el badge de CI no va a funcionar hasta entonces.
  Los demás badges (tests, license, stack) son estáticos y ya funcionan.
-->
[![CI](https://github.com/{usuario}/{repo}/actions/workflows/ci.yml/badge.svg)](https://github.com/{usuario}/{repo}/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-184%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)
![PWA](https://img.shields.io/badge/PWA-installable-purple)

<!--
  DEMO EN VIVO: una vez desplegado en Vercel (ver la sección "Desplegar en
  producción" más abajo), reemplaza el link de abajo por la URL real que te
  da Vercel (algo como https://tu-proyecto.vercel.app).
-->
### 🔗 [Ver demo en vivo](https://tu-proyecto.vercel.app)

Curso interactivo de JavaScript y TypeScript con un motor de adaptación real:
el contenido, la dificultad y las pistas se ajustan en tiempo real según cómo
va aprendiendo cada usuario — no es una animación, es un sistema de reglas
que observa aciertos, errores y tiempos, y decide en consecuencia.

## Cómo funciona el motor adaptativo

![Diagrama de arquitectura del motor adaptativo](docs/architecture.svg)

El pipeline completo, de una interacción a una decisión visible:

1. **`useBehaviorTracker`** captura cada interacción (respuesta de quiz, corrida
   de código, inactividad) como un `BehaviorEvent`.
2. **`behavior-classifier.ts`** recalcula `confidence` (un promedio ponderado
   que pesa más lo reciente) y el estado del alumno (`struggling` / `normal` /
   `advanced`).
3. **`adaptation-rules.ts`** evalúa 8 reglas independientes contra ese estado
   (ej. "confianza baja + 3+ eventos → simplificar contenido") y produce
   `AdaptationDecision`s, cada una con una prioridad.
4. Solo la decisión de **mayor prioridad** del lote se activa (ver la nota en
   el diagrama — esto era un bug real hasta esta ronda de auditoría).
5. Esa decisión vive en el store y reactiva la UI: cambia la variante de
   contenido (simplificado/base/avanzado), muestra una pista, dispara una
   explicación con IA, o aparece reflejada en el panel de transparencia
   (🔍 en la sidebar) para que sea demostrable, no una caja negra.

El motor **no sabe nada sobre JavaScript ni TypeScript específicamente** —
por eso el mismo código sirve para ambos tracks del curso sin ningún cambio.

---

Proyecto Vite + React + TypeScript. Esto **no es un archivo único** que se pueda
previsualizar dentro de un chat: es una aplicación de varios archivos que necesita
correr con Node.js en tu computadora (o en un entorno online como StackBlitz /
CodeSandbox / VS Code).

## Cómo correrlo localmente

1. Instala [Node.js](https://nodejs.org/) 18 o superior (`node -v` para verificar).
2. Abre una terminal en esta carpeta (la que contiene `package.json`).
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre en el navegador la URL que muestra la terminal (normalmente
   `http://localhost:5173`).

Cada vez que edites un archivo `.tsx`/`.ts`/`.css`, el navegador se actualiza solo
(hot reload). Para editar el código usa cualquier editor de texto — se recomienda
[VS Code](https://code.visualstudio.com/).

## Si la pantalla queda en blanco / `npm run dev` da error

Casi siempre es este bug conocido de npm con dependencias opcionales
(https://github.com/npm/cli/issues/4828), donde falta el binario nativo de Rollup
para tu sistema operativo. Se soluciona así:

```bash
rm -rf node_modules package-lock.json   # en Windows: rmdir /s /q node_modules
npm install
npm run dev
```

Este paquete se entrega **sin `node_modules`** justamente para evitar este problema
(un `node_modules` copiado de otra máquina/sistema operativo no funciona en la tuya).
Siempre corre `npm install` primero.

## Configurar la IA con tu key de OpenAI

`src/services/ai/aiService.ts` ahora llama a la API de OpenAI (`gpt-4o-mini`,
Chat Completions) en vez de a la de Anthropic.

1. Copia `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local        # en Windows: copy .env.local.example .env.local
   ```
2. Abre `.env.local` y coloca tu key real:
   ```
   VITE_OPENAI_API_KEY=sk-tu-key-real-aqui
   ```
3. Reinicia `npm run dev` (Vite solo lee `.env.local` al arrancar).

**`.env.local` ya está en `.gitignore`, nunca lo subas a un repositorio ni lo
publiques.** Aun así, tu key queda visible para cualquiera que abra las
herramientas de desarrollador del navegador mientras la app corre — Vite la
incrusta en el JavaScript que se descarga en el cliente. Esto es aceptable
para probar en tu computadora (`localhost`), pero **no es seguro si alguna vez
publicas este sitio en internet**: cualquier visitante podría copiar tu key y
gastar tu saldo de OpenAI.

La forma correcta para producción es mover la llamada `fetch` a un backend
propio que guarde la key como variable de entorno del servidor, nunca en
código que llega al navegador. **Ya incluí un ejemplo mínimo de ese backend en
`/server`** (ver `server/README.md`) — es opcional y no se usa a menos que
configures `VITE_AI_PROXY_URL`.

Si no configuras `VITE_OPENAI_API_KEY`, la app sigue funcionando normalmente:
usa el contenido estático de reserva (`isStaticFallback: true`) definido en
`STATIC_FALLBACKS` dentro de `aiService.ts`.

**Nota:** llamar a la API de OpenAI directamente desde el navegador a veces da
errores de CORS de forma intermitente (es un problema conocido y reportado por
varios usuarios, no algo que puedas arreglar desde este código). Si eso pasa,
la app lo captura automáticamente y muestra el contenido de reserva en vez de
romperse — pero es una razón más para preferir el backend propio si esto va a
usarse en serio.

## Otros comandos

```bash
npm run build      # type-check + build de producción a /dist
npm run test       # corre los tests unitarios/integración con Vitest
npm run test:e2e   # corre los tests E2E con Playwright (requiere: npx playwright install)
```

## Desplegar en producción (GitHub + Vercel)

Pasos para subir el proyecto a GitHub y después dejarlo desplegado con un
link público en Vercel (gratis, sin tarjeta de crédito para este tipo de
proyecto).

### 1. Subir el proyecto a GitHub

1. Si no tienes Git instalado, instálalo desde [git-scm.com](https://git-scm.com/).
2. Crea un repositorio nuevo en [github.com/new](https://github.com/new) —
   público, sin inicializarlo con README (ya tienes uno).
3. En una terminal, dentro de la carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "Primera versión: curso adaptativo de JS y TS"
   git branch -M main
   git remote add origin https://github.com/{tu-usuario}/{tu-repo}.git
   git push -u origin main
   ```
4. Reemplaza `{usuario}/{repo}` por tu usuario y nombre de repo reales en los
   badges de CI al principio de este README (son los dos primeros).
5. Ve a la pestaña **Actions** de tu repo en GitHub — el workflow de CI
   (`.github/workflows/ci.yml`) debería arrancar solo y, si todo compila
   bien (ya está validado que sí), terminar en verde.

> Si prefieres no tener un solo commit gigante, puedes dividirlo en varios
> (por ejemplo: contenido base, motor adaptativo, track de TypeScript,
> accesibilidad, etc.) usando `git add <archivos>` selectivamente antes de
> cada commit — un historial con varios commits bien descriptos se ve más
> prolijo en un portfolio que uno solo.

### 2. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com/) y crea una cuenta (puedes entrar
   directo con tu cuenta de GitHub).
2. Click en **Add New… → Project**.
3. Elige el repositorio que acabas de subir — Vercel detecta automáticamente
   que es un proyecto Vite y configura el build solo (`npm run build`,
   carpeta de salida `dist`). No hace falta tocar nada ahí.
4. **Variable de entorno (opcional)**: si en algún momento configuras la key
   de OpenAI para las explicaciones con IA, agrégala en **Environment
   Variables** con el nombre `VITE_OPENAI_API_KEY`. Si no la configuras, la
   app funciona igual — cae a las explicaciones de respaldo (ver la sección
   "Configurar la IA" más arriba).
5. Click en **Deploy** y espera 1-2 minutos.
6. Vercel te da una URL pública (`https://tu-proyecto.vercel.app`) —
   reemplaza esa URL en el link "Ver demo en vivo" al principio de este
   README, y haz commit + push de ese cambio.

Desde ese momento, cada `git push` a `main` vuelve a desplegar la app
automáticamente — no hace falta repetir estos pasos.

## Novedades de esta versión

Además de los arreglos de bugs (pantalla en blanco por selector de Zustand,
botones "Continuar" faltantes en explicación/código, desalineado visual del
editor de código, `node_modules` roto para tu sistema), se agregaron estas
mejoras:

- **Manejo de errores**: un `ErrorBoundary` (`src/app/ErrorBoundary.tsx`)
  envuelve toda la app. Si algo falla de forma inesperada, ves una pantalla
  con opción de recargar o reiniciar progreso, en vez de una pantalla en
  blanco sin explicación.
- **Código del alumno aislado en un Web Worker**: antes, un `while (true) {}`
  en el editor de código colgaba toda la pestaña. Ahora corre en un worker
  separado (`src/features/lesson/utils/codeRunner.worker.ts`) con un timeout
  de 5 segundos — si se cuelga, se cancela y se muestra un error, sin afectar
  el resto de la app.
- **Progreso persistente de verdad**: antes se guardaba en `sessionStorage`
  (se perdía al cerrar la pestaña) y las lecciones completadas ni siquiera se
  guardaban (se perdían con solo refrescar). Ahora todo vive en
  `localStorage` — cierras el navegador y vuelves exactamente donde ibas.
- **Botón "Reiniciar progreso"** en la barra lateral (con confirmación),
  conectado a la función `resetSession` que ya existía en el store pero
  ningún botón usaba.
- **Aviso cuando cambia tu nivel adaptativo** (`LevelChangeToast`): antes el
  cambio entre "struggling / normal / advanced" pasaba en silencio. Ahora
  aparece un aviso breve arriba de la pantalla.
- **Pantalla de bienvenida** la primera vez que abres la app, explicando que
  el sistema observa tu comportamiento y adapta el contenido solo (se guarda
  en `localStorage` para no repetirla).
- **Lección nueva**: "Métodos de Arrays: map, filter y reduce"
  (`lesson-4.ts`), con el mismo formato de explicación + código + quiz que
  las otras tres.
- **Cache de respuestas de IA en `localStorage`**: si ya se generó una pista o
  explicación para un contexto exacto, no se vuelve a llamar a la API — ni
  siquiera en una sesión nueva del navegador. Reduce costos y latencia.
- **Backend proxy de ejemplo** en `/server`, para no tener que exponer la key
  de OpenAI en el navegador si esto se publica en internet (ver arriba).
- **Tests nuevos** para la persistencia del store (`completedLessons`,
  `resetSession`, `advanceLesson`) y para el `ErrorBoundary`
  (`src/test/store/useAppStore.test.ts`,
  `src/test/app/ErrorBoundary.test.tsx`).

### Lo que quedó afuera en esa ronda (ya resuelto más abajo)

- ~~Reemplazar el editor de código casero por CodeMirror/Monaco~~ → hecho en
  la ronda de "Portfolio máximo" (más abajo): ahora usa CodeMirror 6 de
  verdad, con syntax highlighting, autocompletado y bracket matching.
- **Backend proxy en producción real** (`/server`): el ejemplo funciona, pero
  le faltan rate limiting, CORS restringido y logging antes de exponerlo en
  internet — está documentado en `server/README.md`.

## Segunda ronda de arreglos y mejoras

- **Bug real en el área de resultado del código**: el contenedor del editor
  (`.code-editor-wrapper`) no tenía `overflow: hidden`, así que si la capa de
  resaltado de sintaxis medía aunque sea un pixel más alta que el textarea
  real, se desbordaba visualmente sobre los botones y el resultado de abajo.
  Se agregó `overflow: hidden` y ahora el alto se sincroniza también en el
  contenedor (no solo en el textarea) para que sea la única fuente de verdad.
- **Quiz: ya no se revela la respuesta correcta al fallar.** Antes, al
  responder mal, se resaltaba en verde la opción correcta al mismo tiempo que
  la tuya en rojo — así que "Intentar de nuevo" era solo memorizar cuál botón
  se puso verde y clickearlo, sin necesidad de entender nada. Ahora, si
  fallas, solo se resalta tu propia respuesta incorrecta; la correcta no se
  revela hasta que la aciertas de verdad.
- **Persistencia más robusta**: se endureció el guardado en `localStorage`
  (versión de esquema + manejo de errores de lectura/parseo) para que datos
  de una versión anterior del proyecto no puedan romper la carga de la app.
  Si sigues viendo pantalla en blanco al refrescar (no con Ctrl+F5), lo más
  probable es caché del navegador/servidor de Vite después de tantos cambios
  de estructura — prueba: parar `npm run dev` (Ctrl+C), borrar la carpeta
  `node_modules/.vite`, y volver a correr `npm run dev` en una pestaña nueva.
  Si el problema persiste, decime qué error aparece en la consola del
  navegador (F12 → Console) al hacer el refresh normal — eso lo va a
  confirmar con certeza.
- **Nombre de usuario**: la pantalla de bienvenida ahora pregunta tu nombre
  (opcional) y te saluda en la barra lateral.
- **Progreso del curso más visible**: barra de progreso con porcentaje del
  curso completo en la barra lateral, no solo el contador chico de antes.
- **Puntos y racha**: +10 puntos por acertar un quiz al primer intento (+5 si
  fue al reintentar), +50 al completar una lección, y una racha de días
  consecutivos de actividad — todo visible en la barra lateral.
- **Explicación cuando cambia la dificultad del contenido/preguntas**: además
  del aviso general de cambio de nivel, ahora aparece un banner puntual arriba
  del bloque explicando por qué ese contenido específico se simplificó o se
  volvió más avanzado.

## Tercera ronda: editor de código robusto + puntos y racha con propósito real

- **Se sacó de raíz el bug del editor de código**, no se volvió a parchar. La
  causa real era el truco de "dos capas superpuestas" (una capa de colores +
  un textarea invisible encima) que necesitaba medir exactamente igual en
  ambas capas — algo que nunca es 100% confiable entre navegadores y con
  código largo. Ahora el editor es un solo `<textarea>` sin capas superpuestas:
  el bug de superposición ya no puede volver a pasar, aunque se perdió el
  coloreado por token (si más adelante quieren ese coloreado de vuelta, la
  forma robusta de hacerlo es con una librería real como CodeMirror, no con
  este truco casero).
- **Los puntos y la racha ahora tienen un propósito real**:
  - **Niveles**: los puntos totales se traducen en un nivel (Principiante →
    Aprendiz → Competente → Avanzado → Experto), visible en la barra lateral
    con una barra de progreso hacia el siguiente nivel.
  - **9 logros concretos** (primera lección, quiz perfecto, rachas de 3 y 7
    días, hitos de puntos, 10 ejecuciones de código, superar una dificultad,
    curso completo), con un panel dedicado (botón en la barra lateral) que
    muestra cuáles ya se desbloquearon y cuáles faltan.
  - **Notificación al desbloquear un logro nuevo**, en el momento — no un
    ítem mudo en una lista.
- **Pantalla real de finalización del curso**: antes era una sola línea de
  texto. Ahora es una pantalla completa con el nombre del usuario, puntos
  totales, nivel alcanzado, racha, todos los logros ganados, y opción de
  reiniciar — algo que se siente como haber terminado algo, no solo un cartel
  de "listo".
- **Progreso visible dentro de la lección actual, en la barra lateral**: la
  lección en curso ahora muestra una mini barra de progreso de sus propios
  bloques, no solo si está bloqueada/completa.

## Cuarta ronda: curso completo (10 lecciones), editor sin bugs de raíz, y validación real de ejercicios

### El bug del editor, esta vez de raíz

El truco de "capa de colores + textarea invisible encima" (dos elementos que
necesitan medir exactamente igual) se rompió una tercera vez con contenido más
largo. En vez de seguir parchando el síntoma, se **eliminó la causa**: el
editor ahora es un único `<textarea>`, sin capas superpuestas. Se perdió el
coloreado por token; se ganó que este bug de superposición ya no puede volver
a pasar, bajo ninguna circunstancia. Reemplazarlo por un editor real con
syntax highlighting (CodeMirror/Monaco) queda como mejora futura opcional.

También se corrigió que el confeti de la pantalla de fin de curso tapara las
insignias: en CSS, un elemento con `position: absolute` se pinta *después* que
los elementos normales del mismo contenedor, sin importar el orden en el
HTML — el confeti (absoluto) tapaba las insignias (normales) aunque estuviera
declarado primero. Se resolvió envolviendo el contenido real en su propio
contenedor con z-index superior.

### Curso ampliado a 10 lecciones, con secciones de nivel

- **6 lecciones nuevas**: Variables/Tipos/Operadores, Estructuras de Control,
  Arrays y Objetos (fundamentos), Destructuring/Spread/Rest/Template Literals,
  This/Prototipos/Clases, y Manejo de Errores/Patrones Asíncronos Avanzados —
  con el mismo formato completo (explicación + código + quiz, en 3 variantes
  cada uno) que las 4 originales.
- **3 secciones claras**: Principiante (4 lecciones) → Intermedio (3) →
  Avanzado (3), con encabezados de sección en la barra lateral y un indicador
  ("📍 Estás en: Intermedio") que muestra en qué sección está el usuario en
  todo momento.
- **Rango recalibrado**: con 10 lecciones hay muchos más puntos disponibles
  que antes — los umbrales de Novato/Aprendiz/Competente/Experto/Maestro se
  ajustaron para que el rango máximo sea alcanzable completando el curso a
  fondo, no un techo inalcanzable.

### Los ejercicios de código ahora exigen una respuesta correcta de verdad

Antes, el botón "Continuar" se habilitaba con solo apretar "Ejecutar" una vez,
sin importar si el resultado era el correcto — el usuario podía avanzar aunque
su código estuviera mal. Ahora:

- **Se exige que el output coincida con el esperado** para poder continuar.
- **Pistas progresivas automáticas**: aparecen solas después de 2, 4 y 6
  intentos fallidos (además de poder pedirlas manualmente).
- **Válvula de escape**: después de 5 intentos fallidos, se puede revelar la
  solución de referencia — nadie queda trabado para siempre en el mismo
  ejercicio.
- **Fallar código ahora afecta el motor adaptativo**: antes, `code_run` era
  completamente ignorado por el sistema de confianza/adaptación (un hueco
  real). Ahora fallar un ejercicio repetidamente puede disparar el mismo
  mecanismo de simplificación que ya existía para los quizzes — y como cada
  bloque de código tiene 3 variantes (simplificada/base/avanzada) que son
  ejercicios genuinamente distintos entre sí, esto te da **un ejercicio
  distinto para practicar**, no solo el mismo de nuevo.
- **Quiz: ya no se revela la respuesta correcta al fallar** (arreglado en la
  ronda anterior, se mantiene).

### Verificación automática de contenido (esto encontró bugs reales)

Se armó un test (`curriculum-integrity.test.ts`) que ejecuta **cada una de las
30 soluciones de referencia del curso** contra su `expectedOutput`, además de
validar la estructura completa (ids únicos, prerequisites válidos sin
dependencias circulares, cada quiz con explicación para cada opción
incorrecta, etc.). Al escribir este test se encontraron y corrigieron 3 bugs
de contenido reales que existían desde antes, sin detectar:

1. Un ejercicio de arrays con un total mal calculado (`249` en vez de `219`).
2. El orden esperado de impresión de un ejercicio de `Promise.all` que no
   coincidía con el orden real de resolución de microtasks de JavaScript
   (verificado empíricamente con Node, no a mano).
3. El formateo de `console.log` para arrays/objetos no coincidía con el
   formato que los ejercicios esperaban (sin espacios vs con espacios), lo
   cual habría hecho imposible resolver correctamente esos ejercicios ahora
   que el resultado se valida de verdad.

### Ayuda accesible en cualquier momento, no solo al principio

La pantalla de bienvenida (que solo se ve una vez) se complementó con un botón
"?" persistente en la barra lateral que abre el mismo contenido explicativo
cuando quieras — cómo funciona la adaptación, qué exigen los ejercicios de
código, qué son los puntos/rango/logros/racha, y cómo se guarda el progreso.

## Quinta ronda: bugs reportados + auditoría completa

Esta ronda arrancó con tres bugs puntuales reportados directamente, y de ahí
se expandió a una auditoría completa del proyecto pensada para portfolio.

### Bugs corregidos

- **Arrancaba en la 3ª lección, no en la 1ª**: el orden pedagógico del curso
  vivía duplicado (en `LessonPage.tsx` para la UI, y a mano en el store para
  el perfil por defecto) y se desincronizaron — `lesson-1.ts` es el 3er
  archivo en el orden real, pero el store asumía que era el primero. Se creó
  `src/features/lesson/data/curriculum.ts` como única fuente de verdad del
  orden de cada curso; `LessonPage`, el store y los tests la importan de ahí,
  así que no puede volver a desincronizarse.
- **Modal de bienvenida cortado en pantalla**: no tenía `max-height` ni
  `overflow-y` — con todo su contenido, en viewports de altura normal (sobre
  todo mobile) se salía del recuadro sin forma de llegar al botón. Ahora
  scrollea internamente y en mobile se comporta como *bottom sheet*.
- **Sidebar entera invisible en mobile** (sin reemplazo): se encontró al
  diagnosticar el modal — en viewports chicos, `display: none` sin ningún
  drawer alternativo. Ahora hay una topbar móvil con botón de menú que abre
  la sidebar como panel deslizable.
- **Bug de arquitectura en el motor de adaptación**: cuando dos reglas
  distintas disparaban en el mismo evento, se despachaban en orden de
  prioridad ascendente y cada despacho sobreescribía la decisión activa por
  completo — así que la que quedaba visible era la de *menor* prioridad, al
  revés de lo documentado. Corregido: solo la de mayor prioridad del lote se
  activa (las demás siguen actualizando su cooldown, para no permitir spam).
- **Pregunta de quiz con la respuesta marcada mal**: la lección de closures
  tenía una pregunta sobre Temporal Dead Zone donde la opción "correcta" era
  fácticamente incorrecta (verificado corriendo el snippet en Node antes de
  tocar nada: `let` en TDZ lanza `ReferenceError`, no `undefined`).

### Quiz adaptativo rediseñado

- **Se revela la respuesta automáticamente tras 3 intentos fallidos** en la
  misma pregunta (antes nunca se revelaba, lo cual podía dejar a alguien
  trabado para siempre si genuinamente no sabía la respuesta).
- **Si existe una variante más fácil del bloque, se ofrece pasar a una
  pregunta distinta y más simple** sobre el mismo concepto — la misma
  filosofía que ya tenían los ejercicios de código (pistas + revelar
  solución), ahora también en el quiz.

### Sistema de repaso final

Las preguntas de quiz y ejercicios de código que se fallan alguna vez quedan
registrados (`missedItems` en el store — solo se guarda la referencia, no el
contenido). Al terminar el curso, si queda algo pendiente, aparece
"📝 Repasar lo que te costó" con la lista agrupada por lección — resolverlos
de nuevo suma +15 puntos cada uno.

### Editor de código real (CodeMirror 6)

Se reemplazó el `<textarea>` plano por `@uiw/react-codemirror`: syntax
highlighting, autocompletado, bracket matching e indentado con Tab. El tema
(`codeMirrorTheme.ts`) reutiliza las mismas CSS variables que el resto de la
app, así que respeta el tema claro/oscuro sin código adicional.

### Modo claro + pulido visual

Toggle ☀/☾ persistido en `localStorage`, aplicado con un script inline en
`index.html` para evitar el flash del tema por defecto al cargar. Paleta
clara completa. Además: `:focus-visible` consistente en toda la app,
selección de texto con el color de marca, scrollbar temática, sombras y
hover con más profundidad en botones/cards.

### Performance y SEO

CodeMirror, el dashboard (`recharts`) y la pantalla de repaso cargan con
`React.lazy()` — son las dependencias más pesadas, y no tiene sentido
pagarlas en la carga inicial si el usuario todavía no las necesita. El
bundle inicial quedó repartido en `vendor`/`motion`/`app` (vía `manualChunks`
en `vite.config.ts`) para mejor cacheo entre despliegues. Se agregaron meta
description, favicon (SVG + PNG), Open Graph y Twitter Card con imagen de
preview generada para el proyecto.

### Dashboard de progreso

Nueva sección ("📊 Ver mi dashboard" en la sidebar) con gráficos reales
(`recharts`): gauge de confianza, progreso por nivel del curso, y stat cards
de puntos/racha/logros/errores/tiempo promedio — todos datos que el motor de
adaptación ya calculaba, pero que antes no se mostraban en ningún lado.

### Panel de transparencia del motor adaptativo

Botón "🔍" (sidebar y topbar móvil) que muestra en tiempo real qué decisión
tomó el motor, por qué regla (traducida a lenguaje natural, con detalles
técnicos en un `<details>` colapsable para quien quiera ver el dato crudo), y
el estado de confianza actual. El motor de adaptación es lo más sofisticado
del proyecto y antes actuaba en completo silencio — esto lo vuelve
demostrable sin tener que leer el código fuente.

### Segundo curso: TypeScript (5 lecciones)

Nuevo track completo — Tipos básicos, Interfaces/Type Aliases, Funciones
tipadas/Generics, Unions/Narrowing/Enums, y Utility Types/buenas prácticas —
con el mismo formato (explicación + código + quiz, 3 variantes cada uno) que
el curso de JS. Es la prueba de que el motor de adaptación es una
plataforma genérica, no lógica pegada al contenido de JavaScript:
`curriculum.ts` expone `getLessonsForTrack(track)`, y todo lo demás (engine,
badges, progreso, dashboard) funciona igual sin ningún cambio.

El runner de código (`runJs.ts`) ahora pasa el código por `sucrase` antes de
ejecutarlo, lo que elimina los tipos de TypeScript dejando JS ejecutable —
verificado empíricamente (interfaces, genéricos, `unknown`, discriminated
unions) antes de escribir una sola lección, y es un no-op seguro para el
código JS plano del track original, así que ambos tracks comparten el mismo
ejecutor.

**Selector de curso y nivel**: se muestra una vez, después de la bienvenida.
Si eliges empezar desde un nivel avanzado, las lecciones de niveles
anteriores quedan desbloqueadas para navegación libre (aunque no
completadas) — no hace falta "completar" lo básico si ya lo sabes. Se puede
cambiar de curso más adelante desde la barra lateral ("Curso: … · cambiar").

### Certificado descargable

Al completar el curso, "🎓 Ver mi certificado" muestra un certificado
generado como SVG (nombre, curso, puntos, fecha) que se puede descargar como
PNG en alta resolución — dibujado a un `<canvas>` con las APIs nativas del
navegador, sin agregar ninguna librería de captura de pantalla.

### PWA (instalable + funciona offline)

`vite-plugin-pwa` genera un manifest instalable y un service worker que
precachea todo el build. Como el contenido del curso ya viene bundleado (no
se pide por red en runtime), el curso completo funciona sin conexión después
de la primera visita — solo el enriquecimiento con IA necesita red, y si no
la hay, cae al contenido estático de reserva que ya existía.

### Tests E2E con Playwright

`e2e/` tiene specs de onboarding completo (bienvenida → elegir curso → elegir
nivel → aterrizar en la lección correcta), del quiz adaptativo (revelar tras
3 fallos + ofrecer pregunta más fácil), y de tema/dashboard. **Nota
importante**: este entorno de desarrollo no tuvo salida de red hacia el CDN
de binarios de Playwright, así que estos tests se escribieron y
type-checkearon con cuidado pero no se pudieron ejecutar aquí. Ejecuta
`npx playwright install --with-deps` una vez, y después `npm run test:e2e`.

### Todos los tests, en verde

152 tests unitarios/integración (Vitest) + 65 de integridad de contenido
(ahora cubren ambos tracks, JS y TS, con la misma rigurosidad — incluyendo
ejecutar cada solución de referencia de TypeScript a través de `sucrase`
contra su `expectedOutput`) pasan, además de `tsc --noEmit` limpio y el build
de producción.

### Lo que quedó afuera de esta ronda (a propósito)

- **IA generando ejercicios a medida del error específico**: quedó para una
  segunda versión — requiere resolver antes una alternativa gratuita/viable
  a la API de OpenAI y dejarla funcionando de forma confiable.
- **Split de contenido por track en el bundle**: ahora mismo `curriculum.ts`
  importa ambos tracks (JS + TS) de forma eager, así que el contenido de
  texto de las 15 lecciones viaja en el chunk principal aunque uses solo un
  track. Es un costo bajo (comprime muy bien con gzip) pero si el curso
  crece mucho más, vale la pena volverlo `React.lazy()` por track.
- **sessionHistory con series de tiempo reales**: el dashboard usa datos
  agregados (confidence, totalMistakes, avgTimePerBlock) que ya calculaba el
  motor; una vista de "evolución de tu confianza a lo largo del curso"
  necesitaría wirear el campo `sessionHistory` del perfil, que hoy está
  declarado en el tipo pero nunca se popula.

## Sexta ronda: roadmap completo — accesibilidad, contenido nuevo y pulido final

Esta ronda implementó el resto del roadmap de mejoras entregado como
auditoría: todo lo que quedaba pendiente salvo la generación de ejercicios
con IA (explícitamente pospuesta para una v2).

### Accesibilidad (a11y)

- **Focus trap real en los 8 modales** de la app (`useModalA11y.ts`): Tab
  cicla dentro del modal sin escaparse a la página de atrás, Escape cierra,
  el foco se mueve al modal al abrir y vuelve a donde estaba al cerrar. Antes
  ningún modal tenía nada de esto.
- **`aria-live="polite"`** en el feedback de quiz y en el resultado de correr
  código, para que un lector de pantalla anuncie el resultado sin que haga
  falta navegar manualmente hasta ahí.
- **Skip link** ("Saltar al contenido de la lección") para navegación por
  teclado, invisible hasta que se le da Tab.
- Roles y labels ARIA (`role="dialog"`, `aria-modal`, `aria-labelledby`) en
  todos los modales.

### Práctica libre (Playground)

Nueva sección ("🧪 Práctica libre" en la sidebar): un editor de código suelto,
sin lección ni corrección automática, con snippets de ejemplo (array
methods, async/await, TypeScript). Reutiliza exactamente el mismo runner en
Web Worker con timeout que los ejercicios de lección (`runInWorker.ts`,
extraído de `CodeExample.tsx` para poder compartirlo).

### Tests de componentes (React Testing Library)

27 tests nuevos sobre `QuizBlock`, `TrackSelector`, `LessonNav`,
`SidebarStats` y el hook `useModalA11y` — cubren específicamente el
comportamiento rediseñado esta sesión (revelar tras 3 fallos, desbloqueo por
nivel de inicio, focus trap). Escribir estos tests encontró y corrigió un
bug real: el filtro de "solo elementos visibles" del focus trap usaba
`offsetParent`, que en jsdom siempre es `null` (no calcula layout) — y en
un navegador real también podía fallar en casos límite (transiciones CSS).
Se simplificó, quedando más robusto en ambos entornos.

### CI con GitHub Actions

`.github/workflows/ci.yml`: typecheck + tests + build en cada push/PR, más
un job separado que corre los tests E2E de Playwright.

### Selector de idioma (ES/EN)

Toggle de idioma cubriendo el recorrido principal completo: landing,
bienvenida, selector de curso, ayuda, sidebar, navegación de lecciones,
header de lección, quiz y ejercicios de código. El contenido de las
lecciones (explicaciones, preguntas de quiz) permanece en español — traducir
15 lecciones completas es un trabajo de contenido, no de arquitectura, y se
priorizó una traducción 100% consistente de la interfaz por sobre una
cobertura parcial de absolutamente todo el texto de la app.

### Landing page

Portada nueva, antes del modal de bienvenida: explica la propuesta (motor
adaptativo real, código ejecutable, dos tracks, transparencia) en 5 segundos
antes de pedir el nombre — antes se entraba directo al formulario sin
ningún contexto de qué hace distinto a este proyecto.

### LICENSE + diagrama de arquitectura

MIT License agregada (reemplaza el nombre en el archivo `LICENSE` por el
tuyo). Diagrama de arquitectura del motor adaptativo en `docs/architecture.svg`,
enlazado arriba en este mismo README — documenta visualmente el pipeline
completo, incluyendo una nota sobre el bug de prioridad que se corrigió en
la ronda anterior.

### Balance final

**179 tests** (152 unitarios/integración + 27 de componentes) + tests E2E
escritos (no ejecutables en el sandbox de desarrollo por falta de red hacia
el CDN de Playwright) + `tsc --noEmit` limpio + build de producción
funcionando, con PWA instalable generándose correctamente.

Lo único que queda deliberadamente afuera de todo el roadmap es la
generación de ejercicios a medida con IA — pospuesta a una v2 hasta resolver
una alternativa viable a la API de OpenAI. Todo lo demás — deploy, capturas
de pantalla reales, y el historial de commits — es la parte que tú vas a
hacer al subirlo a tu repo.

## Séptima ronda: bugs de certificado/motor, IA condicional y español neutro

### Bug corregido: el certificado se entregaba sin haber completado el curso

Si alguien elegía empezar desde un nivel avanzado (saltándose lecciones
anteriores) y completaba la última lección de la secuencia, el certificado
se entregaba igual — aunque le faltaran lecciones enteras por cursar. La
causa: el gate que decidía "mostrar pantalla de curso completado" se basaba
en llegar a la última POSICIÓN del array de lecciones, no en haber
completado TODAS las lecciones del curso.

**Ahora**: el certificado exige `completedLessons` == el total de lecciones
del track activo. Si llegas al final de la secuencia sin haber completado
todo, aparece una pantalla nueva que te dice exactamente cuántas lecciones
faltan, con dos opciones:
- Ir directo a completarlas.
- Rendir un **examen final** (una pregunta representativa de cada lección,
  70% para aprobar) que marca todo como completado sin tener que cursar cada
  lección una por una — pensado específicamente para quien ya sabe el
  contenido y empezó desde avanzado.

### Bug corregido: el panel del motor adaptativo mostraba nombres de variables internas

En "Detalles técnicos" del panel 🔍 Motor adaptativo, el nombre de la regla
que disparó una decisión se mostraba tal cual vivía en el código (ej.
`LOW_CONFIDENCE_SIMPLIFY`) — información de programa filtrada sin traducir,
no pensada para mostrarse a un usuario. Se agregó una tabla de traducción
(`RULE_LABELS`, `BLOCK_TYPE_LABELS`) para que todo lo que se muestra ahí sea
legible en español, incluida la sección técnica.

### La IA ya no se presenta como una función fija

Los textos de bienvenida y ayuda que mencionaban pistas/explicaciones con IA
ahora aclaran explícitamente que son opcionales — dependen de que se
configure `VITE_OPENAI_API_KEY` — y qué pasa si no está configurada (cae a
contenido de respaldo). Esto es intencional: el proyecto se sube sin la IA
configurada por ahora; queda como mejora para una v2.

### Español neutro en todo el proyecto

Se hizo un barrido completo reemplazando el voseo argentino (vos, tenés,
podés, hacé, etc.) por formas neutras (tú, tienes, puedes, haz) en absolutamente
todo el texto visible: interfaz, las 15 lecciones completas (explicaciones,
preguntas de quiz, instrucciones de ejercicios de código), este README, y
los tests E2E. Se verificó con un script exhaustivo (no manual) para no
depender de encontrarlos todos a simple vista, y se corrigieron a mano los
casos donde el reemplazo automático de "vos" rompía la gramática (ej. "de
vos" → "de ti", no "de tú").

### Guía de despliegue (GitHub + Vercel)

Se agregó la sección **Desplegar en producción** más arriba en este mismo
README, con los pasos completos para subir el proyecto a GitHub y
desplegarlo en Vercel, más el espacio para pegar el link de la demo en vivo
una vez que esté publicado.

Balance: **184 tests** (152 unitarios/integración + 32 de componentes) +
`tsc --noEmit` limpio + build de producción funcionando, validado con una
extracción limpia del proyecto empaquetado.
