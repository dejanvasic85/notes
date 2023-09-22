import type { Note } from '../types';

export function updateNote(notes: Note[], noteToUpdate: Note) {
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
