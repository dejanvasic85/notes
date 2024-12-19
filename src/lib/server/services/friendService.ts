import { taskEither as TE, either as E } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import type { ServerError, User, UserConnection, UserInvite } from '$lib/types';

import { generateId } from '$lib/identityGenerator';
import {
	createInvite,
	createConnection,
	getInvite,
	getConnection,
	getUser,
	updateInvite,
	updateConnection
} from '$lib/server/db/userDb';
import { sendEmail } from '$lib/server/services/emailService';
import { createError } from '../createError';

interface SendInviteParams {
	baseUrl: string;
	name: string;
	friendEmail: string;
	userId: string;
	userEmail: string;
}

const validateSendInvite = (params: SendInviteParams): E.Either<ServerError, SendInviteParams> => {
	if (!params.friendEmail) {
		return E.left(createError('ValidationError', 'Friend email is required'));
	}

	return params.friendEmail === params.userEmail
		? E.left(
				createError('ValidationError', 'Friend email should be different to current user email')
			)
		: E.right(params);
};

export const sendInvite = (params: SendInviteParams): TE.TaskEither<ServerError, void> => {
	return pipe(
		TE.Do,
		TE.bind('params', () => TE.fromEither(validateSendInvite(params))),
		TE.bind('invite', ({ params }) =>
			createInvite({
				id: generateId('inv'),
				userId: params.userId,
				friendEmail: params.friendEmail,
				status: null
			})
		),
		TE.flatMap(({ params, invite }) => {
			const inviteLink = `${params.baseUrl}/invite/${invite.id}`;
			const html = `Hello ${params.friendEmail}. 
			<p>You have been invited by ${params.name} to join them in collaborating on Notes.</p> 
			<p>Accept <a href="${inviteLink}">invite</a> to get started now.</p>`;
			return sendEmail({
				to: params.friendEmail,
				subject: 'You have been invited to share notes',
				html
			});
		})
	);
};

export const acceptInvite = (
	inviteId: string,
	acceptedBy: Pick<User, 'id' | 'email'>
): TE.TaskEither<ServerError, { connection: UserConnection; invitedBy: User }> => {
	return pipe(
		TE.Do,
		TE.bind('invite', () => getInvite(inviteId)),
		TE.bind('invitedBy', ({ invite }) =>
			getUser({ id: invite.userId, includeBoards: false, includeNotes: false })
		),
		TE.bind('connection', ({ invite }) =>
			createConnection({
				userFirstId: invite.userId,
				userSecondId: acceptedBy.id,
				type: 'connected'
			})
		),
		TE.bind('updateInvite', ({ invite }) => updateInvite({ ...invite, status: 'accepted' })),
		TE.map(({ connection, invitedBy }) => ({
			connection,
			invitedBy
		}))
	);
};

export const ignoreInvite = (inviteId: string): TE.TaskEither<ServerError, UserInvite> => {
	return pipe(
		TE.Do,
		TE.bind('invite', () => getInvite(inviteId)),
		TE.flatMap(({ invite }) => updateInvite({ ...invite, status: 'ignored' }))
	);
};

export const cancelInvite = (inviteId: string): TE.TaskEither<ServerError, UserInvite> => {
	return pipe(
		TE.Do,
		TE.bind('invite', () => getInvite(inviteId)),
		TE.flatMap(({ invite }) => updateInvite({ ...invite, status: 'cancelled' }))
	);
};

export const removeConnection = (
	userId: string,
	friendUserId: string
): TE.TaskEither<ServerError, UserConnection> => {
	return pipe(
		TE.Do,
		TE.bind('connection', () => getConnection(userId, friendUserId)),
		TE.flatMap(({ connection }) =>
			updateConnection({ ...connection, type: 'removed', updatedAt: new Date() })
		)
	);
};
