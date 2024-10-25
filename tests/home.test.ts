import { expect, test } from '@playwright/test';

test('edit sample note', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Edit me.')).toBeVisible();
	await page.getByRole('button', { name: 'Edit note 1' }).click();
});

test('add a new note', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Add note' }).click();
	await page.keyboard.type(' hello world');
	await page.getByRole('button', { name: 'Save note' }).click();
	await expect(page.getByText('hello world')).toBeVisible();
});
