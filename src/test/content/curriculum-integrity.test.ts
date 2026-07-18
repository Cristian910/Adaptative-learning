import { describe, it, expect } from 'vitest';
import { executeJsCode } from '../../features/lesson/utils/runJs';
import { JS_LESSONS, TS_LESSONS } from '../../features/lesson/data/curriculum';
import type { CodeExample, LessonContent } from '../../types/domain';

// JS_LESSONS y TS_LESSONS vienen de curriculum.ts — el mismo módulo que usa
// LessonPage.tsx y el store. curriculum.ts es data pura (sin React/JSX), así
// que importarlo acá no acopla este test a React y, a la vez, hace
// imposible que este test y la app real terminen con órdenes de lección
// distintos.
//
// Ambos tracks (JS y TS) corren exactamente las mismas verificaciones —
// parametrizado sobre una lista de tracks en vez de duplicar el describe
// completo — para que el contenido nuevo (TypeScript) tenga el mismo nivel
// de rigor empírico que el original, incluyendo ejecutar de verdad cada
// solución de código (a través de sucrase, que le saca los tipos) contra su
// expectedOutput.

const VARIANT_KEYS = ['simplified', 'base', 'advanced'] as const;

const TRACKS: { name: string; lessons: LessonContent[] }[] = [
  { name: 'JavaScript', lessons: JS_LESSONS },
  { name: 'TypeScript', lessons: TS_LESSONS },
];

for (const { name, lessons: ALL_LESSONS } of TRACKS) {
  describe(`Integridad del plan de estudios — track ${name}`, () => {
    it('todos los ids de lección son únicos', () => {
      const ids = ALL_LESSONS.map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('todos los prerequisites referencian lecciones que existen dentro del mismo track', () => {
      const validIds = new Set(ALL_LESSONS.map((l) => l.id));
      for (const lesson of ALL_LESSONS) {
        for (const prereq of lesson.prerequisites) {
          expect(validIds.has(prereq)).toBe(true);
        }
      }
    });

    it('cada lección requiere solo lecciones que aparecen ANTES en la secuencia (sin dependencias circulares ni hacia adelante)', () => {
      const seenSoFar = new Set<string>();
      for (const lesson of ALL_LESSONS) {
        for (const prereq of lesson.prerequisites) {
          expect(seenSoFar.has(prereq)).toBe(true);
        }
        seenSoFar.add(lesson.id);
      }
    });

    it('la primera lección de la secuencia no tiene prerequisites (es el punto de entrada del track)', () => {
      expect(ALL_LESSONS[0].prerequisites).toEqual([]);
    });

    it('todas las lecciones del track declaran el mismo track y un nivel válido', () => {
      const expectedTrack = name === 'JavaScript' ? 'javascript' : 'typescript';
      for (const lesson of ALL_LESSONS) {
        expect(lesson.track).toBe(expectedTrack);
        expect(['base', 'intermediate', 'advanced']).toContain(lesson.level);
      }
    });

    it('cada lección tiene al menos un bloque de cada tipo esperado (explanation, code, quiz)', () => {
      for (const lesson of ALL_LESSONS) {
        const types = lesson.blocks.map((b) => b.type);
        expect(types).toContain('explanation');
        expect(types).toContain('code');
        expect(types).toContain('quiz');
      }
    });

    it('todos los ids de bloque son únicos DENTRO de cada lección', () => {
      for (const lesson of ALL_LESSONS) {
        const ids = lesson.blocks.map((b) => b.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('cada bloque tiene las 3 variantes (simplified/base/advanced) definidas', () => {
      for (const lesson of ALL_LESSONS) {
        for (const block of lesson.blocks) {
          for (const key of VARIANT_KEYS) {
            expect(block.variants[key]).toBeDefined();
          }
        }
      }
    });

    it('todos los ids de ejercicio de código y de pregunta de quiz son únicos en TODO el track (no solo dentro del bloque)', () => {
      const codeIds: string[] = [];
      const quizIds: string[] = [];
      for (const lesson of ALL_LESSONS) {
        for (const block of lesson.blocks) {
          for (const key of VARIANT_KEYS) {
            if (block.type === 'code') {
              codeIds.push((block.variants[key] as unknown as CodeExample).id);
            } else if (block.type === 'quiz') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const questions = block.variants[key] as any[];
              for (const q of questions) quizIds.push(q.id);
            }
          }
        }
      }
      expect(new Set(codeIds).size).toBe(codeIds.length);
      expect(new Set(quizIds).size).toBe(quizIds.length);
    });

    it('cada quiz tiene al menos 2 preguntas por variante, y cada pregunta tiene explicación para cada distractor', () => {
      for (const lesson of ALL_LESSONS) {
        const quizBlocks = lesson.blocks.filter((b) => b.type === 'quiz');
        for (const block of quizBlocks) {
          for (const key of VARIANT_KEYS) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const questions = block.variants[key] as any[];
            expect(questions.length).toBeGreaterThanOrEqual(2);
            for (const q of questions) {
              expect(q.options.length).toBeGreaterThanOrEqual(2);
              expect(q.correctIndex).toBeGreaterThanOrEqual(0);
              expect(q.correctIndex).toBeLessThan(q.options.length);

              // Cada opción incorrecta debe tener su propia explicación en
              // commonMistakes — ni de más ni de menos.
              const expectedKeys = q.options
                .map((_: unknown, i: number) => i)
                .filter((i: number) => i !== q.correctIndex);
              const actualKeys = Object.keys(q.commonMistakes ?? {}).map(Number);
              expect(actualKeys.sort()).toEqual(expectedKeys.sort());
            }
          }
        }
      }
    });

    it('la respuesta correcta no está sobre-concentrada en una sola opción (quiz explotable adivinando siempre la misma letra)', () => {
      // Bug real encontrado en producción: 83 de 102 preguntas (81%) tenían
      // la respuesta correcta en la opción B — alguien podía aprobar la
      // mayoría de los quizzes sin leer nada, solo eligiendo siempre esa
      // letra. Con 4 opciones, lo parejo sería 25% por índice; se tolera
      // hasta 40% para no exigir una distribución perfecta, pero cualquier
      // valor bien por encima de eso vuelve a ser explotable y debe fallar
      // este test.
      const counts: Record<number, number> = {};
      let total = 0;
      for (const lesson of ALL_LESSONS) {
        const quizBlocks = lesson.blocks.filter((b) => b.type === 'quiz');
        for (const block of quizBlocks) {
          for (const key of VARIANT_KEYS) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const questions = block.variants[key] as any[];
            for (const q of questions) {
              counts[q.correctIndex] = (counts[q.correctIndex] ?? 0) + 1;
              total += 1;
            }
          }
        }
      }
      if (total === 0) return; // track sin preguntas (no debería pasar, pero no es lo que testea este caso)
      for (const [index, count] of Object.entries(counts)) {
        const ratio = count / total;
        expect(
          ratio,
          `La opción ${index} es la correcta en ${(ratio * 100).toFixed(0)}% de las preguntas del track ${name} — demasiado predecible.`
        ).toBeLessThanOrEqual(0.4);
      }
    });
  });

  describe(`Ejercicios de código (${name}): la solución de referencia produce el expectedOutput`, () => {
    // Este test ejecuta CADA solución de CADA ejercicio de código del track
    // contra su expectedOutput — el mismo tipo de verificación manual que
    // encontró bugs reales de contenido (un cálculo mal hecho, un orden de
    // resolución de promesas incorrecto, y una respuesta de quiz marcada mal)
    // ahora corre automáticamente. Para el track de TypeScript, el código
    // pasa primero por sucrase (adentro de executeJsCode) para sacarle los
    // tipos antes de ejecutar — exactamente el mismo camino que sigue el
    // runner real en el navegador.
    for (const lesson of ALL_LESSONS) {
      const codeBlocks = lesson.blocks.filter((b) => b.type === 'code');
      for (const block of codeBlocks) {
        for (const key of VARIANT_KEYS) {
          const example = block.variants[key] as unknown as CodeExample;
          if (!example.solution || !example.expectedOutput) continue;

          it(`${lesson.id} / ${block.id} / ${key}: "${example.title}"`, async () => {
            const result = await executeJsCode(example.solution as string);
            expect(result.error).toBeNull();
            expect(result.output.trim()).toBe((example.expectedOutput as string).trim());
          });
        }
      }
    }
  });
}
