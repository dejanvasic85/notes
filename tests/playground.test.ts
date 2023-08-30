import { expect, test } from '@playwright/test';

test('edit sample note', async ({ page }) => {
	await page.goto('/playground');
	await expect(page.getByText('Use the force and edit me by clicking here.')).toBeVisible();
	await page.getByRole('button', { name: 'Edit note 1' }).click();
});

test('add a new note', async ({ page }) => {
	await page.goto('/playground');
	await page.getByRole('button', { name: 'Add note' }).click();
	await expect(page.getByText('New note')).toBeVisible();
});
