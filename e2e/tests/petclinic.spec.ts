import { expect, test } from '@playwright/test';

test('home page displays welcome heading and navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  const navigation = page.locator('nav, .navbar').first();
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: /Find owners/i })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Veterinarians' })).toBeVisible();
});

test('finding owners with an empty last name displays the owners table', async ({ page }) => {
  await page.goto('/owners/find');

  await page.getByRole('button', { name: 'Find Owner' }).click();

  await expect(page).toHaveURL(/\/owners/);
  await expect(page.locator('table#owners')).toBeVisible();
  await expect(page.locator('table#owners tbody tr').nth(1)).toBeVisible();
});

test('owner details display the expected owner', async ({ page }) => {
  await page.goto('/owners/1');

  await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
  await expect(page.getByText('George Franklin', { exact: true })).toBeVisible();
});

test('a new owner can be created', async ({ page }) => {
  const lastName = `E2E${Date.now()}`;
  await page.goto('/owners/new');

  await page.getByLabel('First Name').fill('Playwright');
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('Address').fill('123 Test Street');
  await page.getByLabel('City').fill('Testville');
  await page.getByLabel('Telephone').fill('1234567890');
  await page.getByRole('button', { name: 'Add Owner' }).click();

  await expect(page).toHaveURL(/\/owners\/\d+(?:;jsessionid=[^/?]+)?$/);
  await expect(page.locator('#success-message')).toContainText('New Owner Created');
  await expect(page.locator('table').first()).toContainText(lastName);
});

test('veterinarians page displays the vets table', async ({ page }) => {
  await page.goto('/vets.html');

  await expect(page.getByRole('heading', { name: 'Veterinarians' })).toBeVisible();
  await expect(page.locator('table#vets')).toBeVisible();
  await expect(page.locator('table#vets tbody tr').nth(1)).toBeVisible();
});
