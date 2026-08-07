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

	// Verify the success toast appears once the note is created on the server
	await expect(page.getByText('Note created')).toBeVisible();

	await page.getByRole('button', { name: 'Choose colour' }).click();
	await page.getByRole('button', { name: 'blue' }).click();

	// Wait for the note editor dialog to appear by waiting for the Title textbox
	const titleTextbox = page.getByRole('textbox', { name: 'Title' });
	await expect(titleTextbox).toBeVisible();
	await titleTextbox.fill(noteTitle);

	const editor = page.getByRole('textbox').nth(2);
	await editor.fill(noteContent);

	// Updates are silent — no success toast — so wait on the request itself.
	// Match on the title so an in-flight PATCH from the earlier colour change
	// can't satisfy this wait. Autosave fires it — there's no Save button.
	const updateNotePromise = page.waitForResponse(
		(response) =>
			response.url().includes('/api/notes') &&
			response.request().method() === 'PATCH' &&
			response.request().postDataJSON()?.title === noteTitle &&
			response.status() < 400
	);

	await updateNotePromise;

	// Autosave no longer auto-closes the sheet - close it explicitly.
	await page.getByRole('button', { name: 'Cancel note edit' }).click();
	await expect(page.getByRole('button', { name: 'Cancel note edit' })).not.toBeVisible({
		timeout: 3000
	});

	// Wait for the note to be saved - verify the note appears on the board
	await expect(page.getByText(noteTitle)).toBeVisible();

	// Click on the note to edit it
	await page.getByText(noteTitle).click();

	// Delete is optimistic with a 3s undo window - the DELETE request only
	// fires once that window elapses uncancelled.
	const deleteNotePromise = page.waitForResponse(
		(response) =>
			response.url().includes('/api/notes') &&
			response.request().method() === 'DELETE' &&
			response.status() < 400
	);

	await page.getByRole('button', { name: 'Delete note' }).click();

	// Undo toast appears immediately, before the request has even fired.
	await expect(page.getByText('Note deleted')).toBeVisible();

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
