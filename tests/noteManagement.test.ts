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
	await page.getByRole('button', { name: 'Delete note' }).click();
});

async function login(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL!);
	await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PASSWORD!);
	await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
