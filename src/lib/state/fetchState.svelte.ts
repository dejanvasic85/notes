import { getContext, setContext } from 'svelte';

type FetchStateType = 'board' | 'friends';
const EXPIRY = 1000 * 60 * 60; // 60 mins

export class FetchState {
	fetchState: Map<FetchStateType, Date> = new Map();

	shouldFetch(type: FetchStateType) {
		const lastFetch = this.fetchState.get(type);
		if (!lastFetch) {
			return true;
		}

		const now = new Date();
		const diff = now.getTime() - lastFetch.getTime();
		return diff > EXPIRY;
	}

	setFetched(type: FetchStateType) {
		this.fetchState.set(type, new Date());
	}

	reset(type: FetchStateType) {
		this.fetchState.delete(type);
	}
}

const FetchStateKey = Symbol('FetchState');

export function setFetchState() {
	return setContext(FetchStateKey, new FetchState());
}

export function getFetchState() {
	return getContext<ReturnType<typeof setFetchState>>(FetchStateKey);
}
