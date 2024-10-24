import { describe, it, expect, vi, type Mocked, beforeEach } from 'vitest';

import db from '$lib/server/db';
import { isLeftEqual, isRightEqual } from '$test-utils/assertions';

import { getNoteById, createNote } from './notesDb';

vi.mock('$lib/server/db', () => ({
	default: {
		note: {
			findUnique: vi.fn(),
			create: vi.fn()
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

		expect(
			isRightEqual(result, {
				id: 'nid_123'
			})
		).toBe(true);
	});

	it('should return RecordNotFoundError when the note does not exist', async () => {
		dbNoteMock.findUnique.mockResolvedValue(null);

		const result = await getNoteById({ id: 'nid_123' })();

		expect(
			isLeftEqual(result, {
				_tag: 'RecordNotFound',
				message: 'Note with id nid_123 not found',
				originalError: undefined
			})
		).toBe(true);
	});

	it('should return DatabaseError when the db throws an error', async () => {
		dbNoteMock.findUnique.mockRejectedValue(new Error('db error'));

		const result = await getNoteById({ id: 'nid_123' })();

		expect(
			isLeftEqual(result, {
				_tag: 'DatabaseError',
				message: 'Unexpected database error occurred',
				originalError: new Error('db error')
			})
		).toBe(true);
	});
});

describe('createNote', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return a note when it is created', async () => {
		dbNoteMock.create.mockResolvedValue({
			id: 'nid_123'
		} as any);

		const result = await createNote({
			id: 'nid_123',
			boardId: 'bid_123',
			text: 'foo',
			textPlain: 'foo',
			colour: null
		})();

		expect(
			isRightEqual(result, {
				id: 'nid_123'
			})
		).toBe(true);
	});

	it('should return DatabaseError when the db throws an error', async () => {
		dbNoteMock.create.mockRejectedValue(new Error('db error'));

		const result = await createNote({
			id: 'nid_123',
			boardId: 'bid_123',
			text: 'foo',
			textPlain: 'foo',
			colour: null
		})();

		expect(
			isLeftEqual(result, {
				_tag: 'DatabaseError',
				message: 'Failed to create note',
				originalError: new Error('db error')
			})
		).toBe(true);
	});
});
