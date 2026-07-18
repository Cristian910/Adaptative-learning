import { test, expect } from '@playwright/test';

// Cubre exactamente el bug que originó curriculum.ts como fuente única de
// verdad: un usuario nuevo tiene que aterrizar en la PRIMERA lección
// pedagógica, no en la que tenga 'lesson-1' en el nombre de archivo.

test.describe('Onboarding: bienvenida + selección de curso', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('un usuario nuevo ve la landing, después la bienvenida, y elige curso y nivel', async ({ page }) => {
    // Paso 0: landing (portada)
    await expect(page.getByRole('button', { name: 'Empezar →' })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar →' }).click();

    await expect(page.getByText('Bienvenido a JS Adaptive')).toBeVisible();

    await page.getByPlaceholder('¿Cómo te llamas? (opcional)').fill('Ada');
    await page.getByRole('button', { name: 'Entendido, empezar →' }).click();

    // Paso 2: elegir curso
    await expect(page.getByText('¿Qué quieres estudiar?')).toBeVisible();
    await page.getByText('JavaScript', { exact: true }).click();

    // Paso 3: elegir nivel
    await expect(page.getByText('¿Desde qué nivel arrancamos?')).toBeVisible();
    await page.getByText('Principiante', { exact: true }).click();

    // Debe aterrizar en la sidebar mostrando la lección 1 real (pedagógica),
    // saludando por el nombre ingresado.
    await expect(page.getByText('Hola, Ada 👋')).toBeVisible();
    await expect(page.getByText(/Lección 1\b/)).toBeVisible();
  });

  test('elegir nivel avanzado desbloquea la navegación a lecciones anteriores sin marcarlas completas', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Empezar →' }).click();
    await page.getByPlaceholder('¿Cómo te llamas? (opcional)').fill('');
    await page.getByRole('button', { name: 'Entendido, empezar →' }).click();
    await page.getByText('JavaScript', { exact: true }).click();
    await page.getByText('Avanzado', { exact: true }).click();

    // En mobile el nav vive detrás del botón de menú; en desktop está
    // siempre visible — se abre el menú si hace falta.
    const menuButton = page.getByRole('button', { name: 'Abrir menú de lecciones' });
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
    }

    // Una lección de nivel Principiante (anterior) debe estar visible y
    // habilitada para click (no debe tener el candado 🔒), aunque no esté
    // completada.
    const earlyLessonButton = page.locator('.lesson-nav-item').first();
    await expect(earlyLessonButton).toBeVisible();
    await expect(earlyLessonButton.locator('.lesson-lock')).toHaveCount(0);
  });
});
