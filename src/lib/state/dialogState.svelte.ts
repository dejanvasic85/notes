import { getContext, setContext } from 'svelte';

export class DialogState {
	isDialogOpen = $state(false);

	constructor() {}

	showDialog() {
		this.isDialogOpen = true;
	}

	closeDialog() {
		this.isDialogOpen = false;
	}
}

const DialogStateKey = Symbol('DialogState');

export function setDialogState() {
	return setContext(DialogStateKey, new DialogState());
}

export function getDialogState() {
	return getContext<ReturnType<typeof setDialogState>>(DialogStateKey);
}
