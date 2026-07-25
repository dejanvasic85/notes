import { decryptField, encryptField } from './fieldEncryption';

type EncryptableNoteFields = {
	text: string;
	textPlain: string;
};

export const decryptNote = async <T extends EncryptableNoteFields>(note: T): Promise<T> => ({
	...note,
	text: await decryptField(note.text),
	textPlain: await decryptField(note.textPlain)
});

export const decryptNotes = <T extends EncryptableNoteFields>(notes: T[]): Promise<T[]> =>
	Promise.all(notes.map(decryptNote));

export const encryptNoteFields = async <T extends EncryptableNoteFields>(note: T): Promise<T> => ({
	...note,
	text: await encryptField(note.text),
	textPlain: await encryptField(note.textPlain)
});
