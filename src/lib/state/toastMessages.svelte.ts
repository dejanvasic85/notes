import { getContext, setContext } from 'svelte';
import { toast } from 'svelte-sonner';

import { type ToastMessage } from '$lib/types';

export class ToastMessages {
	addMessage(message: ToastMessage) {
		toast[message.type](message.message);
	}
}

const ToastMessagesKey = Symbol('ToastMessages');

export function setToastMessages() {
	return setContext(ToastMessagesKey, new ToastMessages());
}

export function getToastMessages() {
	return getContext<ReturnType<typeof setToastMessages>>(ToastMessagesKey);
}
