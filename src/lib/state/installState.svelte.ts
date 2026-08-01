import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';

/*
 * Not in lib.dom — `beforeinstallprompt` is a Chromium extension to the
 * install flow. Declared on WindowEventMap so the listener is typed at the
 * call site instead of being cast there.
 */
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent;
	}

	// Safari's own installed-app flag, which predates display-mode.
	interface Navigator {
		standalone?: boolean;
	}
}

export const promptDismissedKey = 'notes:install-dismissed';

const standaloneQuery = '(display-mode: standalone)';
const iosPattern = /iphone|ipad|ipod/i;
// Chrome and Firefox on iOS are still WebKit, but neither can add to the home
// screen, so the Safari-specific instructions would be wrong for them.
const iosOtherBrowserPattern = /crios|fxios|edgios/i;

function readDismissed(): boolean {
	try {
		return localStorage.getItem(promptDismissedKey) === 'true';
	} catch {
		return false;
	}
}

export class InstallState {
	#deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	#installed = $state(false);
	#dismissed = $state(false);
	#isIosSafari = $state(false);

	constructor() {
		if (!browser) {
			return;
		}

		this.#installed = window.matchMedia(standaloneQuery).matches || navigator.standalone === true;
		this.#dismissed = readDismissed();

		const agent = navigator.userAgent;
		this.#isIosSafari =
			iosPattern.test(agent) && !iosOtherBrowserPattern.test(agent) && !this.#installed;

		// Chromium fires this instead of showing its own mini-infobar. Holding on
		// to the event is the only way to trigger the real prompt later, and it is
		// single-use — Chromium fires a fresh one if the user declines.
		window.addEventListener('beforeinstallprompt', (event) => {
			event.preventDefault();
			this.#deferredPrompt = event;
		});

		window.addEventListener('appinstalled', () => {
			this.#installed = true;
			this.#deferredPrompt = null;
		});
	}

	// Chromium can install programmatically; iOS Safari needs the manual steps.
	get canInstall(): boolean {
		return !this.#installed && (this.#deferredPrompt !== null || this.#isIosSafari);
	}

	get needsManualSteps(): boolean {
		return this.#isIosSafari && this.#deferredPrompt === null;
	}

	// Whether to volunteer the prompt, as opposed to offering it in the menu.
	get shouldOfferPrompt(): boolean {
		return this.canInstall && !this.#dismissed;
	}

	dismissPrompt() {
		this.#dismissed = true;
		try {
			localStorage.setItem(promptDismissedKey, 'true');
		} catch {
			/* private browsing throws; the prompt just returns next session */
		}
	}

	async promptInstall(): Promise<void> {
		const deferred = this.#deferredPrompt;
		if (!deferred) {
			return;
		}

		// Consumed either way: a declined prompt cannot be replayed, and Chromium
		// issues a new event if the user becomes eligible again.
		this.#deferredPrompt = null;
		await deferred.prompt();
		const { outcome } = await deferred.userChoice;

		if (outcome === 'accepted') {
			this.#installed = true;
		}
	}
}

const InstallStateKey = Symbol('InstallState');

export function setInstallState() {
	return setContext(InstallStateKey, new InstallState());
}

export function getInstallState() {
	return getContext<ReturnType<typeof setInstallState>>(InstallStateKey);
}
