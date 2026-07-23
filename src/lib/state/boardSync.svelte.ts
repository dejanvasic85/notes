import { isWriteQueueIdle, whenWriteQueueIdle } from '$lib/browserFetch';
import {
	getBoardSnapshot,
	setBoardSnapshot,
	getFriendsSnapshot,
	setFriendsSnapshot
} from './localCache';
import type { BoardState } from './boardState.svelte';
import type { FriendsState } from './friendsState.svelte';

const maxReconcileAttempts = 3;
const persistDebounceMs = 400;

// Server is the source of truth, but only apply it when the optimistic
// write queue is idle so in-flight local changes are not clobbered. If a
// write races the fetch, retry so the re-fetch reflects the synced change.
export async function refreshFromServer(boardState: BoardState, friendsState: FriendsState) {
	for (let attempt = 0; attempt < maxReconcileAttempts; attempt++) {
		await whenWriteQueueIdle();

		const [boardResp, friendsResp] = await Promise.all([
			fetch('/api/user/board'),
			fetch('/api/friends')
		]);
		if (!boardResp.ok || !friendsResp.ok) {
			throw new Error(
				`Failed to load data: board ${boardResp.status}, friends ${friendsResp.status}`
			);
		}
		const { board, sharedNotes, sharedNoteOwners } = await boardResp.json();
		const { friends, pendingSentInvites, pendingReceivedInvites } = await friendsResp.json();

		if (!isWriteQueueIdle()) {
			continue;
		}

		boardState.setBoard(board, friends, sharedNotes, sharedNoteOwners);
		friendsState.setState(friends, pendingSentInvites, pendingReceivedInvites);
		return;
	}
	throw new Error('Could not reconcile with server: write queue never became idle');
}

export async function hydrateFromCache(
	userId: string,
	boardState: BoardState,
	friendsState: FriendsState
): Promise<{ boardHydrated: boolean; friendsHydrated: boolean }> {
	if (!userId) {
		return { boardHydrated: false, friendsHydrated: false };
	}

	const [boardSnapshot, friendsSnapshot] = await Promise.all([
		getBoardSnapshot(userId),
		getFriendsSnapshot(userId)
	]);

	const boardHydrated = !!boardSnapshot;
	const friendsHydrated = !!friendsSnapshot;

	if (boardSnapshot) {
		boardState.hydrate(boardSnapshot);
	}
	if (friendsSnapshot) {
		friendsState.hydrateState(friendsSnapshot);
	}

	return { boardHydrated, friendsHydrated };
}

// Persists state to the local cache (debounced) so the next load paints instantly.
// Must be called synchronously during component initialization, since $effect
// registers against the currently-active effect scope.
export function setupLocalCachePersistence(
	userId: string,
	boardState: BoardState,
	friendsState: FriendsState
) {
	$effect(() => {
		const snapshot = $state.snapshot({
			boardId: boardState.boardId,
			noteOrder: boardState.noteOrder,
			notes: boardState.notes,
			friends: boardState.friends
		});

		if (!userId || boardState.loading) {
			return;
		}

		const timer = setTimeout(() => setBoardSnapshot(userId, snapshot), persistDebounceMs);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		const snapshot = $state.snapshot({
			friends: friendsState.friends,
			pendingSentInvites: friendsState.pendingSentInvites,
			pendingReceivedInvites: friendsState.pendingReceivedInvites
		});

		if (!userId || friendsState.loading) {
			return;
		}

		const timer = setTimeout(() => setFriendsSnapshot(userId, snapshot), persistDebounceMs);
		return () => clearTimeout(timer);
	});
}
