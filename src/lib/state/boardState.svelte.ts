import { getContext, setContext } from 'svelte';

import type {
	Board,
	NoteOrdered,
	Friend,
	Note,
	ToggleFriendShare,
	NoteOwner,
	NoteWithOwner
} from '$lib/types';
import { generateId } from '$lib/identityGenerator';

export class BoardState {
	boardId: string = $state('');
	noteOrder: string[] = $state([]);
	notes: NoteOrdered[] = $state([]);
	friends: Friend[] = $state([]);

	constructor() {}

	setBoard(board: Board, friends: Friend[], sharedNotes: Note[], sharedNoteOwners: NoteOwner[]) {
		const allNotes = [...board.notes, ...sharedNotes];
		this.boardId = board.id;
		this.noteOrder = this.consolodateNoteOrder(board.noteOrder, allNotes);
		this.notes = mapToOrderedNotes(
			this.noteOrder,
			mapToNotesWithOwners(allNotes, sharedNoteOwners)
		);
		this.friends = friends;
	}

	reset() {
		this.boardId = '';
		this.noteOrder = [];
		this.notes = [];
		this.friends = [];
	}

	createNewNote(textPlain = '') {
		const id = generateId('nid');
		const newNote: Note = {
			id,
			text: textPlain,
			textPlain,
			boardId: this.boardId,
			colour: null,
			title: null
		};
		this.notes.push({ ...newNote, order: this.notes.length, editors: [], shared: false });
		this.noteOrder.push(id);
		return newNote;
	}

	createNoteAtIndex(index: number, note: NoteOrdered) {
		this.notes.splice(index, 0, { ...note, order: index });
		this.noteOrder.splice(index, 0, note.id);
	}

	deleteNoteById(id: string): [NoteOrdered, number] {
		const noteToDelete = this.notes.find((n) => n.id === id);
		const index = this.noteOrder.indexOf(id);
		if (index === -1 || !noteToDelete) {
			throw new Error('Note not found');
		}
		this.notes = this.notes.filter((n) => n.id !== id);
		return [noteToDelete, index];
	}

	toggleFriendShare({ friendUserId, noteId, selected, id }: ToggleFriendShare) {
		const note = this.notes.find((n) => n.id === noteId);
		const friend = this.friends.find((f) => f.id === friendUserId);
		if (!note || !friend) {
			throw new Error('Note or friend not found');
		}

		const currentEditors = note.editors ?? [];
		let noteEditor = currentEditors.find((e) => e.id === id);
		if (noteEditor) {
			noteEditor.selected = selected;
		} else {
			const newId = generateId('ned');
			noteEditor = { id: newId, userId: friendUserId, selected, noteId };
			currentEditors.push(noteEditor);
		}

		return noteEditor;
	}

	updateNote(note: NoteOrdered) {
		const noteToUpdate = this.notes.find((n) => n.id === note.id);
		if (!noteToUpdate) {
			throw new Error('Note not found');
		}
		const original = { ...noteToUpdate };
		const result = Object.assign(noteToUpdate, note);

		return [result, original];
	}

	reorderNotes(fromIndex: number, toIndex: number) {
		const original = Array.from(this.noteOrder);
		const [removed] = this.noteOrder.splice(fromIndex, 1);
		this.noteOrder.splice(toIndex, 0, removed);
		this.notes = mapToOrderedNotes(this.noteOrder, this.notes);
		return [this.noteOrder, original];
	}

	consolodateNoteOrder(initialNoteOrder: string[], notes: Note[]) {
		// We need to remove and notes from order that are not in the notes array to cater for deleted shared notes
		const noteOrder = initialNoteOrder.filter((id) => notes.find((n) => n.id === id));
		// Then add the noteIds that are in the notes array but not in the noteOrder
		const notOrdered = notes.filter((n) => !noteOrder.includes(n.id));
		return [...noteOrder, ...notOrdered.map((n) => n.id)];
	}

	filter(searchQuery: string | null) {
		if (!searchQuery) {
			return this.notes;
		}
		const query = searchQuery.toLowerCase();
		return this.notes.filter(
			(note) => note.text.toLowerCase().includes(query) || note.title?.toLowerCase().includes(query)
		);
	}

	getNoteById(id: string | null) {
		return this.notes.find((n) => n.id === id);
	}
}

const BoardStateKey = Symbol('BoardState');

export function setBoardState() {
	return setContext(BoardStateKey, new BoardState());
}

export function getBoardState() {
	return getContext<ReturnType<typeof setBoardState>>(BoardStateKey);
}

function mapToOrderedNotes(noteOrder: string[], notes: NoteWithOwner[]): NoteOrdered[] {
	const ordered = noteOrder
		.map((id, index) => {
			const note = notes.find((n) => n.id === id);
			if (!note) {
				return null;
			}
			return {
				...note,
				order: index
			};
		})
		.filter((n) => !!n);

	// merge with notes that are not in the noteOrder
	const notOrdered = notes.filter((n) => !noteOrder.includes(n.id));
	return [
		...ordered,
		...notOrdered.map((n) => ({ ...n, order: ordered.length + notOrdered.indexOf(n) }))
	];
}

function mapToNotesWithOwners(notes: Note[], sharedNoteOwners: NoteOwner[] = []): NoteWithOwner[] {
	return notes.map((note) => {
		const shared = sharedNoteOwners.find((s) => s.noteId === note.id);
		return shared ? { ...note, shared: true, owner: shared.owner } : { ...note, shared: false };
	});
}
