import { browser } from '$app/environment';

import { skipWaitingMessage } from '$lib/serviceWorkerMessages';

const noop = () => {};

let reloading = false;

function isSupported(): boolean {
	return browser && 'serviceWorker' in navigator;
}

/*
 * Calls back once a newer service worker has finished installing and is sitting
 * in the waiting state.
 *
 * The `controller` check is what separates an update from a first install: on a
 * first visit there is no controller, the worker is not replacing anything, and
 * prompting someone to reload a page that is already current would be nonsense.
 *
 * Returns a cleanup function.
 */
export function watchForAppUpdate(onUpdateReady: () => void): () => void {
	if (!isSupported()) {
		return noop;
	}

	let disposed = false;
	const cleanups: Array<() => void> = [];

	navigator.serviceWorker.getRegistration().then((registration) => {
		if (!registration || disposed) {
			return;
		}

		if (registration.waiting && navigator.serviceWorker.controller) {
			onUpdateReady();
		}

		function handleUpdateFound() {
			const installing = registration?.installing;
			if (!installing || disposed) {
				return;
			}

			function handleStateChange() {
				if (installing?.state === 'installed' && navigator.serviceWorker.controller) {
					onUpdateReady();
				}
			}

			installing.addEventListener('statechange', handleStateChange);
			cleanups.push(() => installing.removeEventListener('statechange', handleStateChange));
		}

		registration.addEventListener('updatefound', handleUpdateFound);
		cleanups.push(() => registration.removeEventListener('updatefound', handleUpdateFound));
	});

	return () => {
		disposed = true;
		for (const cleanup of cleanups) {
			cleanup();
		}
	};
}

/*
 * Hands control to the waiting worker and reloads as soon as it takes over.
 *
 * The reload is not optional: the new worker deletes the previous version's
 * caches when it activates, so a page left running against them would be one
 * navigation away from a missing chunk.
 */
export async function applyAppUpdate(): Promise<void> {
	if (!isSupported()) {
		location.reload();
		return;
	}

	const registration = await navigator.serviceWorker.getRegistration();
	const waiting = registration?.waiting;

	if (!waiting) {
		location.reload();
		return;
	}

	navigator.serviceWorker.addEventListener('controllerchange', () => {
		// `controllerchange` can fire more than once; reloading twice would throw
		// away whatever the first reload had already started.
		if (reloading) {
			return;
		}
		reloading = true;
		location.reload();
	});

	waiting.postMessage({ type: skipWaitingMessage });
}

/*
 * Browsers only check for a new worker on full-page navigations, which a
 * client-side router never performs — so an always-open tab would never learn
 * about a deployment without this.
 */
export async function checkForAppUpdate(): Promise<void> {
	if (!isSupported()) {
		return;
	}

	const registration = await navigator.serviceWorker.getRegistration();
	await registration?.update().catch(() => {
		// Offline, or the check raced a reload; the next navigation retries.
	});
}
