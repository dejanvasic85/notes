import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { tryFetch, runOptimisticUpdate, NetworkUnavailableError } from './browserFetch';
import type { ToastMessages } from './state/toastMessages.svelte';

function mockToastMessages(): ToastMessages {
	return { addMessage: vi.fn(), addActionMessage: vi.fn() } as unknown as ToastMessages;
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('tryFetch', () => {
	it('resolves ok for a successful response', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"id":1}', { status: 200 })));

		const result = await tryFetch('/api/notes/1', undefined, { shouldParse: true });

		expect(result).toEqual({ type: 'ok', value: { id: 1 } });
	});

	it('resolves a Fail with the status for a non-ok response, without retrying', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response('not found', { status: 404 }));
		vi.stubGlobal('fetch', fetchMock);

		const result = await tryFetch('/api/notes/1');

		expect(result.type).toBe('error');
		expect(result.type === 'error' && result.status).toBe(404);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('resolves a Fail wrapping NetworkUnavailableError instead of rejecting when offline', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		const resultPromise = tryFetch('/api/notes/1');
		await vi.runAllTimersAsync();
		const result = await resultPromise;

		expect(result.type).toBe('error');
		expect(result.type === 'error' && result.value).toBeInstanceOf(NetworkUnavailableError);
	});
});

describe('runOptimisticUpdate', () => {
	it('calls onNetworkUnavailable instead of revert/toast when the network is unreachable', async () => {
		const revert = vi.fn();
		const onNetworkUnavailable = vi.fn();
		const toastMessages = mockToastMessages();

		await runOptimisticUpdate({
			apply: () => 'applied-value',
			request: async () => ({
				type: 'error' as const,
				value: new NetworkUnavailableError('offline')
			}),
			revert,
			onNetworkUnavailable,
			errorMessage: 'Failed',
			toastMessages
		});

		expect(onNetworkUnavailable).toHaveBeenCalledWith('applied-value');
		expect(revert).not.toHaveBeenCalled();
		expect(toastMessages.addMessage).not.toHaveBeenCalled();
	});

	it('still reverts and toasts for a genuine server error', async () => {
		const revert = vi.fn();
		const onNetworkUnavailable = vi.fn();
		const toastMessages = mockToastMessages();

		await runOptimisticUpdate({
			apply: () => 'applied-value',
			request: async () => ({ type: 'error' as const, value: new Error('bad request') }),
			revert,
			onNetworkUnavailable,
			errorMessage: 'Failed',
			toastMessages
		});

		expect(onNetworkUnavailable).not.toHaveBeenCalled();
		expect(revert).toHaveBeenCalledWith('applied-value');
		expect(toastMessages.addMessage).toHaveBeenCalledWith({ type: 'error', message: 'Failed' });
	});
});
