import { taskEither as TE, either as E } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import type { NoteEditor, ServerError, User, UserConnection, UserInvite } from '$lib/types';

import { generateId } from '$lib/identityGenerator';
import { deselectAllNoteEditors } from '$lib/server/db/notesDb';
import {
	createInvite,
	createConnection,
	getInvite,
	getInvitesByUser,
	getConnection,
	getUser,
	updateInvite,
	updateConnection,
	getConnectionOrNull
} from '$lib/server/db/userDb';
import { sendEmail } from '$lib/server/services/emailService';
import { addNoteEditorFromInvite } from '$lib/server/services/noteService';
import { createError } from '$lib/server/errorFactory';

interface SendInviteParams {
	baseUrl: string;
	name: string;
	friendEmail: string;
	userId: string;
	userEmail: string;
	invitedToNoteId: string | null;
}

const validateSendInviteParams = (
	params: SendInviteParams
): E.Either<ServerError, SendInviteParams> => {
	if (!params.friendEmail) {
		return E.left(createError('ValidationError', 'Friend email is required'));
	}
	return params.friendEmail === params.userEmail
		? E.left(
				createError('ValidationError', 'Friend email should be different to current user email')
			)
		: E.right(params);
};

const validateExistingInvite = (params: SendInviteParams): TE.TaskEither<ServerError, void> => {
	return pipe(
		getInvitesByUser(params.userId),
		TE.flatMap((invites) => {
			const existingInvites = invites.filter(
				(invite) => invite.friendEmail === params.friendEmail && invite.status !== 'cancelled'
			);
			return existingInvites.length > 0
				? TE.left(createError('ValidationError', 'Friend is already invited'))
				: TE.right(void 0);
		})
	);
};

export const sendInvite = (params: SendInviteParams): TE.TaskEither<ServerError, void> => {
	return pipe(
		validateSendInviteParams(params),
		TE.fromEither,
		TE.flatMap(() => validateExistingInvite(params)),
		TE.flatMap(() =>
			createInvite({
				id: generateId('inv'),
				userId: params.userId,
				friendEmail: params.friendEmail,
				status: null,
				invitedToNoteId: params.invitedToNoteId
			})
		),
		TE.flatMap((invite) => {
			const inviteLink = `${params.baseUrl}/my/invites/${invite.id}`;
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

export type AcceptInviteResult = {
	connection: UserConnection;
	invitedBy: User;
	invite: UserInvite;
	noteEditor: NoteEditor | null;
};

export const acceptInvite = (
	inviteId: string,
	acceptedByUser: Pick<User, 'id' | 'email'>
): TE.TaskEither<ServerError, AcceptInviteResult> => {
	return pipe(
		TE.Do,
		TE.bind('invite', () => getInvite(inviteId)),
		TE.bind('invitedBy', ({ invite }) =>
			getUser({ id: invite.userId, includeBoards: false, includeNotes: false })
		),
		TE.bind('existingConnection', ({ invite }) =>
			getConnectionOrNull(invite.userId, acceptedByUser.id)
		),
		TE.bind('connection', ({ invite, existingConnection }) =>
			existingConnection
				? updateConnection({ ...existingConnection, type: 'connected' })
				: createConnection({
						userFirstId: invite.userId,
						userSecondId: acceptedByUser.id,
						type: 'connected'
					})
		),
		TE.bind('updateInvite', ({ invite }) => updateInvite({ ...invite, status: 'accepted' })),
		TE.bind('noteEditor', ({ invite }) =>
			invite.invitedToNoteId
				? addNoteEditorFromInvite({ noteId: invite.invitedToNoteId, userId: acceptedByUser.id })
				: TE.right(null)
		),
		TE.map(({ connection, invitedBy, invite, noteEditor }) => ({
			connection,
			invitedBy,
			invite,
			noteEditor
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
		TE.bind('deselectedEditors', () =>
			deselectAllNoteEditors({ userId, noteEditorUserId: friendUserId })
		),
		TE.flatMap(({ connection }) =>
			updateConnection({ ...connection, type: 'removed', updatedAt: new Date() })
		)
	);
};
