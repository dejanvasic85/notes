import { targetNoteId, type QueuedMutation } from './writeQueueTypes';

// Keep only the latest queued reorder per board.
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

// Keep only the latest queued content edit per note - autosave enqueues often.
export function coalesceUpdateContent(items: QueuedMutation[]): QueuedMutation[] {
	const latestByNoteId = new Map<string, QueuedMutation>();
	for (const item of items) {
		if (item.type === 'update-content') {
			latestByNoteId.set(item.noteId, item);
		}
	}

	return items.filter((item) => {
		if (item.type !== 'update-content') {
			return true;
		}
		return latestByNoteId.get(item.noteId) === item;
	});
}

// Excludes further items for a note already paused this pass.
export function nextDrainBatch(
	items: QueuedMutation[],
	pausedNoteIds: ReadonlySet<string>
): QueuedMutation[] {
	return items.filter((item) => {
		const noteId = targetNoteId(item);
		return noteId === null || !pausedNoteIds.has(noteId);
	});
}
