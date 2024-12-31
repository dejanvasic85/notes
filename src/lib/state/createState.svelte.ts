import { getContext, setContext } from 'svelte';

export class CreatingState {
	isCreating = $state(false);

	constructor() {}

	setIsCreating(val: boolean) {
		this.isCreating = val;
	}
}

const CreatingStateKey = Symbol('CreatingState');

export function setCreatingState() {
	return setContext(CreatingStateKey, new CreatingState());
}

export function getCreatingState() {
	return getContext<ReturnType<typeof setCreatingState>>(CreatingStateKey);
}
