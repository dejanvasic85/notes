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

test('deleting a note with an unsaved edit does not throw or show an error', async ({ page }) => {
	// This bug surfaces as an unhandled rejection, not a toast, so track it directly.
	const pageErrors: Error[] = [];
	page.on('pageerror', (error) => pageErrors.push(error));

	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	await page.waitForLoadState('networkidle');
	const createButton = page.getByRole('button', { name: 'Create a new note' });
	await expect(createButton).toBeVisible({ timeout: 10000 });
	await createButton.click();

	const titleTextbox = page.getByRole('textbox', { name: 'Title' });
	await expect(titleTextbox).toBeVisible();
	const noteId = new URL(page.url()).searchParams.get('id')!;

	// Delete before the ~1s autosave debounce fires, while the note is still dirty.
	await titleTextbox.fill(faker.lorem.words(3));

	const patchesAfterDelete: string[] = [];
	page.on('request', (request) => {
		if (request.method() === 'PATCH' && request.url().includes(`/api/notes/${noteId}`)) {
			patchesAfterDelete.push(request.url());
		}
	});

	await page.getByRole('button', { name: 'Delete note' }).click();
	await expect(page.getByText('Note deleted')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Cancel note edit' })).not.toBeVisible();

	// Let the (cancelled) autosave debounce and teardown save fire if they were going to.
	await page.waitForTimeout(1500);

	expect(pageErrors).toEqual([]);
	expect(patchesAfterDelete).toEqual([]);
});

test('closing a note whose save fails keeps the editor open instead of dismissing it', async ({
	page
}) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	await page.waitForLoadState('networkidle');
	const createButton = page.getByRole('button', { name: 'Create a new note' });
	await expect(createButton).toBeVisible({ timeout: 10000 });
	await createButton.click();

	const titleTextbox = page.getByRole('textbox', { name: 'Title' });
	await expect(titleTextbox).toBeVisible();
	const noteId = new URL(page.url()).searchParams.get('id')!;

	// Force the content-save PATCH to fail so handleClose's own commitSave fails.
	await page.route(`**/api/notes/${noteId}`, (route) => {
		if (route.request().method() === 'PATCH') {
			return route.fulfill({ status: 500, body: 'Internal Server Error' });
		}
		return route.continue();
	});

	await titleTextbox.fill(faker.lorem.words(3));

	// Close before the autosave debounce fires - handleClose sends the only save.
	await page.getByRole('button', { name: 'Cancel note edit' }).click();

	const failureToast = page.getByText('Failed to update note. Try again.');
	await expect(failureToast).toBeVisible();

	// The failed save must keep the editor open rather than dismiss it silently.
	await expect(page.getByRole('button', { name: 'Cancel note edit' })).toBeVisible();
	await expect(titleTextbox).toBeVisible();

	// Fix the network before the still-dirty state's re-armed autosave debounce
	// gets a chance to retry against the still-failing route and raise a second,
	// unrelated toast.
	await page.unroute(`**/api/notes/${noteId}`);

	// Let the failure toast auto-dismiss so the next check below is asserting
	// against a genuinely new toast, not this one still lingering on screen.
	await expect(failureToast).not.toBeVisible({ timeout: 6000 });

	// Closing should now work normally and must not raise a failure toast of
	// its own.
	await page.getByRole('button', { name: 'Cancel note edit' }).click();
	await expect(page.getByRole('button', { name: 'Cancel note edit' })).not.toBeVisible({
		timeout: 3000
	});
	await expect(failureToast).not.toBeVisible();
});

test('closing right after a failing autosave already fired keeps the editor open', async ({
	page
}) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	await page.waitForLoadState('networkidle');
	const createButton = page.getByRole('button', { name: 'Create a new note' });
	await expect(createButton).toBeVisible({ timeout: 10000 });
	await createButton.click();

	const titleTextbox = page.getByRole('textbox', { name: 'Title' });
	await expect(titleTextbox).toBeVisible();
	const noteId = new URL(page.url()).searchParams.get('id')!;

	// Delay and fail only the first content-save PATCH, so it's still in flight
	// - and hasUnsavedChanges has already gone false via the optimistic apply()
	// - by the time the user clicks close. Later PATCHes (handleClose's own
	// retry) pass straight through to the real dev server, so there's no need
	// to unroute mid-flight, which races Playwright's own request lifecycle
	// and isn't representative of anything the app itself does.
	let failuresLeft = 1;
	await page.route(`**/api/notes/${noteId}`, async (route) => {
		if (route.request().method() === 'PATCH' && failuresLeft > 0) {
			failuresLeft--;
			await new Promise((resolve) => setTimeout(resolve, 500));
			return route.fulfill({ status: 400, body: 'Bad Request' });
		}
		return route.continue();
	});

	await titleTextbox.fill(faker.lorem.words(3));

	// Let the ~1s autosave debounce fire and dispatch its (slow, failing) PATCH.
	await page.waitForTimeout(1200);

	// Close while that PATCH is still in flight - handleClose must wait for it
	// rather than closing immediately because there's nothing locally "unsaved".
	await page.getByRole('button', { name: 'Cancel note edit' }).click();

	const failureToast = page.getByText('Failed to update note. Try again.');
	await expect(failureToast).toBeVisible();

	// handleClose's own retry (the revert made the edit look unsaved again)
	// hits the real server and succeeds, so the editor closes on its own -
	// no second failure toast, and no need for the user to click close again.
	await expect(page.getByRole('button', { name: 'Cancel note edit' })).not.toBeVisible({
		timeout: 3000
	});
	await expect(failureToast).not.toBeVisible();
});

async function login(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL!);
	await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PASSWORD!);
	await page.getByRole('button', { name: 'Continue', exact: true }).click();

	// Wait for navigation after login to complete
	await page.waitForURL(/\/my\/board/, { timeout: 10000 });
}
