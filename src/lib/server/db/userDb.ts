import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import db from '$lib/server/db';
import { generateId } from '$lib/identityGenerator';
import type { AuthUserProfile, ServerError, User, UserInvite } from '$lib/types';

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
			db.user.findUnique({
				where: { id },
				include: {
					boards: {
						include: {
							notes: includeNotes
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
		tryDbTask(() => db.user.findUnique({ where: { authId } })),
		TE.flatMap(fromNullableRecord(`User with authId ${authId} not found`)),
		TE.map((user) => ({
			...user,
			boards: []
		}))
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

export const getUserInvites = (uid: string): TE.TaskEither<ServerError, UserInvite[]> =>
	tryDbTask(() =>
		db.userInvite.findMany({
			where: {
				userId: uid,
				acceptedAt: null
			}
		})
	);

interface GetInviteOptions {
	friendEmail?: string;
}

export const getInvite = (
	id: string,
	{ friendEmail }: GetInviteOptions = {}
): TE.TaskEither<ServerError, UserInvite> =>
	pipe(
		tryDbTask(() => db.userInvite.findUnique({ where: { id, friendEmail } })),
		TE.flatMap(fromNullableRecord(`User with authId ${id} not found`))
	);

export const createInvite = (invite: UserInvite): TE.TaskEither<ServerError, UserInvite> =>
	tryDbTask(() => db.userInvite.create({ data: invite }));
