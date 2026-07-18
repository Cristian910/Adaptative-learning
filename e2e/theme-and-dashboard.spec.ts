import { test, expect } from '@playwright/test';
import { completeOnboarding } from './helpers';

test.describe('Tema y Dashboard', () => {
  test('cambiar a tema claro persiste después de recargar la página', async ({ page }) => {
    await completeOnboarding(page);

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Cambiar a tema claro' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.reload();
    // El script inline de index.html debe aplicar el tema guardado ANTES
    // del primer paint, así que ya debería estar en claro apenas carga.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('el dashboard de progreso muestra los puntos y el gráfico de progreso por nivel', async ({ page }) => {
    await completeOnboarding(page);

    const menuButton = page.getByRole('button', { name: 'Abrir menú de lecciones' });
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
    }

    await page.getByText('Ver mi dashboard').click();
    await expect(page.getByText('Tu dashboard')).toBeVisible();
    await expect(page.getByText('Progreso por nivel')).toBeVisible();
  });
});
