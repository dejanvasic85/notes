import { getContext, setContext } from 'svelte';

import type { Board, NoteOrdered, SharedNote, Friend, Note, ToggleFriendShare } from '$lib/types';
import { generateId } from '$lib/identityGenerator';

export class BoardState {
	boardId: string = $state('');
	noteOrder: string[] = $state([]);
	notes: NoteOrdered[] = $state([]);
	sharedNotes: SharedNote[] = $state([]);
	friends: Friend[] = $state([]);

	constructor() {}

	setBoard(board: Board, friends: Friend[], sharedNotes: SharedNote[]) {
		this.boardId = board.id;
		this.noteOrder = [...board.noteOrder];
		this.notes = mapToOrderedNotes(this.noteOrder, board.notes);
		this.friends = friends;
		this.sharedNotes = sharedNotes;
	}

	reset() {
		this.boardId = '';
		this.noteOrder = [];
		this.notes = [];
		this.friends = [];
		this.sharedNotes = [];
	}

	createNewNote(textPlain = '') {
		const id = generateId('nid');
		const newNote: Note = { id, text: textPlain, textPlain, boardId: this.boardId, colour: null };
		this.notes.push({ ...newNote, order: this.notes.length });
		this.noteOrder.push(id);
		return newNote;
	}

	createNoteAtIndex(index: number, note: Note) {
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
		this.notes = mapToOrderedNotes(this.noteOrder, this.notes);
		return [this.noteOrder, original];
	}
}

const BoardStateKey = Symbol('BoardState');

export function setState() {
	return setContext(BoardStateKey, new BoardState());
}

export function getBoardState() {
	return getContext<ReturnType<typeof setState>>(BoardStateKey);
}

function mapToOrderedNotes(noteOrder: string[], notes: Note[]): NoteOrdered[] {
	return noteOrder.map((id, index) => {
		const note = notes.find((n) => n.id === id);
		if (!note) throw new Error(`Note ${id} not found`);
		return {
			...note,
			order: index
		};
	});
}
