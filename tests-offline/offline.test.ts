import { expect, test, type Page } from '@playwright/test';

const assetCachePrefix = 'assets-';
const pageCachePrefix = 'pages-';
const offlineHeading = "You're offline";

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
