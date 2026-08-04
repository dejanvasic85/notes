import { getContext, onDestroy, setContext } from 'svelte';
import { browser } from '$app/environment';

export class ConnectivityState {
	#online = $state(true);
	#onOnline = () => (this.#online = true);
	#onOffline = () => (this.#online = false);

	constructor() {
		if (!browser) {
			return;
		}

		this.#online = navigator.onLine;
		window.addEventListener('online', this.#onOnline);
		window.addEventListener('offline', this.#onOffline);
	}

	get isOffline() {
		return !this.#online;
	}

	destroy() {
		if (!browser) {
			return;
		}

		window.removeEventListener('online', this.#onOnline);
		window.removeEventListener('offline', this.#onOffline);
	}
}

const ConnectivityStateKey = Symbol('ConnectivityState');

export function setConnectivityState() {
	const connectivityState = new ConnectivityState();
	setContext(ConnectivityStateKey, connectivityState);
	onDestroy(() => connectivityState.destroy());
	return connectivityState;
}

export function getConnectivityState() {
	return getContext<ReturnType<typeof setConnectivityState>>(ConnectivityStateKey);
}
