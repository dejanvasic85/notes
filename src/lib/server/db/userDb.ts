import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

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
}: GetUserByIdTaskParams): TE.TaskEither<ServerError, User> =>
	pipe(
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
		),
		TE.flatMap(fromNullableRecord(`User with id ${id} not found`)),
		TE.map((user) => ({
			...user,
			boards: !includeBoards
				? []
				: user.boards.map((board) => ({ ...board, notes: includeNotes ? board.notes : [] }))
		}))
	);

export const getUserByAuthId = (authId: string): TE.TaskEither<ServerError, User> =>
	pipe(
		tryDbTask(() => db.user.findFirst({ where: { authId } })),
		TE.flatMap(fromNullableRecord(`User with authId ${authId} not found`)),
		TE.map((user) => ({
			...user,
			boards: []
		}))
	);

export const getUserByEmail = (email: string): TE.TaskEither<ServerError, User> =>
	pipe(
		tryDbTask(() => db.user.findFirst({ where: { email } })),
		TE.flatMap(fromNullableRecord(`User with email ${email} not found`)),
		TE.map((user) => ({
			...user,
			boards: []
		}))
	);

export const getAllUsersById = (ids: string[]): TE.TaskEither<ServerError, User[]> =>
	pipe(
		tryDbTask(() => db.user.findMany({ where: { id: { in: ids } } })),
		TE.map((users) => users.map((user) => ({ ...user, boards: [] })))
	);

export const getUserByNoteId = (noteId: string): TE.TaskEither<ServerError, User> =>
	pipe(
		tryDbTask(() =>
			db.note.findFirst({
				where: { id: noteId },
				select: { board: { include: { user: true } } }
			})
		),
		TE.flatMap(fromNullableRecord(`User for note ${noteId} not found`)),
		TE.map(({ board }) => board.user),
		TE.map((user) => ({ ...user, boards: [] }))
	);

export const createUser = ({
	authUserProfile
}: {
	authUserProfile: AuthUserProfile;
}): TE.TaskEither<ServerError, User> => {
	return tryDbTask(() => {
		const { email, email_verified, name, picture, sub } = authUserProfile;
		return db.user.create({
			data: {
				id: generateId('uid'),
				authId: sub,
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
};

export const getPendingSentInvites = (userId: string): TE.TaskEither<ServerError, UserInvite[]> =>
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
): TE.TaskEither<ServerError, UserInviteWithUserProps[]> =>
	pipe(
		tryDbTask(() =>
			db.userInvite.findMany({
				where: {
					friendEmail,
					status: null
				},
				include: { user: true }
			})
		),
		TE.map((invites) =>
			invites.map(({ user, ...rest }) => {
				const inv: UserInviteWithUserProps = {
					...rest,
					user: { email: user.email, name: user.name, picture: user.picture }
				};
				return inv;
			})
		)
	);

interface GetInviteOptions {
	friendEmail?: string;
}

export const getInvite = (
	id: string,
	{ friendEmail }: GetInviteOptions = {}
): TE.TaskEither<ServerError, UserInvite> =>
	pipe(
		tryDbTask(() => db.userInvite.findFirst({ where: { id, friendEmail } })),
		TE.flatMap(fromNullableRecord(`User with authId ${id} not found`))
	);

export const getInvitesByUser = (userId: string): TE.TaskEither<ServerError, UserInvite[]> => {
	return tryDbTask(() =>
		db.userInvite.findMany({
			where: {
				userId
			}
		})
	);
};

export const createInvite = (data: UserInvite): TE.TaskEither<ServerError, UserInvite> =>
	tryDbTask(() => db.userInvite.create({ data }));

export const updateInvite = (invite: UserInvite): TE.TaskEither<ServerError, UserInvite> => {
	const { id, ...rest } = invite;
	return tryDbTask(() =>
		db.userInvite.update({ where: { id }, data: { ...rest, updatedAt: new Date() } })
	);
};

export const createConnection = (
	connection: UserConnection
): TE.TaskEither<ServerError, UserConnection> => {
	return pipe(
		tryDbTask(() =>
			db.userConnection.create({
				data: connection
			})
		)
	);
};

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
): TE.TaskEither<ServerError, UserConnection> =>
	pipe(
		getConnectionOrNull(userId, friendUserId),
		TE.flatMap(fromNullableRecord(`User connection not found for ${userId} and ${friendUserId}`))
	);

export const getConnectionOrNull = (
	userId: string,
	friendUserId: string
): TE.TaskEither<ServerError, UserConnection | null> => {
	return tryDbTask(() =>
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
};

export const updateConnection = (
	connection: UserConnection
): TE.TaskEither<ServerError, UserConnection> => {
	return tryDbTask(() =>
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
};

type UpdateUserParams = {
	id: string;
	name: string;
};

export const updateUser = ({ id, name }: UpdateUserParams): TE.TaskEither<ServerError, User> => {
	return pipe(
		tryDbTask(() =>
			db.user.update({
				where: { id },
				data: {
					name
				}
			})
		),
		TE.map((user) => ({ ...user, boards: [] }))
	);
};
