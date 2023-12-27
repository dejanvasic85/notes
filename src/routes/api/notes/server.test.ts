import { describe, it, vi, type MockedFunction, beforeEach, expect } from 'vitest';

import { taskEither as TE } from 'fp-ts';

import { updateBoard } from '$lib/server/db/boardDb';
import { createNote } from '$lib/server/db/notesDb';
import { getUser } from '$lib/server/db/userDb';
import type { NoteCreateInput } from '$lib/types';

import { POST } from './+server';
import { createError } from '$lib/server/createError';

vi.mock('$lib/server/db/boardDb');
vi.mock('$lib/server/db/notesDb');
vi.mock('$lib/server/db/userDb');

const mockNoteInput: NoteCreateInput = {
	boardId: 'board_123',
	text: 'This is a note',
	textPlain: 'This is a note',
	colour: 'red',
	id: 'note_123'
};

const mockGetUser = getUser as MockedFunction<typeof getUser>;
const mockUpdateBoard = updateBoard as MockedFunction<typeof updateBoard>;
const mockCreateNote = createNote as MockedFunction<typeof createNote>;

describe('POST', () => {
	beforeEach(() => {
		mockGetUser.mockReturnValue(
			TE.right({ id: 'uid_hello', boards: [{ id: 'board_123', noteOrder: [] }] } as any)
		);
		mockUpdateBoard.mockReturnValue(TE.right({} as any));
		mockCreateNote.mockReturnValue(TE.right(mockNoteInput));
	});

	it('should return 201 when note is created successfully', async () => {
		const request = {
			json: vi.fn().mockResolvedValue(mockNoteInput)
		};

		const resp = await POST({
			locals: { user: { id: 'uid_123' } },
			request
		} as any);

		expect(resp.status).toBe(201);
		const data = await resp.json();
		expect(data).toEqual({
			id: 'note_123',
			boardId: 'board_123',
			colour: 'red',
			text: 'This is a note',
			textPlain: 'This is a note'
		});

		expect(createNote).toHaveBeenCalled();

		expect(updateBoard).toHaveBeenCalledWith({
			id: 'board_123',
			noteOrder: ['note_123']
		});
	});

	it('should return a 400 when the request body is invalid', async () => {
		const request = {
			json: vi.fn().mockResolvedValue({ bad: 'data' })
		};

		const resp = await POST({
			locals: { user: { id: 'uid_123' } },
			request
		} as any);

		expect(resp.status).toBe(400);
		const data = await resp.json();
		expect(data).toEqual({ message: 'Unable to parse NoteCreateInputSchema', status: 400 });
	});

	it('should return a 403 when the user is not the owner of the note', async () => {
		const request = {
			json: vi.fn().mockResolvedValue({ ...mockNoteInput, boardId: 'board_456' })
		};

		const resp = await POST({
			locals: { user: { id: 'uid_123' } },
			request
		} as any);

		expect(resp.status).toBe(403);
		const data = await resp.json();
		expect(data).toEqual({
			message: 'User uid_hello is not the owner of note note_123',
			status: 403
		});
	});

	it('should return a 500 when the update board throws an error', async () => {
		const request = {
			json: vi.fn().mockResolvedValue(mockNoteInput)
		};

		mockUpdateBoard.mockReturnValue(
			TE.left(createError('DatabaseError', 'Failed to update board'))
		);

		const resp = await POST({
			locals: { user: { id: 'uid_123' } },
			request
		} as any);

		expect(resp.status).toBe(500);
		const data = await resp.json();
		expect(data).toEqual({ message: 'Failed to update board', status: 500 });
	});

	it('should return a 500 when the user db throws an error', async () => {
		const request = {
			json: vi.fn().mockResolvedValue(mockNoteInput)
		};

		mockGetUser.mockReturnValue(TE.left(createError('DatabaseError', 'Failed to fetch user')));

		const resp = await POST({
			locals: { user: { id: 'uid_123' } },
			request
		} as any);

		expect(resp.status).toBe(500);
		const data = await resp.json();
		expect(data).toEqual({ message: 'Failed to fetch user', status: 500 });
	});
});
