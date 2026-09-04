import { test, expect } from '@playwright/test';

const unique = () => Date.now().toString(36);
// Redirects after a POST may carry a ;jsessionid= suffix when no session cookie exists yet.
const ownerDetailsUrl = /\/owners\/\d+(;jsessionid=\w+)?$/;

test.describe('Owners', () => {
  test('searching with an empty last name lists all owners', async ({ page }) => {
    await page.goto('/owners/find');
    await page.getByRole('button', { name: 'Find Owner' }).click();

    await expect(page).toHaveURL(/\/owners(\?.*)?$/);
    await expect(page.getByRole('heading', { name: 'Owners' })).toBeVisible();
    const rows = page.locator('#owners tbody tr');
    await expect(rows).not.toHaveCount(0);
    await expect(rows.first()).toContainText(/\S+ \S+/);
  });

  test('searching a unique last name opens the owner directly', async ({ page }) => {
    await page.goto('/owners/find');
    await page.locator('#lastName').fill('Franklin');
    await page.getByRole('button', { name: 'Find Owner' }).click();

    await expect(page).toHaveURL(ownerDetailsUrl);
    await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
    await expect(page.locator('table').first()).toContainText('George Franklin');
  });

  test('searching an unknown last name shows a validation message', async ({ page }) => {
    await page.goto('/owners/find');
    await page.locator('#lastName').fill(`nobody-${unique()}`);
    await page.getByRole('button', { name: 'Find Owner' }).click();

    await expect(page).toHaveURL(/\/owners/);
    await expect(page.locator('#lastNameGroup')).toContainText('has not been found');
  });

  test('adding an owner shows the new owner details', async ({ page }) => {
    const lastName = `Playwright${unique()}`;

    await page.goto('/owners/find');
    await page.getByRole('link', { name: 'Add Owner' }).click();
    await expect(page).toHaveURL(/\/owners\/new$/);

    await page.getByLabel('First Name').fill('Ada');
    await page.getByLabel('Last Name').fill(lastName);
    await page.getByLabel('Address').fill('1 Test Street');
    await page.getByLabel('City').fill('Testville');
    await page.getByLabel('Telephone').fill('5551234567');
    await page.getByRole('button', { name: 'Add Owner' }).click();

    await expect(page).toHaveURL(ownerDetailsUrl);
    await expect(page.locator('#success-message')).toContainText('New Owner Created');
    const details = page.locator('table').first();
    await expect(details).toContainText(`Ada ${lastName}`);
    await expect(details).toContainText('1 Test Street');
    await expect(details).toContainText('Testville');
    await expect(details).toContainText('5551234567');
  });

  test('submitting an invalid owner keeps the form and shows errors', async ({ page }) => {
    await page.goto('/owners/new');
    await page.getByLabel('First Name').fill('Bad');
    await page.getByLabel('Last Name').fill('Phone');
    await page.getByLabel('Address').fill('Nowhere');
    await page.getByLabel('City').fill('Nowhere');
    await page.getByLabel('Telephone').fill('not-a-number');
    await page.getByRole('button', { name: 'Add Owner' }).click();

    await expect(page).toHaveURL(/\/owners\/new$/);
    await expect(page.locator('.has-error')).toHaveCount(1);
    await expect(page.locator('.has-error')).toContainText(/telephone/i);
  });

  test('editing an owner updates the details', async ({ page }) => {
    const lastName = `Edit${unique()}`;
    await page.goto('/owners/new');
    await page.getByLabel('First Name').fill('Grace');
    await page.getByLabel('Last Name').fill(lastName);
    await page.getByLabel('Address').fill('Old Address');
    await page.getByLabel('City').fill('Old City');
    await page.getByLabel('Telephone').fill('1111111111');
    await page.getByRole('button', { name: 'Add Owner' }).click();
    await expect(page).toHaveURL(ownerDetailsUrl);

    await page.getByRole('link', { name: 'Edit Owner' }).click();
    await expect(page).toHaveURL(/\/owners\/\d+\/edit$/);
    await page.getByLabel('Address').fill('New Address');
    await page.getByRole('button', { name: 'Update Owner' }).click();

    await expect(page).toHaveURL(ownerDetailsUrl);
    await expect(page.locator('#success-message')).toContainText('Owner Values Updated');
    await expect(page.locator('table').first()).toContainText('New Address');
  });
});
