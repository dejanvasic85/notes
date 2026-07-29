import { expect, test } from '@playwright/test';

test('edit sample note', async ({ page }) => {
	await page.goto('/');
	await expect(
		page.getByText('Click here to edit me! You can also drag to reorder 😊')
	).toBeVisible();
	await page.waitForTimeout(1000);
	await page.getByRole('button', { name: 'Edit note 1' }).click();
	await page.waitForTimeout(1000);
});

test('add a new note', async ({ page }) => {
	await page.goto('/');
	await page.waitForTimeout(1000);
	await page.getByRole('button', { name: 'Create a note' }).click();
	await page.waitForTimeout(1000);
	await page.keyboard.type(' hello world');
	await page.waitForTimeout(1000);
	await page.getByRole('button', { name: 'Save note' }).click();
	// Save holds the sheet open on a "Saved" checkmark before closing itself
	// (see docs/design-system §7) - wait for it to actually close rather than
	// assuming the old instant-close timing.
	await expect(page.getByRole('button', { name: 'Cancel note edit' })).not.toBeVisible({
		timeout: 3000
	});
	await expect(page.getByText('hello world')).toBeVisible();
});
