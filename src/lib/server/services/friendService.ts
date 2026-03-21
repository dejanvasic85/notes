import { ResultAsync, Result, ok, err, okAsync, errAsync } from 'neverthrow';

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
): Result<SendInviteParams, ServerError> => {
	if (!params.friendEmail) {
		return err(createError('ValidationError', 'Friend email is required'));
	}
	return params.friendEmail === params.userEmail
		? err(
				createError('ValidationError', 'Friend email should be different to current user email')
			)
		: ok(params);
};

const validateExistingInvite = (params: SendInviteParams): ResultAsync<void, ServerError> =>
	getInvitesByUser(params.userId).andThen((invites) => {
		const existingInvites = invites.filter(
			(invite) => invite.friendEmail === params.friendEmail && invite.status !== 'cancelled'
		);
		return existingInvites.length > 0
			? errAsync<void, ServerError>(createError('ValidationError', 'Friend is already invited'))
			: okAsync<void, ServerError>(void 0);
	});

export const sendInvite = (params: SendInviteParams): ResultAsync<void, ServerError> => {
	const validation = validateSendInviteParams(params);
	if (validation.isErr()) {
		return errAsync(validation.error);
	}

	return validateExistingInvite(params)
		.andThen(() =>
			createInvite({
				id: generateId('inv'),
				userId: params.userId,
				friendEmail: params.friendEmail,
				status: null,
				invitedToNoteId: params.invitedToNoteId
			})
		)
		.andThen((invite) => {
			const inviteLink = `${params.baseUrl}/my/invites/${invite.id}`;
			const html = `Hello ${params.friendEmail}.
			<p>You have been invited by ${params.name} to join them in collaborating on Notes.</p>
			<p>Accept <a href="${inviteLink}">invite</a> to get started now.</p>`;
			return sendEmail({
				to: params.friendEmail,
				subject: 'You have been invited to share notes',
				html
			});
		});
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
): ResultAsync<AcceptInviteResult, ServerError> =>
	getInvite(inviteId)
		.andThen((invite) =>
			getUser({ id: invite.userId, includeBoards: false, includeNotes: false }).map(
				(invitedBy) => ({ invite, invitedBy })
			)
		)
		.andThen(({ invite, invitedBy }) =>
			getConnectionOrNull(invite.userId, acceptedByUser.id).map((existingConnection) => ({
				invite,
				invitedBy,
				existingConnection
			}))
		)
		.andThen(({ invite, invitedBy, existingConnection }) => {
			const connectionOp = existingConnection
				? updateConnection({ ...existingConnection, type: 'connected' })
				: createConnection({
						userFirstId: invite.userId,
						userSecondId: acceptedByUser.id,
						type: 'connected'
					});
			return connectionOp.map((connection) => ({ invite, invitedBy, connection }));
		})
		.andThen(({ invite, invitedBy, connection }) =>
			updateInvite({ ...invite, status: 'accepted' }).map(() => ({ invite, invitedBy, connection }))
		)
		.andThen(({ invite, invitedBy, connection }) => {
			const noteEditorOp = invite.invitedToNoteId
				? addNoteEditorFromInvite({ noteId: invite.invitedToNoteId, userId: acceptedByUser.id })
				: okAsync<NoteEditor | null, ServerError>(null);
			return noteEditorOp.map((noteEditor) => ({ connection, invitedBy, invite, noteEditor }));
		});

export const ignoreInvite = (inviteId: string): ResultAsync<UserInvite, ServerError> =>
	getInvite(inviteId).andThen((invite) => updateInvite({ ...invite, status: 'ignored' }));

export const cancelInvite = (inviteId: string): ResultAsync<UserInvite, ServerError> =>
	getInvite(inviteId).andThen((invite) => updateInvite({ ...invite, status: 'cancelled' }));

export const removeConnection = (
	userId: string,
	friendUserId: string
): ResultAsync<UserConnection, ServerError> =>
	getConnection(userId, friendUserId)
		.andThen((connection) =>
			deselectAllNoteEditors({ userId, noteEditorUserId: friendUserId }).map(() => connection)
		)
		.andThen((connection) =>
			updateConnection({ ...connection, type: 'removed', updatedAt: new Date() })
		);
