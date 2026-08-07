import { NetworkUnavailableError, tryFetch } from '$lib/browserFetch';
import { generateId } from '$lib/identityGenerator';
import type { NoteOrdered } from '$lib/types';

import type { BoardState } from './boardState.svelte';
import type { ToastMessages } from './toastMessages.svelte';
import { enqueue } from './writeQueue.svelte';

const undoWindowMs = 3000;
const undoActionLabel = 'Undo';
const deletedMessage = 'Note deleted';
const deleteFailedMessage = 'Failed to delete note. Try again.';

type PendingDelete = {
	note: NoteOrdered;
	index: number;
	timeoutId: ReturnType<typeof setTimeout>;
};

export function createBoardActions(
	boardState: BoardState,
	toastMessages: ToastMessages,
	userId: string
) {
	const pendingDeletes = new Map<string, PendingDelete>();

	async function commitDelete(noteId: string, note: NoteOrdered, index: number) {
		const result = await tryFetch(
			`/api/notes/${noteId}`,
			{ method: 'DELETE' },
			{ shouldParse: false }
		);

		if (result.type !== 'error') {
			return;
		}

		if (result.value instanceof NetworkUnavailableError) {
			enqueue(userId, {
				id: generateId('qm'),
				type: 'delete',
				noteId,
				queuedAt: Date.now()
			});
			return;
		}

		boardState.createNoteAtIndex(index, note);
		toastMessages.addMessage({ type: 'error', message: deleteFailedMessage });
	}

	function deleteNote(note: NoteOrdered) {
		const [deletedNote, index] = boardState.deleteNoteById(note.id);

		const timeoutId = setTimeout(() => {
			pendingDeletes.delete(note.id);
			commitDelete(note.id, deletedNote, index);
		}, undoWindowMs);

		pendingDeletes.set(note.id, { note: deletedNote, index, timeoutId });

		toastMessages.addActionMessage(
			deletedMessage,
			{ label: undoActionLabel, onClick: () => undoDelete(note.id) },
			undefined,
			undoWindowMs
		);
	}

	function undoDelete(noteId: string) {
		const pending = pendingDeletes.get(noteId);
		if (!pending) {
			return;
		}
		clearTimeout(pending.timeoutId);
		pendingDeletes.delete(noteId);
		boardState.createNoteAtIndex(pending.index, pending.note);
	}

	// Called on component teardown so a pending delete can't be silently
	// dropped, leaving the note removed locally but never deleted server-side.
	function flushPendingDeletes() {
		for (const [noteId, pending] of pendingDeletes) {
			clearTimeout(pending.timeoutId);
			pendingDeletes.delete(noteId);
			commitDelete(noteId, pending.note, pending.index);
		}
	}

	return { deleteNote, undoDelete, flushPendingDeletes };
}
