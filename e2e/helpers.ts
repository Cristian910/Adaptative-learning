import type { Page } from '@playwright/test';

export async function completeOnboarding(
  page: Page,
  options: { track?: 'JavaScript' | 'TypeScript'; level?: 'Principiante' | 'Intermedio' | 'Avanzado'; name?: string } = {}
) {
  const { track = 'JavaScript', level = 'Principiante', name = 'Ada' } = options;
  await page.goto('/');
  await page.getByRole('button', { name: 'Empezar →' }).click();
  await page.getByPlaceholder('¿Cómo te llamas? (opcional)').fill(name);
  await page.getByRole('button', { name: 'Entendido, empezar →' }).click();
  await page.getByText(track, { exact: true }).click();
  await page.getByText(level, { exact: true }).click();
}
