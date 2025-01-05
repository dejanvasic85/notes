import { getContext, setContext } from 'svelte';
import { nanoid } from 'nanoid';

import { type ToastMessage } from '$lib/types';

type ToastMessageWithId = ToastMessage & { id: string; isShown: boolean };

export class ToastMessages {
	messages: ToastMessageWithId[] = $state([]);

	constructor() {}

	addMessage(message: ToastMessage) {
		const id = nanoid();

		this.messages.push({
			...message,
			id,
			isShown: false
		});
	}
}

const ToastMessagesKey = Symbol('ToastMessages');

export function setToastMessages() {
	return setContext(ToastMessagesKey, new ToastMessages());
}

export function getToastMessages() {
	return getContext<ReturnType<typeof setToastMessages>>(ToastMessagesKey);
}
