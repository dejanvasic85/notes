import { describe, it, vi, type MockedFunction, beforeEach, expect } from 'vitest';

import { taskEither as TE } from 'fp-ts';

import { updateBoard, getBoardByUserId } from '$lib/server/db/boardDb';
import { createNote } from '$lib/server/db/notesDb';
import { createError } from '$lib/server/createError';
import type { Note } from '$lib/types';

import { POST } from './+server';

vi.mock('$lib/server/db/boardDb');
vi.mock('$lib/server/db/notesDb');
vi.mock('$lib/server/db/userDb');

const mockNoteInput: Note = {
	boardId: 'board_123',
	text: 'This is a note',
	textPlain: 'This is a note',
	colour: 'red',
	id: 'note_123'
};

const mockUpdateBoard = updateBoard as MockedFunction<typeof updateBoard>;
const mockGetBoardById = getBoardByUserId as MockedFunction<typeof getBoardByUserId>;
const mockCreateNote = createNote as MockedFunction<typeof createNote>;

describe('POST', () => {
	beforeEach(() => {
		mockUpdateBoard.mockReturnValue(TE.right({} as any));
		mockCreateNote.mockReturnValue(TE.right(mockNoteInput));
		mockGetBoardById.mockReturnValue(TE.right({ id: 'board_123', noteOrder: [] } as any));
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

		await expect(
			POST({
				locals: { user: { id: 'uid_123' } },
				request
			} as any)
		).rejects.toEqual({
			status: 400,
			body: { message: 'Unable to parse Note' }
		});
	});

	it('should return a 500 when the update board throws an error', async () => {
		const request = {
			json: vi.fn().mockResolvedValue(mockNoteInput)
		};

		mockUpdateBoard.mockReturnValue(
			TE.left(createError('DatabaseError', 'Failed to update board'))
		);

		await expect(
			POST({
				locals: { user: { id: 'uid_123' } },
				request
			} as any)
		).rejects.toEqual({
			status: 500,
			body: { message: 'Failed to update board' }
		});
	});
});
