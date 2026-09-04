import { test, expect } from '@playwright/test';

test.describe('Error handling', () => {
  test('the Error nav item renders the friendly error page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Error' }).click();

    await expect(page).toHaveURL(/\/oups$/);
    await expect(page.getByRole('heading', { name: 'Something happened...' })).toBeVisible();
    await expect(page.getByText('An internal server error occurred.')).toBeVisible();
  });

  test('an unknown owner id returns the error page', async ({ page }) => {
    await page.goto('/owners/999999');
    await expect(page.getByRole('heading', { name: 'Something happened...' })).toBeVisible();
  });

  test('an unknown URL returns a 404 page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Something happened...' })).toBeVisible();
    await expect(page.getByText('The requested page was not found.')).toBeVisible();
  });
});
