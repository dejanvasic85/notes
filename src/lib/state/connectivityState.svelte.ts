import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';

export class ConnectivityState {
	#online = $state(true);

	constructor() {
		if (!browser) {
			return;
		}

		this.#online = navigator.onLine;
		window.addEventListener('online', () => (this.#online = true));
		window.addEventListener('offline', () => (this.#online = false));
	}

	get isOffline() {
		return !this.#online;
	}
}

const ConnectivityStateKey = Symbol('ConnectivityState');

export function setConnectivityState() {
	return setContext(ConnectivityStateKey, new ConnectivityState());
}

export function getConnectivityState() {
	return getContext<ReturnType<typeof setConnectivityState>>(ConnectivityStateKey);
}
