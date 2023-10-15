import type { Note, NoteOrdered } from '../types';

export function updateNote(notes: NoteOrdered[], noteToUpdate: NoteOrdered) {
	return notes.map((n) => {
		if (n.id === noteToUpdate.id) {
			return {
				...n,
				...noteToUpdate
			};
		}
		return n;
	});
}

export function getOrderedNotes(noteOrder: string[], notes: Note[]): NoteOrdered[] {
	return noteOrder.map((id, index) => {
		const note = notes.find((n) => n.id === id);
		if (!note) throw new Error(`Note ${id} not found`);
		return {
			...note,
			order: index
		};
	});
}

export function reorderNotes(noteOrder: string[], fromIndex: number, toIndex: number) {
	const result = Array.from(noteOrder);
	const [removed] = result.splice(fromIndex, 1);
	result.splice(toIndex, 0, removed);
	return result;
}
