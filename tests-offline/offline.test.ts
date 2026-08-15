import { expect, test, type Page } from '@playwright/test';

const assetCachePrefix = 'assets-';
const pageCachePrefix = 'pages-';
const offlineHeading = "You're offline";
const offlineIndicatorLabel = "You're offline. Changes will sync once you're back online.";
const boardPath = '/my/board';
const loginTimeoutMs = 15_000;
// localCache.ts keys board snapshots as `board:<userId>`.
const boardKeyMatcher = expect.stringMatching(/^board:/);

/*
 * idb-keyval's default database and store names. Hardcoded rather than imported
 * because this runs in the page, outside the app bundle — if the library ever
 * renames them this fails loudly, which is the point.
 */
const idbName = 'keyval-store';
const idbStore = 'keyval';
// Written directly rather than by the app, so the logout purge has something
// deterministic to clear without needing a signed-in board first.
const snapshotKey = 'board:test-user';

function readSnapshotKeys(page: Page): Promise<string[]> {
	return page.evaluate(
		({ idbName, idbStore }) =>
			new Promise<string[]>((resolve) => {
				const open = indexedDB.open(idbName);
				open.onerror = () => resolve([]);
				open.onsuccess = () => {
					if (!open.result.objectStoreNames.contains(idbStore)) {
						resolve([]);
						return;
					}
					const request = open.result
						.transaction(idbStore, 'readonly')
						.objectStore(idbStore)
						.getAllKeys();
					request.onerror = () => resolve([]);
					request.onsuccess = () => resolve(request.result.map(String));
				};
			}),
		{ idbName, idbStore }
	);
}

// The first navigation to an origin is not intercepted, because the service
// worker only starts controlling the page once it has activated. Reloading
// gives us a controlled page whose document lands in the page cache.
async function openControlledPage(page: Page, path: string) {
	await page.goto(path);
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await page.reload();
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

function readCacheKeys(page: Page) {
	return page.evaluate(async () => {
		const entries: Record<string, string[]> = {};
		for (const key of await caches.keys()) {
			const cache = await caches.open(key);
			const requests = await cache.keys();
			entries[key] = requests.map((request) => new URL(request.url).pathname);
		}
		return entries;
	});
}

function findCache(entries: Record<string, string[]>, prefix: string): string[] {
	const key = Object.keys(entries).find((name) => name.startsWith(prefix));
	return key ? entries[key] : [];
}

function withStore<T>(
	page: Page,
	mode: IDBTransactionMode,
	run: string,
	key: string,
	value?: unknown
) {
	return page.evaluate(
		({ idbName, idbStore, mode, run, key, value }) =>
			new Promise<T | undefined>((resolve, reject) => {
				const open = indexedDB.open(idbName);
				open.onupgradeneeded = () => open.result.createObjectStore(idbStore);
				open.onerror = () => reject(open.error);
				open.onsuccess = () => {
					const store = open.result.transaction(idbStore, mode).objectStore(idbStore);
					const request = run === 'put' ? store.put(value, key) : store.get(key);
					request.onerror = () => reject(request.error);
					request.onsuccess = () => resolve(request.result as T | undefined);
				};
			}),
		{ idbName, idbStore, mode, run, key, value }
	);
}

function writeSnapshotKey(page: Page, key: string, value: string) {
	return withStore<void>(page, 'readwrite', 'put', key, value);
}

function readSnapshotKey(page: Page, key: string) {
	return withStore<string>(page, 'readonly', 'get', key);
}

test('precaches the built app and the offline fallback on first visit', async ({ page }) => {
	await openControlledPage(page, '/');

	const assets = findCache(await readCacheKeys(page), assetCachePrefix);

	expect(assets).toContain('/offline.html');
	expect(assets.some((path) => path.startsWith('/_app/immutable'))).toBe(true);
});

test('renders a previously visited page while offline', async ({ page, context }) => {
	await openControlledPage(page, '/');
	expect(findCache(await readCacheKeys(page), pageCachePrefix)).toContain('/');

	await context.setOffline(true);
	await page.reload();

	await expect(page.getByRole('heading', { name: 'Take Notes Privately' })).toBeVisible();
	await expect(page.getByRole('heading', { name: offlineHeading })).toBeHidden();
});

test('falls back to the offline page for a route that was never cached', async ({
	page,
	context
}) => {
	await openControlledPage(page, '/');

	await context.setOffline(true);
	await page.goto('/privacy');

	await expect(page.getByRole('heading', { name: offlineHeading })).toBeVisible();
});

// A cached API response would look like a successful sync to `refreshFromServer`
// and overwrite newer local state, so the service worker must never serve one.
test('never serves API responses from the cache', async ({ page, context }) => {
	await openControlledPage(page, '/');

	await context.setOffline(true);
	const apiReachable = await page.evaluate(async () => {
		try {
			await fetch('/api/user/board');
			return true;
		} catch {
			return false;
		}
	});

	expect(apiReachable).toBe(false);
	expect(findCache(await readCacheKeys(page), pageCachePrefix)).not.toContain('/api/user/board');
});

// Logging out must leave nothing on the device: cached documents hold
// SSR-rendered user data and the IndexedDB snapshots hold the notes themselves.
// The service worker keys this off the request path rather than the session, so
// this needs no session of its own.
test('purges cached pages and stored snapshots on logout', async ({ page }) => {
	await openControlledPage(page, '/');
	expect(findCache(await readCacheKeys(page), pageCachePrefix)).toContain('/');

	await writeSnapshotKey(page, snapshotKey, 'cached notes');
	expect(await readSnapshotKey(page, snapshotKey)).toBe('cached notes');

	await page.evaluate(async () => {
		try {
			await fetch('/api/auth/logout');
		} catch {
			// Logout redirects to Auth0, so the request itself fails cross-origin.
			// Only the purge the service worker performs before it matters here.
		}
	});

	// Both purges run in `waitUntil`, independently of the request itself.
	await expect
		.poll(async () => findCache(await readCacheKeys(page), pageCachePrefix))
		.not.toContain('/');
	await expect.poll(() => readSnapshotKey(page, snapshotKey)).toBeUndefined();
});

/*
 * The whole point of #788: the board is what people actually open offline, and
 * it is the one path the unauthenticated tests above cannot reach.
 *
 * Board state hydrates from IndexedDB (localCache.ts) rather than from the
 * document, so this waits for that snapshot to be written before cutting the
 * network — otherwise the page would render from cache with an empty board and
 * the assertion would pass for the wrong reason.
 */
test('renders the authenticated board while offline', async ({ page, context }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await page.reload();
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

	const createButton = page.getByRole('button', { name: 'Create a new note' });
	await expect(createButton).toBeVisible();

	expect(findCache(await readCacheKeys(page), pageCachePrefix)).toContain(boardPath);
	await expect
		.poll(() => readSnapshotKeys(page))
		.toEqual(expect.arrayContaining([boardKeyMatcher]));

	const notes = page.getByRole('button', { name: /^Edit note/ });
	const notesBefore = await notes.count();

	/*
	 * Without this the comparison below is vacuous: an offline reload that
	 * hydrated nothing would render zero notes and still match a zero baseline.
	 * The account this suite signs in as is expected to hold at least one note.
	 */
	expect(notesBefore).toBeGreaterThan(0);
	const firstNoteLabel = await notes.first().getAttribute('aria-label');

	await context.setOffline(true);
	await page.reload();

	await expect(page.getByRole('heading', { name: offlineHeading })).toBeHidden();
	await expect(createButton).toBeVisible();
	expect(await notes.count()).toBe(notesBefore);

	// The cached document renders an empty board — the notes themselves only
	// exist in IndexedDB — so matching content proves hydration actually ran.
	expect(await notes.first().getAttribute('aria-label')).toBe(firstNoteLabel);
});

// Unlike the service-worker cases above, `online`/`offline` are live browser
// events - no reload needed to see the header indicator react.
test('shows and clears the header offline indicator as connectivity changes', async ({
	page,
	context
}) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	const indicator = page.getByText(offlineIndicatorLabel);
	await expect(indicator).toBeHidden();

	await context.setOffline(true);
	await expect(indicator).toBeVisible();

	await context.setOffline(false);
	await expect(indicator).toBeHidden();
});

// Strip the board: prefix to get the real signed-in user's id.
async function getSignedInUserId(page: Page): Promise<string> {
	await expect
		.poll(() => readSnapshotKeys(page))
		.toEqual(expect.arrayContaining([boardKeyMatcher]));
	const keys = await readSnapshotKeys(page);
	const boardSnapshotKey = keys.find((key) => key.startsWith('board:'))!;
	return boardSnapshotKey.slice('board:'.length);
}

// Creates a fresh note rather than opening whichever one is first on the
// board: this account's notes are shared with every other suite that signs
// in as the same test user (including concurrent CI jobs), so grabbing "the
// first note" is a real cross-test interference risk, not just a theoretical
// one - see #882.
async function createIsolatedNote(page: Page) {
	await page.getByRole('button', { name: 'Create a new note' }).click();
	const titleInput = page.getByPlaceholder('Title');
	await expect(titleInput).toBeVisible();
	const noteId = new URL(page.url()).searchParams.get('id')!;
	return { titleInput, noteId };
}

test('queues a note edit made offline and replays it once back online', async ({
	page,
	context
}) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	const userId = await getSignedInUserId(page);
	const { titleInput, noteId } = await createIsolatedNote(page);
	const queueKey = `queue:${userId}`;

	await context.setOffline(true);

	const offlineTitle = `Offline edit ${Date.now()}`;
	await titleInput.fill(offlineTitle);
	// No Save button — autosave enqueues this automatically after the debounce.

	await expect(page.getByText('Failed to update note')).toBeHidden();
	await expect
		.poll(() => withStore<{ type: string; title: string }[]>(page, 'readonly', 'get', queueKey))
		.toEqual(
			expect.arrayContaining([
				expect.objectContaining({ type: 'update-content', title: offlineTitle })
			])
		);

	await context.setOffline(false);

	await expect.poll(() => withStore(page, 'readonly', 'get', queueKey)).toEqual([]);

	const serverNote = await page.request.get(`/api/notes/${noteId}`);
	expect((await serverNote.json()).title).toBe(offlineTitle);
});

test('a stale offline edit loses to a newer server-side edit on the same field group', async ({
	page,
	context
}) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	const userId = await getSignedInUserId(page);
	const { titleInput, noteId } = await createIsolatedNote(page);
	const queueKey = `queue:${userId}`;

	await context.setOffline(true);

	const staleTitle = `Stale offline edit ${Date.now()}`;
	await titleInput.fill(staleTitle);
	// No Save button — autosave enqueues this automatically after the debounce.

	await expect
		.poll(() => withStore<{ type: string }[]>(page, 'readonly', 'get', queueKey))
		.toEqual(expect.arrayContaining([expect.objectContaining({ type: 'update-content' })]));

	// page.request bypasses context.setOffline, simulating another device.
	const winningTitle = `Server wins ${Date.now()}`;
	await page.request.patch(`/api/notes/${noteId}`, {
		data: { title: winningTitle, contentUpdatedAt: new Date().toISOString() }
	});

	await context.setOffline(false);

	await expect.poll(() => withStore(page, 'readonly', 'get', queueKey)).toEqual([]);
	await expect(page.getByText("Some changes couldn't be synced.")).toBeHidden();

	const finalNote = await page.request.get(`/api/notes/${noteId}`);
	expect((await finalNote.json()).title).toBe(winningTitle);
});

test('does not replay a later mutation for a note that already failed genuinely in the same drain pass', async ({
	page,
	context
}) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await login(page);

	const userId = await getSignedInUserId(page);
	const queueKey = `queue:${userId}`;
	const missingNoteId = 'nid_does_not_exist_regression_test';
	const now = Date.now();

	// Seeded directly, bypassing the UI: an update on a note that doesn't
	// exist 404s (a genuine failure), and a queued delete for the same note
	// must not replay in this pass - a 404 on delete is normally treated as
	// success, so the old bug would remove it from the queue here.
	await withStore(page, 'readwrite', 'put', queueKey, [
		{
			id: 'qm_regression_1',
			type: 'update-content',
			noteId: missingNoteId,
			text: 'x',
			textPlain: 'x',
			title: 'x',
			contentUpdatedAt: now,
			queuedAt: now
		},
		{ id: 'qm_regression_2', type: 'delete', noteId: missingNoteId, queuedAt: now + 1 }
	]);

	await context.setOffline(true);
	await context.setOffline(false);

	await expect
		.poll(() => withStore<{ id: string }[]>(page, 'readonly', 'get', queueKey))
		.toEqual([
			expect.objectContaining({ id: 'qm_regression_1' }),
			expect.objectContaining({ id: 'qm_regression_2' })
		]);
});

async function login(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL!);
	await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PASSWORD!);
	await page.getByRole('button', { name: 'Continue', exact: true }).click();
	await page.waitForURL(/\/my\/board/, { timeout: loginTimeoutMs });
}
