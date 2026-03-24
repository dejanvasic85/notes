import { ResultAsync } from 'neverthrow';

import db from '$lib/server/db';
import { generateId } from '$lib/identityGenerator';
import type {
	AuthUserProfile,
	ServerError,
	User,
	UserConnection,
	UserInvite,
	UserInviteWithUserProps
} from '$lib/types';

import { fromNullableRecord, tryDbTask } from './utils';

interface GetUserByIdTaskParams {
	id: string;
	includeBoards?: boolean;
	includeNotes?: boolean;
}

export const getUser = ({
	id,
	includeBoards = true,
	includeNotes = true
}: GetUserByIdTaskParams): ResultAsync<User, ServerError> =>
	tryDbTask(() =>
		db.user.findFirst({
			where: { id },
			include: {
				boards: {
					include: {
						notes: includeNotes ? { include: { editors: true } } : false
					}
				}
			}
		})
	)
		.andThen(fromNullableRecord(`User with id ${id} not found`))
		.map((user) => ({
			...user,
			boards: !includeBoards
				? []
				: user.boards.map((board) => ({ ...board, notes: includeNotes ? board.notes : [] }))
		}));

export const getUserByEmail = (email: string): ResultAsync<User, ServerError> =>
	tryDbTask(() => db.user.findFirst({ where: { email } }))
		.andThen(fromNullableRecord(`User with email ${email} not found`))
		.map((user) => ({ ...user, boards: [] }));

export const getAllUsersById = (ids: string[]): ResultAsync<User[], ServerError> =>
	tryDbTask(() => db.user.findMany({ where: { id: { in: ids } } })).map((users) =>
		users.map((user) => ({ ...user, boards: [] }))
	);

export const getUserByNoteId = (noteId: string): ResultAsync<User, ServerError> =>
	tryDbTask(() =>
		db.note.findFirst({
			where: { id: noteId },
			select: { board: { include: { user: true } } }
		})
	)
		.andThen(fromNullableRecord(`User for note ${noteId} not found`))
		.map(({ board }) => board.user)
		.map((user) => ({ ...user, boards: [] }));

export const createUser = ({
	authUserProfile
}: {
	authUserProfile: AuthUserProfile;
}): ResultAsync<User, ServerError> =>
	tryDbTask(() => {
		const { email, email_verified, name, picture } = authUserProfile;
		return db.user.create({
			data: {
				id: generateId('uid'),
				name,
				email,
				emailVerified: email_verified,
				picture,
				boards: {
					create: [
						{
							id: generateId('bid'),
							noteOrder: []
						}
					]
				}
			},
			include: {
				boards: {
					include: {
						notes: true
					}
				}
			}
		});
	});

export const getPendingSentInvites = (userId: string): ResultAsync<UserInvite[], ServerError> =>
	tryDbTask(() =>
		db.userInvite.findMany({
			where: {
				userId,
				status: null
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	);

export const getPendingReceivedInvites = (
	friendEmail: string
): ResultAsync<UserInviteWithUserProps[], ServerError> =>
	tryDbTask(() =>
		db.userInvite.findMany({
			where: {
				friendEmail,
				status: null
			},
			include: { user: true }
		})
	).map((invites) =>
		invites.map(({ user, ...rest }) => {
			const inv: UserInviteWithUserProps = {
				...rest,
				user: { email: user.email, name: user.name, picture: user.picture }
			};
			return inv;
		})
	);

interface GetInviteOptions {
	friendEmail?: string;
}

export const getInvite = (
	id: string,
	{ friendEmail }: GetInviteOptions = {}
): ResultAsync<UserInvite, ServerError> =>
	tryDbTask(() => db.userInvite.findFirst({ where: { id, friendEmail } })).andThen(
		fromNullableRecord(`User invite with id ${id} and friendEmail ${friendEmail} not found`)
	);

export const getInvitesByUser = (userId: string): ResultAsync<UserInvite[], ServerError> =>
	tryDbTask(() =>
		db.userInvite.findMany({
			where: {
				userId
			}
		})
	);

export const createInvite = (data: UserInvite): ResultAsync<UserInvite, ServerError> =>
	tryDbTask(() => db.userInvite.create({ data }));

export const updateInvite = (invite: UserInvite): ResultAsync<UserInvite, ServerError> => {
	const { id, ...rest } = invite;
	return tryDbTask(() =>
		db.userInvite.update({ where: { id }, data: { ...rest, updatedAt: new Date() } })
	);
};

export const createConnection = (
	connection: UserConnection
): ResultAsync<UserConnection, ServerError> =>
	tryDbTask(() =>
		db.userConnection.create({
			data: connection
		})
	);

export const getConnections = (userId: string) =>
	tryDbTask(() =>
		db.userConnection.findMany({
			where: {
				OR: [{ userFirstId: userId }, { userSecondId: userId }]
			}
		})
	);

export const getConnection = (
	userId: string,
	friendUserId: string
): ResultAsync<UserConnection, ServerError> =>
	getConnectionOrNull(userId, friendUserId).andThen(
		fromNullableRecord(`User connection not found for ${userId} and ${friendUserId}`)
	);

export const getConnectionOrNull = (
	userId: string,
	friendUserId: string
): ResultAsync<UserConnection | null, ServerError> =>
	tryDbTask(() =>
		db.userConnection.findFirst({
			where: {
				OR: [
					{
						userFirstId: userId,
						userSecondId: friendUserId
					},
					{
						userFirstId: friendUserId,
						userSecondId: userId
					}
				]
			}
		})
	);

export const updateConnection = (
	connection: UserConnection
): ResultAsync<UserConnection, ServerError> =>
	tryDbTask(() =>
		db.userConnection.update({
			where: {
				userFirstId_userSecondId: {
					userFirstId: connection.userFirstId,
					userSecondId: connection.userSecondId
				}
			},
			data: {
				...connection,
				updatedAt: new Date()
			}
		})
	);

type UpdateUserParams = {
	id: string;
	name: string;
};

export const updateUser = ({ id, name }: UpdateUserParams): ResultAsync<User, ServerError> =>
	tryDbTask(() =>
		db.user.update({
			where: { id },
			data: {
				name
			}
		})
	).map((user) => ({ ...user, boards: [] }));
