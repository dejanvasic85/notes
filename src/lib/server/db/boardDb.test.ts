import { describe, it, expect, vi, type Mocked } from 'vitest';

import db from '$lib/server/db';
import { encryptField } from './fieldEncryption';

import { getBoard } from './boardDb';

vi.mock('$lib/server/db', () => ({
	default: {
		board: {
			findFirst: vi.fn()
		}
	}
}));

const dbBoardMock = db.board as Mocked<typeof db.board>;

describe('getBoard', () => {
	it('should return a board with its notes decrypted', async () => {
		dbBoardMock.findFirst.mockResolvedValue({
			id: 'bid_123',
			notes: [
				{
					id: 'nid_123',
					text: await encryptField('<p>hello</p>'),
					textPlain: await encryptField('hello')
				}
			]
		} as any);

		const result = await getBoard({ id: 'bid_123' });

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toEqual({
			id: 'bid_123',
			notes: [{ id: 'nid_123', text: '<p>hello</p>', textPlain: 'hello' }]
		});
	});

	it('should return RecordNotFoundError when the board does not exist', async () => {
		dbBoardMock.findFirst.mockResolvedValue(null);

		const result = await getBoard({ id: 'bid_123' });

		expect(result.isErr()).toBe(true);
		expect(result._unsafeUnwrapErr()).toEqual({
			_tag: 'RecordNotFound',
			message: 'Board bid_123 not found',
			originalError: undefined
		});
	});
});
