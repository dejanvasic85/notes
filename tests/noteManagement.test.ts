import { expect, test, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('basic note management', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	// Wait for the page to load (either empty state or notes list)
	await page.waitForLoadState('networkidle');

	// Wait for either the board to load or an error state
	const createButton = page.getByRole('button', { name: 'Create a new note' });
	await expect(createButton).toBeVisible({ timeout: 10000 });

	// Generate unique content for this test
	const noteTitle = faker.lorem.words(3);
	const noteContent = faker.lorem.sentence();

	// Click the create button - the queue will handle request sequencing
	await createButton.click();

	await page.getByRole('button', { name: 'Choose colour' }).click();
	await page.getByRole('button', { name: 'blue' }).click();

	// Wait for the note editor dialog to appear by waiting for the Title textbox
	const titleTextbox = page.getByRole('textbox', { name: 'Title' });
	await expect(titleTextbox).toBeVisible();
	await titleTextbox.fill(noteTitle);

	const editor = page.getByRole('textbox').nth(2);
	await editor.fill(noteContent);

	await page.getByRole('button', { name: 'Save note' }).click();

	// Wait for the note to be saved - verify the note appears on the board
	await expect(page.getByText(noteTitle)).toBeVisible();

	// Click on the note to edit it
	await page.getByText(noteTitle).click();

	// Handle the confirmation dialog by accepting it
	page.once('dialog', async (dialog) => {
		expect(dialog.type()).toBe('confirm');
		await dialog.accept();
	});

	// Wait for the delete request to complete
	const deleteNotePromise = page.waitForResponse(
		(response) =>
			response.url().includes('/api/notes') &&
			response.request().method() === 'DELETE' &&
			response.status() < 400
	);

	await page.getByRole('button', { name: 'Delete note' }).click();
	await deleteNotePromise;

	// Verify the note content is no longer visible on the page
	await expect(page.getByText(noteTitle)).not.toBeVisible();
	await expect(page.getByText(noteContent)).not.toBeVisible();
});

async function login(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL!);
	await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PASSWORD!);
	await page.getByRole('button', { name: 'Continue', exact: true }).click();

	// Wait for navigation after login to complete
	await page.waitForURL(/\/my\/board/, { timeout: 10000 });
}
