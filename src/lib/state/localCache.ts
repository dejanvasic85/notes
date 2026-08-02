import { get, set } from 'idb-keyval';
import { browser } from '$app/environment';

import { boardKey, friendsKey } from './localCacheKeys';
import type { NoteOrdered, Friend, UserInvite, UserInviteWithUserProps } from '$lib/types';

const snapshotVersion = 1;

export interface BoardSnapshot {
	version: number;
	boardId: string;
	noteOrder: string[];
	notes: NoteOrdered[];
	friends: Friend[];
}

export interface FriendsSnapshot {
	version: number;
	friends: Friend[];
	pendingSentInvites: UserInvite[];
	pendingReceivedInvites: UserInviteWithUserProps[];
}

async function readSnapshot<T extends { version: number }>(key: string): Promise<T | undefined> {
	if (!browser) {
		return undefined;
	}
	try {
		const snapshot = await get<T>(key);
		if (!snapshot || snapshot.version !== snapshotVersion) {
			return undefined;
		}
		return snapshot;
	} catch {
		return undefined;
	}
}

async function writeSnapshot(key: string, snapshot: unknown): Promise<void> {
	if (!browser) {
		return;
	}
	try {
		await set(key, snapshot);
	} catch {
		// IndexedDB may be unavailable (private mode, quota); degrade to no cache.
	}
}

export function getBoardSnapshot(userId: string): Promise<BoardSnapshot | undefined> {
	return readSnapshot<BoardSnapshot>(boardKey(userId));
}

export function setBoardSnapshot(
	userId: string,
	snapshot: Omit<BoardSnapshot, 'version'>
): Promise<void> {
	return writeSnapshot(boardKey(userId), { version: snapshotVersion, ...snapshot });
}

export function getFriendsSnapshot(userId: string): Promise<FriendsSnapshot | undefined> {
	return readSnapshot<FriendsSnapshot>(friendsKey(userId));
}

export function setFriendsSnapshot(
	userId: string,
	snapshot: Omit<FriendsSnapshot, 'version'>
): Promise<void> {
	return writeSnapshot(friendsKey(userId), { version: snapshotVersion, ...snapshot });
}

/*
 * Snapshots are cleared by the service worker when it sees the logout request
 * (see src/service-worker.ts), not from here: logout is a plain link to
 * /api/auth/logout in two places, and an async delete started during a
 * navigation away is not guaranteed to finish.
 */
