import { expect, test } from '@playwright/test';

test('edit sample note', async ({ page }) => {
	await page.goto('/');
	await expect(
		page.getByText('Click here to edit me! You can also drag to reorder 😊')
	).toBeVisible();
	await page.getByRole('button', { name: 'Edit note 1' }).click();
});

test('add a new note', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Create a note' }).click();
	await page.keyboard.type(' hello world');
	await page.getByRole('button', { name: 'Save note' }).click();
	await expect(page.getByText('hello world')).toBeVisible();
});
