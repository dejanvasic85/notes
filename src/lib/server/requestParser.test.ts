import { describe, expect, it, vi } from 'vitest';

import type { Note } from '$lib/types';
import { NoteSchema } from '$lib/types';

import { parseRequest } from './requestParser';

describe('parseRequest', () => {
	it('should return a NoteCreateInput when parsing succeeds', async () => {
		const noteCreateInput: Note = {
			boardId: 'boardId',
			colour: 'colour',
			id: 'id',
			text: 'text',
			textPlain: 'this is plain text',
			title: 'title'
		};

		const req = {
			json: vi.fn().mockResolvedValue(noteCreateInput)
		};

		const result = await parseRequest(req as any, NoteSchema, 'Unable to parse note create input');

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toEqual(noteCreateInput);
	});

	it('should return a return an error when the parsing fails', async () => {
		const noteCreateInput = {
			badRequest: 'boom'
		};

		const req = {
			json: vi.fn().mockResolvedValue(noteCreateInput)
		};

		const result = await parseRequest(req as any, NoteSchema, 'Unable to parse note create input');

		expect(result.isErr()).toBe(true);
		const err = result._unsafeUnwrapErr();
		expect(err._tag).toBe('ValidationError');
		expect(err.message).toBe('Unable to parse note create input');
	});

	it('should return a return an error when the json call rejects', async () => {
		const req = {
			json: vi.fn().mockRejectedValue('boom')
		};

		const result = await parseRequest(req as any, NoteSchema, 'Unable to parse note create input');

		expect(result.isErr()).toBe(true);
		const err = result._unsafeUnwrapErr();
		expect(err._tag).toBe('ValidationError');
		expect(err.message).toBe('Unable to parse note create input');
	});
});
