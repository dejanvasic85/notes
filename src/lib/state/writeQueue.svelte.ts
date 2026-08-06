import { get, set } from 'idb-keyval';
import { onDestroy } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { browser } from '$app/environment';

import { tryFetch, NetworkUnavailableError } from '$lib/browserFetch';
import type { Board, Note } from '$lib/types';

import { queueKey } from './localCacheKeys';
import { coalesceReorders, nextDrainBatch } from './writeQueue';
import { targetNoteId, type QueuedMutation } from './writeQueueTypes';

// Notes paused after a genuine replay failure - read by OfflineIndicator.
export const pausedNoteIds = new SvelteSet<string>();

// True while a drain pass is actively replaying - read by OfflineIndicator.
export const drainState = $state({ isDraining: false });

async function readQueue(userId: string): Promise<QueuedMutation[]> {
	if (!browser) {
		return [];
	}
	try {
		return (await get<QueuedMutation[]>(queueKey(userId))) ?? [];
	} catch {
		return [];
	}
}

async function writeQueueItems(userId: string, items: QueuedMutation[]): Promise<void> {
	if (!browser) {
		return;
	}
	try {
		await set(queueKey(userId), items);
	} catch {
		// IndexedDB unavailable; mutation only survives this session.
	}
}

// Serializes enqueue/drain so concurrent read-modify-writes can't clobber each other.
let queueOpChain: Promise<unknown> = Promise.resolve();

function withQueueLock<T>(operation: () => Promise<T>): Promise<T> {
	const result = queueOpChain.then(operation, operation);
	queueOpChain = result.catch(() => undefined);
	return result;
}

export function enqueue(userId: string, mutation: QueuedMutation): Promise<void> {
	return withQueueLock(async () => {
		const items = await readQueue(userId);
		items.push(mutation);
		await writeQueueItems(userId, items);
	});
}

function replay(mutation: QueuedMutation) {
	switch (mutation.type) {
		case 'create':
			return tryFetch<Note>('/api/notes', {
				method: 'POST',
				body: JSON.stringify(mutation.note)
			});
		case 'update-content':
			return tryFetch<Note>(`/api/notes/${mutation.noteId}`, {
				method: 'PATCH',
				body: JSON.stringify({
					text: mutation.text,
					textPlain: mutation.textPlain,
					title: mutation.title,
					contentUpdatedAt: new Date(mutation.contentUpdatedAt)
				})
			});
		case 'update-colour':
			return tryFetch<Note>(`/api/notes/${mutation.noteId}`, {
				method: 'PATCH',
				body: JSON.stringify({
					colour: mutation.colour,
					colourUpdatedAt: new Date(mutation.colourUpdatedAt)
				})
			});
		case 'delete':
			return tryFetch(
				`/api/notes/${mutation.noteId}`,
				{ method: 'DELETE' },
				{ shouldParse: false }
			);
		case 'reorder':
			return tryFetch<Board>(`/api/board/${mutation.boardId}`, {
				method: 'PATCH',
				body: JSON.stringify({ noteOrder: mutation.noteOrder })
			});
	}
}

// Replays sequentially for causal order; a network failure aborts the pass.
export function drain(userId: string): Promise<{ drainedAny: boolean }> {
	return withQueueLock(async () => {
		if (!browser) {
			return { drainedAny: false };
		}

		const queued = coalesceReorders(await readQueue(userId));
		const batch = nextDrainBatch(queued, pausedNoteIds);

		if (batch.length === 0) {
			return { drainedAny: false };
		}

		drainState.isDraining = true;
		try {
			const remaining = new Set(queued);
			let drainedAny = false;

			for (const mutation of batch) {
				const result = await replay(mutation);

				if (result.type === 'ok') {
					remaining.delete(mutation);
					drainedAny = true;
					continue;
				}

				// 404 on delete = already gone, treat as success.
				if (mutation.type === 'delete' && result.status === 404) {
					remaining.delete(mutation);
					drainedAny = true;
					continue;
				}

				if (result.value instanceof NetworkUnavailableError) {
					break;
				}

				const noteId = targetNoteId(mutation);
				if (noteId) {
					pausedNoteIds.add(noteId);
				}
			}

			await writeQueueItems(
				userId,
				queued.filter((item) => remaining.has(item))
			);
			return { drainedAny };
		} finally {
			drainState.isDraining = false;
		}
	});
}

export function clearPausedNotes(): void {
	pausedNoteIds.clear();
}

// Call during component initialization - registers an onDestroy cleanup.
export function registerReplayOnReconnect(userId: string, onDrained: () => void): void {
	if (!browser) {
		return;
	}

	const handleOnline = async () => {
		try {
			const result = await drain(userId);
			if (result.drainedAny) {
				onDrained();
			}
		} catch (err) {
			console.error('Error draining write queue:', err);
		}
	};

	window.addEventListener('online', handleOnline);
	onDestroy(() => window.removeEventListener('online', handleOnline));

	if (navigator.onLine) {
		handleOnline();
	}
}
