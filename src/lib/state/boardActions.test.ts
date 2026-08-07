import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import type { NoteOrdered } from '$lib/types';

import { createBoardActions } from './boardActions';
import type { BoardState } from './boardState.svelte';
import type { ToastMessages } from './toastMessages.svelte';

vi.mock('$lib/browserFetch', async () => {
	const actual = await vi.importActual<typeof import('$lib/browserFetch')>('$lib/browserFetch');
	return { ...actual, tryFetch: vi.fn() };
});

vi.mock('./writeQueue.svelte', () => ({ enqueue: vi.fn() }));

const userId = 'uid_1';
const note: NoteOrdered = {
	id: 'nid_1',
	text: 'hello',
	textPlain: 'hello',
	colour: null,
	boardId: 'bid_1',
	title: null,
	order: 0,
	shared: false
};

function mockBoardState(): BoardState {
	return {
		deleteNoteById: vi.fn().mockReturnValue([note, 0]),
		createNoteAtIndex: vi.fn()
	} as unknown as BoardState;
}

function mockToastMessages(): ToastMessages {
	return { addMessage: vi.fn(), addActionMessage: vi.fn() } as unknown as ToastMessages;
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	vi.clearAllMocks();
});

describe('createBoardActions', () => {
	it('applies the delete and shows an undo toast without calling the network yet', async () => {
		const { tryFetch } = await import('$lib/browserFetch');
		const boardState = mockBoardState();
		const toastMessages = mockToastMessages();
		const { deleteNote } = createBoardActions(boardState, toastMessages, userId);

		deleteNote(note);

		expect(boardState.deleteNoteById).toHaveBeenCalledWith(note.id);
		expect(toastMessages.addActionMessage).toHaveBeenCalledWith(
			'Note deleted',
			expect.objectContaining({ label: 'Undo' }),
			undefined,
			3000
		);
		expect(tryFetch).not.toHaveBeenCalled();
	});

	it('commits the delete over the network once the undo window elapses', async () => {
		const { tryFetch } = await import('$lib/browserFetch');
		vi.mocked(tryFetch).mockResolvedValue({ type: 'ok', value: undefined });
		const boardState = mockBoardState();
		const toastMessages = mockToastMessages();
		const { deleteNote } = createBoardActions(boardState, toastMessages, userId);

		deleteNote(note);
		await vi.advanceTimersByTimeAsync(3000);

		expect(tryFetch).toHaveBeenCalledWith(
			`/api/notes/${note.id}`,
			{ method: 'DELETE' },
			{ shouldParse: false }
		);
	});

	it('undoing before the window elapses restores the note and never hits the network', async () => {
		const { tryFetch } = await import('$lib/browserFetch');
		const boardState = mockBoardState();
		const toastMessages = mockToastMessages();
		const { deleteNote, undoDelete } = createBoardActions(boardState, toastMessages, userId);

		deleteNote(note);
		undoDelete(note.id);
		await vi.advanceTimersByTimeAsync(3000);

		expect(boardState.createNoteAtIndex).toHaveBeenCalledWith(0, note);
		expect(tryFetch).not.toHaveBeenCalled();
	});

	it('enqueues the delete for replay when the network is unavailable', async () => {
		const { tryFetch, NetworkUnavailableError } = await import('$lib/browserFetch');
		const { enqueue } = await import('./writeQueue.svelte');
		vi.mocked(tryFetch).mockResolvedValue({
			type: 'error',
			value: new NetworkUnavailableError('offline')
		});
		const boardState = mockBoardState();
		const toastMessages = mockToastMessages();
		const { deleteNote } = createBoardActions(boardState, toastMessages, userId);

		deleteNote(note);
		await vi.advanceTimersByTimeAsync(3000);

		expect(enqueue).toHaveBeenCalledWith(
			userId,
			expect.objectContaining({ type: 'delete', noteId: note.id })
		);
		expect(boardState.createNoteAtIndex).not.toHaveBeenCalled();
	});

	it('reverts and toasts an error for a genuine (non-network) failure', async () => {
		const { tryFetch } = await import('$lib/browserFetch');
		vi.mocked(tryFetch).mockResolvedValue({ type: 'error', value: new Error('bad request') });
		const boardState = mockBoardState();
		const toastMessages = mockToastMessages();
		const { deleteNote } = createBoardActions(boardState, toastMessages, userId);

		deleteNote(note);
		await vi.advanceTimersByTimeAsync(3000);

		expect(boardState.createNoteAtIndex).toHaveBeenCalledWith(0, note);
		expect(toastMessages.addMessage).toHaveBeenCalledWith({
			type: 'error',
			message: 'Failed to delete note. Try again.'
		});
	});

	it('flushPendingDeletes commits immediately without waiting for the timer', async () => {
		const { tryFetch } = await import('$lib/browserFetch');
		vi.mocked(tryFetch).mockResolvedValue({ type: 'ok', value: undefined });
		const boardState = mockBoardState();
		const toastMessages = mockToastMessages();
		const { deleteNote, flushPendingDeletes } = createBoardActions(
			boardState,
			toastMessages,
			userId
		);

		deleteNote(note);
		flushPendingDeletes();
		await vi.runOnlyPendingTimersAsync();

		expect(tryFetch).toHaveBeenCalledWith(
			`/api/notes/${note.id}`,
			{ method: 'DELETE' },
			{ shouldParse: false }
		);
	});
});
