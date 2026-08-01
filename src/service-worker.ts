/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

// The double assertion is the documented SvelteKit idiom: `self` is already
// declared by lib.webworker as a WorkerGlobalScope, so it cannot be re-declared
// as the narrower ServiceWorkerGlobalScope that exposes `clients` and `skipWaiting`.
const serviceWorker = self as unknown as ServiceWorkerGlobalScope;

// Both caches are keyed by the build version so a deployment can never leave a
// cached page pointing at hashed asset URLs that no longer exist.
const assetCacheName = `assets-${version}`;
const pageCacheName = `pages-${version}`;

const offlineFallbackPath = '/offline.html';
const dataSuffix = '__data.json';
const apiPrefix = '/api/';
const logoutPath = '/api/auth/logout';

const precachedPaths = [...build, ...files];

serviceWorker.addEventListener('install', (event) => {
	// `addAll` is all-or-nothing: if any one asset fails to download the install
	// fails and this version never activates, leaving the previous service worker
	// in place. That is deliberate — a half-populated cache would serve a page
	// whose scripts are missing.
	async function precache() {
		const cache = await caches.open(assetCacheName);
		await cache.addAll(precachedPaths);
	}

	event.waitUntil(precache());
});

serviceWorker.addEventListener('activate', (event) => {
	async function removeStaleCaches() {
		const currentCaches = [assetCacheName, pageCacheName];
		const keys = await caches.keys();
		await Promise.all(
			keys.filter((key) => !currentCaches.includes(key)).map((key) => caches.delete(key))
		);
		await serviceWorker.clients.claim();
	}

	event.waitUntil(removeStaleCaches());
});

serviceWorker.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') {
		return;
	}

	const url = new URL(request.url);
	if (url.origin !== serviceWorker.location.origin) {
		return;
	}

	// Logging out invalidates every cached page, which is where the SSR-rendered
	// user data lives. Purge before handing the request back to the network.
	if (url.pathname === logoutPath) {
		event.waitUntil(caches.delete(pageCacheName));
		return;
	}

	// API traffic is never cached or replayed. A stale `/api/user/board` served
	// as a 200 would look like a successful sync to `refreshFromServer` and
	// overwrite newer local state; an offline failure is the honest answer.
	if (url.pathname.startsWith(apiPrefix)) {
		return;
	}

	event.respondWith(respond(request, url));
});

async function respond(request: Request, url: URL): Promise<Response> {
	if (precachedPaths.includes(url.pathname)) {
		const cache = await caches.open(assetCacheName);
		const precached = await cache.match(url.pathname);
		if (precached) {
			return precached;
		}
	}

	try {
		const response = await fetch(request);

		// Offline, `fetch` can resolve with a non-Response value rather than
		// rejecting, and that cannot be passed to `respondWith`.
		if (!(response instanceof Response)) {
			throw new Error('Invalid response from fetch');
		}

		if (isCacheable(request, url, response)) {
			await cachePage(request, response.clone());
		}

		return response;
	} catch (err) {
		const cached = await matchCachedPage(request);
		if (cached) {
			return cached;
		}

		if (request.mode === 'navigate') {
			const cache = await caches.open(assetCacheName);
			const fallback = await cache.match(offlineFallbackPath);
			if (fallback) {
				return fallback;
			}
		}

		throw err;
	}
}

// Storing a page must never change what this fetch returns: a quota error here
// would otherwise be caught by the caller's offline handler, which would then
// serve a stale page even though a fresh response is in hand.
async function cachePage(request: Request, response: Response): Promise<void> {
	try {
		const cache = await caches.open(pageCacheName);
		await cache.put(request, response);
	} catch {
		// Cache storage may be full or unavailable; the live response still stands.
	}
}

// Only the documents and route payloads that boot the app are worth keeping.
// Redirects are excluded because a redirected response replayed against a
// navigation request is rejected by the browser.
function isCacheable(request: Request, url: URL, response: Response): boolean {
	if (response.status !== 200 || response.redirected) {
		return false;
	}

	if (response.headers.get('cache-control')?.includes('no-store')) {
		return false;
	}

	return request.mode === 'navigate' || url.pathname.endsWith(dataSuffix);
}

async function matchCachedPage(request: Request): Promise<Response | undefined> {
	const cache = await caches.open(pageCacheName);
	const cached = await cache.match(request);

	if (cached?.redirected) {
		return undefined;
	}

	return cached;
}
