import { getContext, setContext } from 'svelte';

import type { Board, NoteOrdered, Friend, Note, ToggleFriendShare } from '$lib/types';
import { generateId } from '$lib/identityGenerator';

export class BoardState {
	boardId: string = $state('');
	noteOrder: string[] = $state([]);
	notesOrdered: NoteOrdered[] = $state([]);
	friends: Friend[] = $state([]);

	constructor() {}

	setBoard(board: Board, friends: Friend[], sharedNotes: Note[]) {
		const allNotes = [...board.notes, ...sharedNotes];
		this.boardId = board.id;
		this.noteOrder = this.consolodateNoteOrder(board.noteOrder, allNotes);
		this.notesOrdered = mapToOrderedNotes(this.noteOrder, allNotes);
		this.friends = friends;
	}

	reset() {
		this.boardId = '';
		this.noteOrder = [];
		this.notesOrdered = [];
		this.friends = [];
	}

	createNewNote(textPlain = '') {
		const id = generateId('nid');
		const newNote: Note = { id, text: textPlain, textPlain, boardId: this.boardId, colour: null };
		this.notesOrdered.push({ ...newNote, order: this.notesOrdered.length });
		this.noteOrder.push(id);
		return newNote;
	}

	createNoteAtIndex(index: number, note: Note) {
		this.notesOrdered.splice(index, 0, { ...note, order: index });
		this.noteOrder.splice(index, 0, note.id);
	}

	deleteNoteById(id: string): [NoteOrdered, number] {
		const noteToDelete = this.notesOrdered.find((n) => n.id === id);
		const index = this.noteOrder.indexOf(id);
		if (index === -1 || !noteToDelete) {
			throw new Error('Note not found');
		}
		this.notesOrdered = this.notesOrdered.filter((n) => n.id !== id);
		return [noteToDelete, index];
	}

	toggleFriendShare({ friendUserId, noteId, selected, id }: ToggleFriendShare) {
		const note = this.notesOrdered.find((n) => n.id === noteId);
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
		const noteToUpdate = this.notesOrdered.find((n) => n.id === note.id);
		if (!noteToUpdate) {
			throw new Error('Note not found');
		}
		const original = {
			...noteToUpdate
		};
		Object.assign(noteToUpdate, note);
		return [noteToUpdate, original];
	}

	reorderNotes(fromIndex: number, toIndex: number) {
		const original = Array.from(this.noteOrder);
		const [removed] = this.noteOrder.splice(fromIndex, 1);
		this.noteOrder.splice(toIndex, 0, removed);
		this.notesOrdered = mapToOrderedNotes(this.noteOrder, this.notesOrdered);
		return [this.noteOrder, original];
	}

	consolodateNoteOrder(initialNoteOrder: string[], notes: Note[]) {
		// We need to remove and notes from order that are not in the notes array to cater for deleted shared notes
		const noteOrder = initialNoteOrder.filter((id) => notes.find((n) => n.id === id));
		// Then add the noteIds that are in the notes array but not in the noteOrder
		const notOrdered = notes.filter((n) => !noteOrder.includes(n.id));
		return [...noteOrder, ...notOrdered.map((n) => n.id)];
	}
}

const BoardStateKey = Symbol('BoardState');

export function setBoardState() {
	return setContext(BoardStateKey, new BoardState());
}

export function getBoardState() {
	return getContext<ReturnType<typeof setBoardState>>(BoardStateKey);
}

function mapToOrderedNotes(noteOrder: string[], notes: Note[]): NoteOrdered[] {
	const oredered = noteOrder
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
		...oredered,
		...notOrdered.map((n) => ({ ...n, order: oredered.length + notOrdered.indexOf(n) }))
	];
}
