import { getContext, setContext } from 'svelte';
import { toast } from 'svelte-sonner';
import type { CueName } from '@foleyjs/core';

import { playCue } from '$lib/sound';
import { type ToastAction, type ToastMessage } from '$lib/types';

const defaultActionCue: CueName = 'chime';

export class ToastMessages {
	addMessage(message: ToastMessage) {
		playCue(message.type === 'success' ? 'success' : 'error');
		toast[message.type](message.message);
	}

	// Stays until acted on or dismissed, for messages the user has to decide
	// about rather than simply read.
	//
	// Deliberately the neutral toast rather than `toast.info`: with richColors
	// that renders blue, and the design system has no informational colour —
	// semantic colour is reserved for success, warning and danger.
	addActionMessage(
		message: string,
		action: ToastAction,
		onDismiss?: () => void,
		durationMs: number = Number.POSITIVE_INFINITY,
		cue: CueName = defaultActionCue
	) {
		playCue(cue);
		toast(message, {
			duration: durationMs,
			closeButton: true,
			action: {
				label: action.label,
				onClick: action.onClick
			},
			onDismiss
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
