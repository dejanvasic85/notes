import db from '$lib/server/db';
import type { Note, NoteCreateInput } from '$lib/types';

export async function createNote(createInput: NoteCreateInput): Promise<Note> {
	return await db.note.create({
		data: {
			...createInput
		}
	});
}

export async function getNoteById(id: string): Promise<Note> {
	return await db.note.findUniqueOrThrow({
		where: {
			id
		}
	});
}
