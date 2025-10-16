import { expect, test, type Page } from '@playwright/test';

test('basic note management', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);
	expect(page.getByText('Nothing to see yet! Go on create a note.')).toBeVisible();

	await page.waitForTimeout(500);
	await page.getByRole('button', { name: 'Create a new note' }).click();
	await page.waitForTimeout(500);

	await page.getByRole('textbox', { name: 'Title' }).click();
	await page.getByRole('textbox', { name: 'Title' }).fill('Hello world');

	const editor = page.getByRole('textbox').nth(2);

	await editor.fill('This is a sample note.');
	await page.waitForTimeout(500);

	await page.getByRole('button', { name: 'Choose colour' }).click();
	await page.getByRole('button', { name: 'blue' }).click();
	await page.getByRole('button', { name: 'Save note' }).click();

	await page.waitForTimeout(500);
	await page.getByRole('button', { name: 'Edit note 1' }).click();

	// Handle the confirmation dialog by accepting it
	page.once('dialog', async (dialog) => {
		expect(dialog.type()).toBe('confirm');
		expect(dialog.message()).toContain(''); // Add expected message text if you want to verify it
		await dialog.accept();
	});

	await page.getByRole('button', { name: 'Delete note' }).click();

	// Wait for the note to be deleted and verify it's gone
	await expect(page.getByText('Nothing to see yet! Go on create a note.')).toBeVisible();
});

async function login(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL!);
	await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PASSWORD!);
	await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
