import { targetNoteId, type QueuedMutation } from './writeQueueTypes';

// Intermediate reorders are superseded by whichever one queued last for the
// same board - replaying all of them is wasted round-trips for no benefit.
export function coalesceReorders(items: QueuedMutation[]): QueuedMutation[] {
	const latestReorderByBoard = new Map<string, QueuedMutation>();
	for (const item of items) {
		if (item.type === 'reorder') {
			latestReorderByBoard.set(item.boardId, item);
		}
	}

	return items.filter((item) => {
		if (item.type !== 'reorder') {
			return true;
		}
		return latestReorderByBoard.get(item.boardId) === item;
	});
}

// The items to actually send this drain pass, in original queued order -
// everything except further items for a note whose replay already failed
// for a genuine (non-network) reason this pass.
export function nextDrainBatch(
	items: QueuedMutation[],
	pausedNoteIds: ReadonlySet<string>
): QueuedMutation[] {
	return items.filter((item) => {
		const noteId = targetNoteId(item);
		return noteId === null || !pausedNoteIds.has(noteId);
	});
}
