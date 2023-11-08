import * as E from 'fp-ts/Either';
import { describe, it, vi, type Mocked, expect } from 'vitest';
import db from '$lib/db';

import { getUserByIdTask } from './userDb';

vi.mock('$lib/db', () => ({
	default: {
		user: {
			findUnique: vi.fn()
		}
	}
}));

const dbUserMock = db.user as Mocked<typeof db.user>;

describe('getUserByIdTask', () => {
	it('should return a user successfully', async () => {
		dbUserMock.findUnique.mockResolvedValue({
			id: 'hello world',
			name: 'Goerge Costanza'
		} as any);

		const result = await getUserByIdTask({ id: 'uid_123' })();
		expect(E.isRight(result)).toBe(true);
		if (result._tag === 'Right') {
			expect(result.right).toStrictEqual({
				id: 'hello world',
				name: 'Goerge Costanza',
				boards: []
			});
		}
	});

	it('should return RecordNotFoundError when the user is null', async () => {
		dbUserMock.findUnique.mockResolvedValue(null as any);

		const result = await getUserByIdTask({ id: 'uid_123' })();

		if (result._tag === 'Left') {
			expect(result.left).toStrictEqual({
				_tag: 'RecordNotFound',
				message: 'User with id uid_123 not found'
			});
		}
	});
});
