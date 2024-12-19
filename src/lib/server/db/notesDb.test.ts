import { describe, it, expect, vi, type Mocked } from 'vitest';

import db from '$lib/server/db';

import { getNoteById, createNote } from './notesDb';

vi.mock('$lib/server/db', () => ({
	default: {
		note: {
			findFirst: vi.fn(),
			create: vi.fn()
		}
	}
}));

const dbNoteMock = db.note as Mocked<typeof db.note>;

describe('getNoteById', () => {
	it('should return a note when it exists', async () => {
		dbNoteMock.findFirst.mockResolvedValue({
			id: 'nid_123'
		} as any);

		const result: any = await getNoteById({ id: 'nid_123' })();

		expect(result._tag).toBe('Right');
		expect(result.right).toEqual({
			id: 'nid_123'
		});
	});

	it('should return RecordNotFoundError when the note does not exist', async () => {
		dbNoteMock.findFirst.mockResolvedValue(null);

		const result: any = await getNoteById({ id: 'nid_123' })();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual({
			_tag: 'RecordNotFound',
			message: 'Note with id nid_123 not found',
			originalError: undefined
		});
	});

	it('should return DatabaseError when the db throws an error', async () => {
		dbNoteMock.findFirst.mockRejectedValue(new Error('db error'));

		const result: any = await getNoteById({ id: 'nid_123' })();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual({
			_tag: 'DatabaseError',
			message: 'Unexpected database error occurred',
			originalError: new Error('db error')
		});
	});
});

describe('createNote', () => {
	it('should return a note when it is created', async () => {
		dbNoteMock.create.mockResolvedValue({
			id: 'nid_123'
		} as any);

		const result: any = await createNote({
			id: 'nid_123',
			boardId: 'bid_123',
			text: 'foo',
			textPlain: 'foo',
			colour: null
		})();

		expect(result.right).toEqual({
			id: 'nid_123'
		});
	});

	it('should return DatabaseError when the db throws an error', async () => {
		dbNoteMock.create.mockRejectedValue(new Error('db error'));

		const result: any = await createNote({
			id: 'nid_123',
			boardId: 'bid_123',
			text: 'foo',
			textPlain: 'foo',
			colour: null
		})();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual({
			_tag: 'DatabaseError',
			message: expect.any(String),
			originalError: new Error('db error')
		});
	});
});
