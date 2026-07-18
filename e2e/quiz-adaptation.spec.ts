import { test, expect } from '@playwright/test';
import { completeOnboarding } from './helpers';

// Cubre el comportamiento pedido explícitamente: tras fallar más de dos
// veces la misma pregunta, se revela la respuesta automáticamente, y se
// ofrece continuar con una versión más fácil (o, si ya no hay una versión
// más fácil disponible, confirmar la correcta para poder seguir) — igual
// que la válvula de escape que ya tenían los ejercicios de código.

test.describe('Quiz adaptativo', () => {
  test('revela la respuesta y ofrece una pregunta más fácil tras 3 intentos fallidos', async ({ page }) => {
    await completeOnboarding(page);

    // Avanzar hasta el primer bloque de quiz de la lección actual: se hace
    // click en "Continuar" repetidamente hasta encontrar un quiz (bloque
    // explanation -> code -> quiz es el orden típico, pero no se asume el
    // índice exacto para no acoplar el test al contenido).
    for (let i = 0; i < 5; i++) {
      const quizVisible = await page.locator('.quiz-block').isVisible().catch(() => false);
      if (quizVisible) break;
      const continueBtn = page.getByRole('button', { name: /Continuar/ });
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
    }

    await expect(page.locator('.quiz-block')).toBeVisible();

    // Encontrar una opción incorrecta de la primera pregunta probando en
    // orden — no se asume cuál es la correcta, porque eso es contenido, no
    // comportamiento.
    const firstQuestion = page.locator('.question-card').first();
    const options = firstQuestion.locator('.option-btn');
    const optionCount = await options.count();

    let wrongIndex = -1;
    for (let i = 0; i < optionCount; i++) {
      await options.nth(i).click();
      const hasRetry = await firstQuestion.getByText('Intentar de nuevo').isVisible().catch(() => false);
      if (hasRetry) {
        wrongIndex = i;
        break;
      }
      // Si no apareció "Intentar de nuevo", esa opción era la correcta —
      // este test es específicamente sobre el camino de fallar, así que no
      // aplica más (se corta aquí; no es un fallo del test).
      test.skip(true, 'La primera opción probada resultó ser la correcta; no aplica el camino de fallo.');
    }

    expect(wrongIndex).toBeGreaterThanOrEqual(0);

    // Fallar 2 veces más la MISMA opción para llegar a 3 intentos fallidos
    // en total (el umbral que dispara la revelación automática).
    for (let attempt = 0; attempt < 2; attempt++) {
      await firstQuestion.getByText('Intentar de nuevo').click();
      await options.nth(wrongIndex).click();
    }

    // A partir del 3er intento fallido, se revela la respuesta sola.
    await expect(firstQuestion.locator('.quiz-reveal-box')).toBeVisible();
    await expect(firstQuestion.getByText(/La respuesta correcta es/)).toBeVisible();

    // Debe ofrecer alguna de las dos vías para continuar: una pregunta más
    // fácil, o confirmar la correcta (si ya no hay nivel más fácil).
    const easierButton = firstQuestion.getByRole('button', { name: /pregunta más fácil/ });
    const confirmButton = firstQuestion.getByRole('button', { name: /Entendido, continuar/ });
    const hasEasier = await easierButton.isVisible().catch(() => false);
    const hasConfirm = await confirmButton.isVisible().catch(() => false);
    expect(hasEasier || hasConfirm).toBe(true);
  });
});
