import { test, expect } from '@playwright/test';

test.describe('Spring PetClinic smoke tests', () => {
  test('home page shows welcome heading and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /find owners/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /veterinarians/i })).toBeVisible();
  });

  test('find owners with empty last name lists all owners', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: /find owners/i }).click();
    await expect(page).toHaveURL(/\/owners\/find$/);
    await expect(page.locator('#search-owner-form')).toBeVisible();

    await page.locator('#lastName').fill('');
    await page.locator('#search-owner-form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/owners(\?.*)?$/);
    const rows = page.locator('#owners tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(page.locator('#owners')).toContainText('Franklin');
  });

  test('owner details page renders for seeded owner 1', async ({ page }) => {
    await page.goto('/owners/1');
    await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
    await expect(page.locator('table.table-striped').first()).toContainText('George Franklin');
    await expect(page.getByRole('heading', { name: 'Pets and Visits' })).toBeVisible();
  });

  test('create a new owner and see success message', async ({ page }) => {
    const suffix = Date.now().toString().slice(-6);
    await page.goto('/owners/new');
    await expect(page.locator('#add-owner-form')).toBeVisible();

    await page.locator('#firstName').fill('Playwright');
    await page.locator('#lastName').fill(`Tester${suffix}`);
    await page.locator('#address').fill('1 Test Street');
    await page.locator('#city').fill('Testville');
    await page.locator('#telephone').fill('5551234567');
    await page.locator('#add-owner-form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/owners\/\d+(;jsessionid=[^/?]+)?$/);
    await expect(page.locator('#success-message')).toContainText('New Owner Created');
    await expect(page.locator('table.table-striped').first()).toContainText(`Playwright Tester${suffix}`);
  });

  test('veterinarians page lists seeded vets', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: /veterinarians/i }).click();
    await expect(page).toHaveURL(/\/vets\.html/);
    await expect(page.getByRole('heading', { name: 'Veterinarians' })).toBeVisible();

    const rows = page.locator('#vets tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(page.locator('#vets')).toContainText('James Carter');
  });
});
