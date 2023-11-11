import { describe, expect, it, vi, type MockedFunction } from 'vitest';
import * as TE from 'fp-ts/TaskEither';

import { getUser } from '$lib/db/userDb';
import type { DatabaseError, RecordNotFoundError } from '$lib/types';

import { GET } from './+server';

vi.mock('$lib/db/userDb');

const mockGetUser = getUser as MockedFunction<typeof getUser>;

describe('GET', () => {
	it('should return a user successfully', async () => {
		const user = {
			id: 'uid_123',
			name: 'Test User',
			email: 'foo@bar.com'
		};
		mockGetUser.mockReturnValue(TE.right(user) as any);

		const resp = await GET({
			locals: { user: { id: 'uid_123' } }
		} as any);

		expect(resp.status).toBe(200);
		const json = await resp.json();
		expect(json).toEqual(user);
	});

	it('should return 404 when the user is not in the database', async () => {
		const recordNotFoundError: RecordNotFoundError = {
			_tag: 'RecordNotFound',
			message: 'User not found'
		};

		mockGetUser.mockReturnValue(TE.left(recordNotFoundError));

		const resp = await GET({
			locals: { user: { id: 'uid_notFound' } }
		} as any);

		expect(resp.status).toBe(404);
	});

	it('should return 500 when an unexpected error occurs', async () => {
		const serverError: DatabaseError = {
			_tag: 'DatabaseError',
			message: 'Server error',
			originalError: new Error('Database is down')
		};

		mockGetUser.mockReturnValue(TE.left(serverError));

		const resp = await GET({
			locals: { user: { id: 'uid_unexpectedError' } }
		} as any);

		expect(resp.status).toBe(500);
		const json = await resp.json();
		expect(json).toStrictEqual({ message: 'Server error' });
	});
});
