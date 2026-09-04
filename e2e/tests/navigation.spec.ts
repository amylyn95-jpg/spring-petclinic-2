import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page shows the welcome banner', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PetClinic/);
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
    await expect(page.locator('img[src$="/resources/images/pets.png"]')).toBeVisible();
  });

  test('top navigation links reach each section', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Find owners' }).click();
    await expect(page).toHaveURL(/\/owners\/find$/);
    await expect(page.getByRole('heading', { name: 'Find Owners' })).toBeVisible();

    await page.getByRole('link', { name: 'Veterinarians' }).click();
    await expect(page).toHaveURL(/\/vets\.html$/);
    await expect(page.getByRole('heading', { name: 'Veterinarians' })).toBeVisible();

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });
});
