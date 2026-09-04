import { test, expect, type Page } from '@playwright/test';

const unique = () => Date.now().toString(36);
const ownerDetailsUrl = /\/owners\/\d+(;jsessionid=\w+)?$/;

const isoDate = (daysFromToday: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

async function createOwner(page: Page, lastName: string): Promise<void> {
  await page.goto('/owners/new');
  await page.getByLabel('First Name').fill('Pet');
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('Address').fill('2 Kennel Road');
  await page.getByLabel('City').fill('Dogtown');
  await page.getByLabel('Telephone').fill('2222222222');
  await page.getByRole('button', { name: 'Add Owner' }).click();
  await expect(page).toHaveURL(ownerDetailsUrl);
}

test.describe('Pets and visits', () => {
  test('adding a pet lists it under the owner', async ({ page }) => {
    const petName = `Rex${unique()}`;
    await createOwner(page, `PetOwner${unique()}`);

    await page.getByRole('link', { name: 'Add New Pet' }).click();
    await expect(page).toHaveURL(/\/owners\/\d+\/pets\/new$/);
    await expect(page.getByRole('heading', { name: /New\s+Pet/ })).toBeVisible();

    await page.getByLabel('Name').fill(petName);
    await page.getByLabel('Birth Date').fill('2020-05-15');
    await page.getByLabel('Type').selectOption('dog');
    await page.getByRole('button', { name: 'Add Pet' }).click();

    await expect(page).toHaveURL(ownerDetailsUrl);
    await expect(page.locator('#success-message')).toContainText('New Pet has been Added');
    const petCard = page.locator('dl').filter({ hasText: petName });
    await expect(petCard).toContainText('2020-05-15');
    await expect(petCard).toContainText('dog');
  });

  test('adding a pet with a missing name shows a validation error', async ({ page }) => {
    await createOwner(page, `Invalid${unique()}`);
    await page.getByRole('link', { name: 'Add New Pet' }).click();

    await page.getByLabel('Birth Date').fill('2021-01-01');
    await page.getByLabel('Type').selectOption('cat');
    await page.getByRole('button', { name: 'Add Pet' }).click();

    await expect(page).toHaveURL(/\/pets\/new$/);
    await expect(page.locator('.has-error')).toContainText(/required/i);
  });

  test('adding a visit records it against the pet', async ({ page }) => {
    const petName = `Whiskers${unique()}`;
    const description = `Checkup ${unique()}`;
    await createOwner(page, `VisitOwner${unique()}`);

    await page.getByRole('link', { name: 'Add New Pet' }).click();
    await page.getByLabel('Name').fill(petName);
    await page.getByLabel('Birth Date').fill('2019-03-03');
    await page.getByLabel('Type').selectOption('cat');
    await page.getByRole('button', { name: 'Add Pet' }).click();
    await expect(page).toHaveURL(ownerDetailsUrl);

    await page.getByRole('link', { name: 'Add Visit' }).click();
    await expect(page).toHaveURL(/\/owners\/\d+\/pets\/\d+\/visits\/new$/);
    await expect(page.getByRole('heading', { name: /New\s+Visit/ })).toBeVisible();
    await expect(page.locator('table').first()).toContainText(petName);

    const visitDate = isoDate(7);
    await page.getByLabel('Date').fill(visitDate);
    await page.getByLabel('Description').fill(description);
    await page.getByRole('button', { name: 'Add Visit' }).click();

    await expect(page).toHaveURL(ownerDetailsUrl);
    await expect(page.locator('#success-message')).toContainText('Your visit has been booked');
    const visitsTable = page.locator('tr').filter({ hasText: petName }).locator('table');
    await expect(visitsTable).toContainText(visitDate);
    await expect(visitsTable).toContainText(description);
  });

  test('a visit dated today or earlier is rejected', async ({ page }) => {
    await createOwner(page, `PastVisit${unique()}`);
    await page.getByRole('link', { name: 'Add New Pet' }).click();
    await page.getByLabel('Name').fill(`Old${unique()}`);
    await page.getByLabel('Birth Date').fill('2018-01-01');
    await page.getByLabel('Type').selectOption('bird');
    await page.getByRole('button', { name: 'Add Pet' }).click();
    await expect(page).toHaveURL(ownerDetailsUrl);

    await page.getByRole('link', { name: 'Add Visit' }).click();
    await page.getByLabel('Date').fill(isoDate(0));
    await page.getByLabel('Description').fill('Too late');
    await page.getByRole('button', { name: 'Add Visit' }).click();

    // The date input carries min=tomorrow, so the browser blocks the submit client-side.
    await expect(page).toHaveURL(/\/visits\/new$/);
    const dateInput = page.getByLabel('Date');
    await expect(dateInput).toHaveAttribute('min', isoDate(1));
    expect(await dateInput.evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow)).toBe(true);
    await expect(page.locator('#success-message')).toHaveCount(0);
  });
});
