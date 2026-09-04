import { test, expect } from '@playwright/test';

test.describe('Spring PetClinic smoke tests', () => {
  test('loads the welcome page with heading and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: /Home/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Find owners/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Veterinarians/i })).toBeVisible();
  });

  test('finds all owners with an empty search', async ({ page }) => {
    await page.goto('/owners/find');
    await expect(page.getByRole('heading', { name: 'Find Owners' })).toBeVisible();
    await page.locator('#search-owner-form').getByRole('button', { name: 'Find Owner' }).click();
    await expect(page).toHaveURL(/\/owners(\?.*)?$/);
    await expect(page.getByRole('heading', { name: 'Owners' })).toBeVisible();
    const rows = page.locator('#owners tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('shows details for an existing owner', async ({ page }) => {
    await page.goto('/owners/1');
    await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
    await expect(page.getByText('George Franklin')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pets and Visits' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Edit Owner' })).toBeVisible();
  });

  test('creates a new owner', async ({ page }) => {
    await page.goto('/owners/new');
    await expect(page.getByRole('heading', { name: 'Owner' })).toBeVisible();
    const form = page.locator('#add-owner-form');
    await form.locator('#firstName').fill('Playwright');
    await form.locator('#lastName').fill('Tester');
    await form.locator('#address').fill('1 Automation Way');
    await form.locator('#city').fill('Testville');
    await form.locator('#telephone').fill('5551234567');
    await form.getByRole('button', { name: 'Add Owner' }).click();

    await expect(page).toHaveURL(/\/owners\/\d+$/);
    await expect(page.locator('#success-message')).toContainText('New Owner Created');
    await expect(page.getByText('Playwright Tester')).toBeVisible();
    await expect(page.getByText('Testville')).toBeVisible();
  });

  test('lists veterinarians', async ({ page }) => {
    await page.goto('/vets.html');
    await expect(page.getByRole('heading', { name: 'Veterinarians' })).toBeVisible();
    const table = page.locator('#vets');
    await expect(table).toBeVisible();
    await expect(table.locator('tbody tr').first()).toBeVisible();
    await expect(table.getByText('James Carter')).toBeVisible();
  });
});
