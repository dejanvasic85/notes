import { describe, it, expect, vi, type Mocked, beforeEach } from 'vitest';

import db from '$lib/db';

import { getNoteById } from './notesDb';

vi.mock('$lib/db', () => ({
	default: {
		note: {
			findUnique: vi.fn()
		}
	}
}));

const dbNoteMock = db.note as Mocked<typeof db.note>;

describe('getNoteById', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return a note when it exists', async () => {
		dbNoteMock.findUnique.mockResolvedValue({
			id: 'nid_123'
		} as any);

		const result = await getNoteById({ id: 'nid_123' })();

		expect(result).toBeRightStrictEqual({
			id: 'nid_123'
		});
	});

	it('should return RecordNotFoundError when the note does not exist', async () => {
		dbNoteMock.findUnique.mockResolvedValue(null);

		const result = await getNoteById({ id: 'nid_123' })();

		expect(result).toBeLeftStrictEqual({
			_tag: 'RecordNotFound',
			message: 'Note with id nid_123 not found'
		});
	});

	it('should return DatabaseError when the db throws an error', async () => {
		dbNoteMock.findUnique.mockRejectedValue(new Error('db error'));

		const result = await getNoteById({ id: 'nid_123' })();

		expect(result).toBeLeftStrictEqual({
			_tag: 'DatabaseError',
			message: 'Database error',
			originalError: new Error('db error')
		});
	});
});
