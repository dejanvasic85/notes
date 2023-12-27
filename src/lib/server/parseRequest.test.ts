import { describe, expect, it, vi } from 'vitest';

import type { Note } from '$lib/types';
import { NoteSchema } from '$lib/types';

import { parseRequest } from './parseRequest';

describe('parseRequest', () => {
	it('should return a NoteCreateInput when parsing succeeds', async () => {
		const noteCreateInput: Note = {
			boardId: 'boardId',
			colour: 'colour',
			id: 'id',
			text: 'text',
			textPlain: 'this is plain text'
		};

		const req = {
			json: vi.fn().mockResolvedValue(noteCreateInput)
		};

		const result = await parseRequest(
			req as any,
			NoteSchema,
			'Unable to parse note create input'
		)();

		expect(result).toBeRightStrictEqual(noteCreateInput);
	});

	it('should return a return an error when the parsing fails', async () => {
		const noteCreateInput = {
			badRequest: 'boom'
		};

		const req = {
			json: vi.fn().mockResolvedValue(noteCreateInput)
		};

		const result = await parseRequest(
			req as any,
			NoteSchema,
			'Unable to parse note create input'
		)();

		expect(result).toBeLeft('ValidationError');
	});

	it('should return a return an error when the json call rejects', async () => {
		const req = {
			json: vi.fn().mockRejectedValue('boom')
		};

		const result = await parseRequest(
			req as any,
			NoteSchema,
			'Unable to parse note create input'
		)();

		expect(result).toBeLeft('ValidationError');
	});
});
