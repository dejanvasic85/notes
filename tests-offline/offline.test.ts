import { expect, test, type Page } from '@playwright/test';

const assetCachePrefix = 'assets-';
const pageCachePrefix = 'pages-';
const offlineHeading = "You're offline";
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

// Cached documents hold SSR-rendered user data, so logging out has to drop them.
// The service worker keys this off the request path rather than the session, so
// this needs no session of its own.
test('purges cached pages on logout', async ({ page }) => {
	await openControlledPage(page, '/');
	expect(findCache(await readCacheKeys(page), pageCachePrefix)).toContain('/');

	await page.evaluate(async () => {
		try {
			await fetch('/api/auth/logout');
		} catch {
			// Logout redirects to Auth0, so the request itself fails cross-origin.
			// Only the purge the service worker performs before it matters here.
		}
	});

	// The purge runs in `waitUntil`, so it completes independently of the request.
	await expect
		.poll(async () => findCache(await readCacheKeys(page), pageCachePrefix))
		.not.toContain('/');
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

	const notesBefore = await page.getByRole('button', { name: /^Edit note/ }).count();

	await context.setOffline(true);
	await page.reload();

	await expect(page.getByRole('heading', { name: offlineHeading })).toBeHidden();
	await expect(createButton).toBeVisible();
	expect(await page.getByRole('button', { name: /^Edit note/ }).count()).toBe(notesBefore);
});

async function login(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL!);
	await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PASSWORD!);
	await page.getByRole('button', { name: 'Continue', exact: true }).click();
	await page.waitForURL(/\/my\/board/, { timeout: loginTimeoutMs });
}
