import { describe, it, expect } from 'vitest';

import { decryptNote, decryptNotes, encryptNoteFields } from './noteEncryption';

describe('encryptNoteFields / decryptNote', () => {
	it('round-trips text and textPlain', async () => {
		const note = { id: 'nid_123', text: '<p>hello</p>', textPlain: 'hello' };

		const encrypted = await encryptNoteFields(note);

		expect(encrypted.text).not.toBe(note.text);
		expect(encrypted.textPlain).not.toBe(note.textPlain);

		expect(await decryptNote(encrypted)).toEqual(note);
	});
});

describe('decryptNotes', () => {
	it('decrypts every note in the array', async () => {
		const notes = await Promise.all([
			encryptNoteFields({ id: 'nid_1', text: 'a', textPlain: 'a' }),
			encryptNoteFields({ id: 'nid_2', text: 'b', textPlain: 'b' })
		]);

		expect(await decryptNotes(notes)).toEqual([
			{ id: 'nid_1', text: 'a', textPlain: 'a' },
			{ id: 'nid_2', text: 'b', textPlain: 'b' }
		]);
	});
});
