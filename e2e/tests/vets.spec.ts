import { test, expect } from '@playwright/test';

test.describe('Veterinarians', () => {
  test('vets page lists veterinarians with specialties', async ({ page }) => {
    await page.goto('/vets.html');
    await expect(page.getByRole('heading', { name: 'Veterinarians' })).toBeVisible();

    const rows = page.locator('#vets tbody tr');
    await expect(rows).not.toHaveCount(0);
    await expect(page.locator('#vets')).toContainText('James Carter');
    await expect(page.locator('#vets')).toContainText('none');
    await expect(page.locator('#vets')).toContainText(/radiology|surgery|dentistry/);
  });

  test('vets JSON endpoint returns the same data', async ({ request }) => {
    const response = await request.get('/vets');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.vetList)).toBeTruthy();
    expect(body.vetList.length).toBeGreaterThan(0);
    expect(body.vetList[0]).toEqual(
      expect.objectContaining({ firstName: expect.any(String), lastName: expect.any(String) }),
    );
  });
});
