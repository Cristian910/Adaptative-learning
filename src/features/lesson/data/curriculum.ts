import type { LessonContent, CourseTrack } from '../../../types/domain';
import { lesson1 } from './lesson-1';
import { lesson2 } from './lesson-2';
import { lesson3 } from './lesson-3';
import { lesson4 } from './lesson-4';
import { lesson5 } from './lesson-5';
import { lesson6 } from './lesson-6';
import { lesson7 } from './lesson-7';
import { lesson8 } from './lesson-8';
import { lesson9 } from './lesson-9';
import { lesson10 } from './lesson-10';
import { tsLesson1 } from './ts-lesson-1';
import { tsLesson2 } from './ts-lesson-2';
import { tsLesson3 } from './ts-lesson-3';
import { tsLesson4 } from './ts-lesson-4';
import { tsLesson5 } from './ts-lesson-5';

// ─── Curriculum ────────────────────────────────────────────────────────────────
// ÚNICA fuente de verdad para el orden pedagógico de cada curso (track). Antes
// este mismo array vivía duplicado en LessonPage.tsx y en
// curriculum-integrity.test.ts, y el store ni siquiera lo referenciaba — eso
// causó un bug real (un usuario nuevo arrancaba en la 3ª lección, no en la
// 1ª). Todos los consumidores ahora importan de aquí, así que no pueden
// volver a desincronizarse.
//
// El orden de este array es el orden pedagógico real del curso — NO coincide
// con el número en el nombre de archivo/id de cada lección, que se mantuvo
// estable desde versiones anteriores para no romper referencias existentes.
// Secciones: Principiante → Intermedio → Avanzado.
export const JS_LESSONS: LessonContent[] = [
  lesson5, // 1. Variables, Tipos de Datos y Operadores
  lesson6, // 2. Estructuras de Control
  lesson1, // 3. Funciones y Scope
  lesson7, // 4. Arrays y Objetos: Fundamentos
  lesson2, // 5. Closures
  lesson4, // 6. Métodos de Arrays
  lesson8, // 7. Destructuring, Spread/Rest y Template Literals
  lesson3, // 8. Promises y async/await
  lesson9, // 9. This, Prototipos y Clases
  lesson10, // 10. Manejo de Errores y Patrones Asíncronos Avanzados
];

// Track de TypeScript: 5 lecciones, pensadas para alguien que YA sabe
// JavaScript (no repite fundamentos de JS) y se enfoca en cómo el sistema de
// tipos cambia la forma de escribir y de pensar el código. Reutiliza el
// mismo motor de adaptación, el mismo runner de código (ver runJs.ts, que
// strippea los tipos con sucrase antes de ejecutar) y el mismo sistema de
// quiz/badges/progreso que el track de JS — es la prueba de que el engine es
// una plataforma genérica, no lógica pegada al contenido de JavaScript.
export const TS_LESSONS: LessonContent[] = [
  tsLesson1, // 1. Tipos básicos y anotaciones
  tsLesson2, // 2. Interfaces, Type Aliases y Objetos
  tsLesson3, // 3. Funciones tipadas y Generics
  tsLesson4, // 4. Unions, Narrowing y Enums
  tsLesson5, // 5. Utility Types y buenas prácticas
];

// Mantenido por compatibilidad hacia atrás: código y tests preexistentes que
// asumían "el curso" == JavaScript siguen funcionando igual sin cambios.
export const ALL_LESSONS: LessonContent[] = JS_LESSONS;

export function getLessonsForTrack(track: CourseTrack): LessonContent[] {
  return track === 'typescript' ? TS_LESSONS : JS_LESSONS;
}

// El id de la primera lección pedagógica del track de JS — usado como valor
// por defecto del perfil de un usuario nuevo (arranca en JS por defecto
// hasta que elija explícitamente un track/nivel en el onboarding).
export const FIRST_LESSON_ID = JS_LESSONS[0].id;
