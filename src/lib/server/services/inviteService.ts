import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import type { ServerError, User, UserConnection } from '$lib/types';

import { generateId } from '$lib/identityGenerator';
import {
	createInvite,
	createConnection,
	getInvite,
	getUser,
	updateInvite
} from '$lib/server/db/userDb';
import { sendEmail } from '$lib/server/services/emailService';

interface SendInviteParams {
	name: string;
	userId: string;
	friendEmail: string;
	baseUrl: string;
}

export const sendInvite = ({
	baseUrl,
	name,
	userId,
	friendEmail
}: SendInviteParams): TE.TaskEither<ServerError, void> => {
	return pipe(
		createInvite({ id: generateId('inv'), userId, friendEmail, acceptedAt: null }),
		TE.flatMap(({ id }) => {
			const inviteLink = `${baseUrl}/invite/${id}`;
			const html = `Hello ${friendEmail}. 
			<p>You have been invited by ${name} to join them in collaborating on Notes.</p> 
			<p>Accept <a href="${inviteLink}">invite</a> to get started now.</p>`;
			return sendEmail({
				to: friendEmail,
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
		TE.bind('updateInvite', ({ invite }) => updateInvite({ ...invite, acceptedAt: new Date() })),
		TE.map(({ connection, invitedBy }) => ({
			connection,
			invitedBy
		}))
	);
};
