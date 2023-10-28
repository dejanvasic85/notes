import db from '$lib/db';
import type { Note, NoteCreateInput } from '$lib/types';

export async function createNote(createInput: NoteCreateInput): Promise<Note> {
	return await db.note.create({
		data: {
			...createInput
		}
	});
}

export async function getNoteById(id: string): Promise<Note | null> {
	return await db.note.findUnique({
		where: {
			id
		}
	});
}

export async function updateNote(note: Note): Promise<Note> {
	return await db.note.update({
		where: { id: note.id },
		data: {
			...note,
			boardId: note.boardId!
		}
	});
}

export async function deleteNote(noteId: string): Promise<Note> {
	return await db.note.delete({
		where: { id: noteId }
	});
}
