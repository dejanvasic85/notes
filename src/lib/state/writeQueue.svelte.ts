import { get, set } from 'idb-keyval';
import { onDestroy } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { browser } from '$app/environment';

import { tryFetch, NetworkUnavailableError } from '$lib/browserFetch';
import type { Board, Note } from '$lib/types';

import { queueKey } from './localCacheKeys';
import { coalesceReorders, nextDrainBatch } from './writeQueueLogic';
import { targetNoteId, type QueuedMutation } from './writeQueueTypes';

// Notes whose queued replay failed for a genuine (non-network) reason this
// session - read reactively by OfflineIndicator to show a "sync failed" state.
// $state(new Set()) would not do: Svelte's deep-proxy only covers arrays and
// plain objects, not built-in classes like Set, so mutations wouldn't be
// tracked - SvelteSet is the reactive implementation for this case.
export const pausedNoteIds = new SvelteSet<string>();

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
		// IndexedDB may be unavailable (private mode, quota); the mutation only
		// survives for this in-memory session.
	}
}

/*
 * enqueue() and drain() both do a read-modify-write over the same persisted
 * array. Without serializing them, two calls close together (e.g. saving a
 * title then immediately picking a colour while offline, or an enqueue
 * landing mid-drain) can interleave their reads and writes so one silently
 * overwrites the other's addition - exactly the data loss this module exists
 * to prevent. Chaining every operation onto this promise, mirroring
 * browserFetch.ts's own queueTail, keeps them strictly sequential.
 */
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

// Replays the queue strictly sequentially - required so a queued
// create-then-update-then-delete chain on the same note replays in the
// order it happened. A genuine (non-network) failure pauses further items
// for that note only; a network failure means we went offline again
// mid-pass, so the rest of this pass is abandoned for the next reconnect.
export function drain(userId: string): Promise<{ drainedAny: boolean }> {
	return withQueueLock(async () => {
		if (!browser) {
			return { drainedAny: false };
		}

		const queued = coalesceReorders(await readQueue(userId));
		const batch = nextDrainBatch(queued, pausedNoteIds);
		const remaining = new Set(queued);
		let drainedAny = false;

		for (const mutation of batch) {
			const result = await replay(mutation);

			if (result.type === 'ok') {
				remaining.delete(mutation);
				drainedAny = true;
				continue;
			}

			// Already gone - another device's delete beat us to it. Treat as done.
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
	});
}

export function clearPausedNotes(): void {
	pausedNoteIds.clear();
}

// Drains on reconnect (own `online` listener, independent of ConnectivityState
// so the indicator and the queue stay separately testable) and once up front
// if already online - covers reopening the app after being closed offline.
export function registerReplayOnReconnect(userId: string, onDrained: () => void): void {
	if (!browser) {
		return;
	}

	const handleOnline = () => {
		drain(userId).then((result) => {
			if (result.drainedAny) {
				onDrained();
			}
		});
	};

	window.addEventListener('online', handleOnline);
	onDestroy(() => window.removeEventListener('online', handleOnline));

	if (navigator.onLine) {
		handleOnline();
	}
}
