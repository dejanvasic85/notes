import type { ToastMessages } from './state/toastMessages.svelte';
import type { ToastMessage } from './types';

interface FetchOptions {
	shouldParse?: boolean;
	clearQueueOnError?: boolean; // New option
}

interface Success<T> {
	type: 'ok';
	value: T;
}

interface Fail {
	type: 'error';
	value: Error;
	status?: number;
}

export type Result<T> = Success<T> | Fail;

export function success<T>(value: T): Success<T> {
	return {
		type: 'ok',
		value
	};
}

export function fail(message: string, status?: number): Fail {
	return {
		type: 'error',
		value: new Error(message),
		status
	};
}

// fetch() never got a response - offline, DNS failure, captive portal.
export class NetworkUnavailableError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'NetworkUnavailableError';
	}
}

const maxRetries = 3;
const retryDelay = 200;
const defaultIdleTimeout = 8000;
let queueTail: Promise<unknown> = Promise.resolve();
let pending = 0;

export function isWriteQueueIdle(): boolean {
	return pending === 0;
}

// Resolves when the write queue drains, or after `timeoutMs` so a hung request
// (fetch has no built-in timeout) can never block the caller indefinitely.
export async function whenWriteQueueIdle(timeoutMs = defaultIdleTimeout): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (pending > 0) {
		const remaining = deadline - Date.now();
		if (remaining <= 0) {
			return;
		}
		let timer: ReturnType<typeof setTimeout> | undefined;
		const timeout = new Promise<void>((resolve) => {
			timer = setTimeout(resolve, remaining);
		});
		await Promise.race([queueTail.catch(() => undefined), timeout]);
		clearTimeout(timer);
	}
}

async function fetchWithRetry(
	func: () => Promise<Response>,
	retryCount = 0
): Promise<Result<Response>> {
	try {
		const response = await func();
		// Retry server errors (500+)
		if (!response.ok && response.status >= 500 && retryCount < maxRetries) {
			await new Promise((resolve) => setTimeout(resolve, retryDelay));
			return fetchWithRetry(func, retryCount + 1);
		}

		return success(response);
	} catch (err: unknown) {
		if (retryCount < maxRetries) {
			await new Promise((resolve) => setTimeout(resolve, retryDelay));
			return fetchWithRetry(func, retryCount + 1);
		}
		return {
			type: 'error',
			value: new NetworkUnavailableError('Network unavailable after retries', { cause: err })
		};
	}
}

export async function tryFetch<T>(
	input: URL | RequestInfo,
	init?: RequestInit,
	options?: FetchOptions
): Promise<Result<T>> {
	const shouldParse = options?.shouldParse ?? false;
	const clearQueueOnError = options?.clearQueueOnError ?? false;

	pending++;
	const thisRequest: Promise<Result<T>> = queueTail
		.then(async (): Promise<Result<T>> => {
			const fetchResult = await fetchWithRetry(() =>
				fetch(input, {
					...init,
					headers: {
						'Content-Type': 'application/json',
						...init?.headers
					}
				})
			);

			if (fetchResult.type === 'error') {
				return fetchResult;
			}

			const resp = fetchResult.value;
			if (!resp.ok) {
				const rawText = await resp.text().catch(() => resp.statusText);
				return fail(rawText, resp.status);
			}

			if (shouldParse) {
				// Malformed body must resolve to a Fail, not reject.
				try {
					return success((await resp.json()) as T);
				} catch {
					return fail('Malformed response body', resp.status);
				}
			} else {
				return success(resp as T);
			}
		})
		.finally(() => {
			pending--;
		});

	// Guard by identity so a newer tryFetch call's tail isn't clobbered.
	const tail = thisRequest
		.then((result) => {
			if (
				clearQueueOnError &&
				result.type === 'error' &&
				result.value instanceof NetworkUnavailableError &&
				queueTail === tail
			) {
				queueTail = Promise.resolve();
			}
		})
		.catch(() => undefined);
	queueTail = tail;

	return thisRequest;
}

interface OptimisticUpdateParams<TApplied, TResult extends Result<unknown>> {
	apply: () => TApplied;
	request: (applied: TApplied) => Promise<TResult>;
	revert: (applied: TApplied) => void;
	errorMessage: string;
	successMessage?: string;
	toastMessages: ToastMessages;
	// Called instead of revert/toast when offline - caller should queue the mutation.
	onNetworkUnavailable?: (applied: TApplied) => void;
}

// Runs an optimistic local mutation, then reverts it and shows a toast if the
// matching request fails, or shows a success toast if one was requested.
// Returns the request result so callers can layer extra success-only
// behaviour (e.g. navigation) on top.
export async function runOptimisticUpdate<TApplied, TResult extends Result<unknown>>({
	apply,
	request,
	revert,
	errorMessage,
	successMessage,
	toastMessages,
	onNetworkUnavailable
}: OptimisticUpdateParams<TApplied, TResult>): Promise<TResult> {
	const applied = apply();
	const result = await request(applied);

	if (result.type === 'error') {
		if (onNetworkUnavailable && result.value instanceof NetworkUnavailableError) {
			onNetworkUnavailable(applied);
			return result;
		}

		revert(applied);
		const errorMessageValue: ToastMessage = { type: 'error', message: errorMessage };
		toastMessages.addMessage(errorMessageValue);
	} else if (successMessage) {
		const successMessageValue: ToastMessage = { type: 'success', message: successMessage };
		toastMessages.addMessage(successMessageValue);
	}

	return result;
}
