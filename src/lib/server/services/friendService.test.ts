import { taskEither as TE } from 'fp-ts';
import { describe, expect, it, vi, type MockedFunction } from 'vitest';

import {
	createInvite,
	createConnection,
	getInvite,
	getUser,
	updateInvite
} from '$lib/server/db/userDb';
import { sendEmail } from '$lib/server/services/emailService';
import type {
	DatabaseError,
	RecordNotFoundError,
	SendEmailError,
	User,
	UserConnection,
	UserInvite,
	ValidationError
} from '$lib/types';

import { acceptInvite, sendInvite, cancelInvite } from './friendService';

vi.mock('$lib/server/db/userDb');
vi.mock('$lib/server/services/emailService');

const mockSendEmail = sendEmail as MockedFunction<typeof sendEmail>;
const mockCreateInvite = createInvite as MockedFunction<typeof createInvite>;
const mockGetInvite = getInvite as MockedFunction<typeof getInvite>;
const mockGetUser = getUser as MockedFunction<typeof getUser>;
const mockUpdateInvite = updateInvite as MockedFunction<typeof updateInvite>;
const mockCreateConnection = createConnection as MockedFunction<typeof createConnection>;

describe('acceptInvite', () => {
	it('should update the invice to accepted and create a new connection', async () => {
		const inviteId = 'invite_123';
		const acceptedBy = { id: 'uid_123', email: 'foo@bar.com' };
		const invitedBy = {
			id: 'uid_234'
		} as User;

		const invite: UserInvite = {
			id: 'invite_123',
			status: null,
			friendEmail: 'foo@bar.com',
			userId: 'uid_234'
		};

		const connection: UserConnection = {
			type: 'connected',
			userFirstId: 'uid_123',
			userSecondId: 'uid_234'
		};

		mockGetInvite.mockReturnValue(TE.right(invite));
		mockGetUser.mockReturnValue(TE.right(invitedBy));
		mockUpdateInvite.mockReturnValue(TE.right({ ...invite, status: 'accepted' }));
		mockCreateConnection.mockReturnValue(TE.right(connection));

		const result: any = await acceptInvite(inviteId, acceptedBy)();

		expect(result._tag).toBe('Right');
		expect(result.right).toEqual({ connection, invitedBy });
	});

	it('should return record not found error when the invite is not found', async () => {
		const inviteId = 'invite_123';
		const acceptedBy = { id: 'uid_123', email: 'foo@bar.com' };
		const recordNotFound: RecordNotFoundError = {
			_tag: 'RecordNotFound',
			message: 'Invite not found'
		};

		mockGetInvite.mockReturnValue(TE.left(recordNotFound));

		const result: any = await acceptInvite(inviteId, acceptedBy)();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual(recordNotFound);
	});
});

describe('sendInvites', () => {
	it('should create an invite and send an email to the friend', async () => {
		mockCreateInvite.mockReturnValue(TE.right({ id: 'invite_123' } as any));
		mockSendEmail.mockReturnValue(TE.right({} as any));

		const result: any = await sendInvite({
			baseUrl: 'localhost:1000',
			friendEmail: 'bob@foo.com',
			name: 'foo bar',
			userId: 'uid_123',
			userEmail: 'foo@bar.com'
		})();

		expect(result._tag).toBe('Right');
	});

	it('should return an error when the invite creation fails', async () => {
		const databaseError: DatabaseError = {
			_tag: 'DatabaseError',
			message: 'Unexpected database error occurred',
			originalError: new Error('')
		};

		mockCreateInvite.mockReturnValue(TE.left(databaseError));

		const result: any = await sendInvite({
			baseUrl: 'localhost:1000',
			friendEmail: 'bob@foo.com',
			name: 'foo bar',
			userId: 'uid_123',
			userEmail: 'foo@bar.com'
		})();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual(databaseError);
	});

	it('should return an error when the sendEmail fails', async () => {
		const emailError: SendEmailError = {
			_tag: 'SendEmailError',
			message: 'Failed to send email'
		};

		mockCreateInvite.mockReturnValue(TE.right({ id: 'invite_123' } as any));
		mockSendEmail.mockReturnValue(TE.left(emailError));

		const result: any = await sendInvite({
			baseUrl: 'localhost:1000',
			friendEmail: 'bob@foo.com',
			name: 'foo bar',
			userId: 'uid_123',
			userEmail: 'foo@bar.com'
		})();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual(emailError);
	});

	it('should return a validation error when the friend email matches the current user email', async () => {
		const validationError: ValidationError = {
			_tag: 'ValidationError',
			message: 'Friend email should be different to current user email',
			originalError: undefined
		};

		mockCreateInvite.mockReturnValue(TE.right({ id: 'invite_123' } as any));
		mockSendEmail.mockReturnValue(TE.right({} as any));

		const result: any = await sendInvite({
			baseUrl: 'localhost:1000',
			friendEmail: 'foo@bar.com',
			name: 'foo bar',
			userId: 'uid_123',
			userEmail: 'foo@bar.com'
		})();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual(validationError);
	});
});

describe('cancelInvite', () => {
	it('should update the invite status to cancelled', async () => {
		const inviteId = 'invite_123';

		mockGetInvite.mockReturnValue(TE.right({ id: 'invite_123' } as any));
		mockUpdateInvite.mockReturnValue(TE.right({ id: 'invite_123', status: 'cancelled' } as any));

		const result: any = await cancelInvite(inviteId)();
		expect(result._tag).toBe('Right');
		expect(mockUpdateInvite).toHaveBeenCalledWith({ id: 'invite_123', status: 'cancelled' });
	});

	it('should return a record not found error when the invite is not found', async () => {
		const inviteId = 'invite_123';
		const recordNotFound: RecordNotFoundError = {
			_tag: 'RecordNotFound',
			message: 'Invite not found'
		};

		mockGetInvite.mockReturnValue(TE.left(recordNotFound));

		const result: any = await cancelInvite(inviteId)();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual(recordNotFound);
	});
});
