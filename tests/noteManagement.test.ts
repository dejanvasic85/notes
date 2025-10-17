import { expect, test, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('basic note management', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	// Wait for the page to load (either empty state or notes list)
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);

	// Generate unique content for this test
	const noteTitle = faker.lorem.words(3);
	const noteContent = faker.lorem.sentence();

	// Click the create button and wait for the title textbox to appear
	await page.getByRole('button', { name: 'Create a new note' }).click();
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);

	await page.getByRole('button', { name: 'Choose colour' }).click();
	await page.getByRole('button', { name: 'blue' }).click();
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);

	// Wait for the note editor dialog to appear by waiting for the Title textbox
	const titleTextbox = page.getByRole('textbox', { name: 'Title' });
	await expect(titleTextbox).toBeVisible();
	await titleTextbox.fill(noteTitle);

	const editor = page.getByRole('textbox').nth(2);
	await editor.fill(noteContent);

	await page.getByRole('button', { name: 'Save note' }).click();
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);

	// Wait for the note to be saved - verify the note appears on the board
	await expect(page.getByText(noteTitle)).toBeVisible();

	// Click on the note to edit it
	await page.getByText(noteTitle).click();

	// Handle the confirmation dialog by accepting it
	page.once('dialog', async (dialog) => {
		expect(dialog.type()).toBe('confirm');
		await dialog.accept();
	});

	await page.getByRole('button', { name: 'Delete note' }).click();
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);

	// Verify the note content is no longer visible on the page
	await expect(page.getByText(noteTitle)).not.toBeVisible();
	await expect(page.getByText(noteContent)).not.toBeVisible();
});

async function login(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL!);
	await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PASSWORD!);
	await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
