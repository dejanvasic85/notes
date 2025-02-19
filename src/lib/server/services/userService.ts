import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { fetchAuthUser } from '$lib/auth/fetchUser';
import { updateAuthUser, type UpdateAuthUserParams } from '$lib/auth/updateAuthUser';
import {
	createUser,
	getAllUsersById,
	getUserByAuthId,
	getConnections
} from '$lib/server/db/userDb';
import { createError, withError } from '$lib/server/createError';
import type { AuthUserProfile, Board, Friend, Note, ServerError, User } from '$lib/types';

interface IsBoardOwnerParams {
	user: User;
	board: Board;
}

export const isBoardOwner = <T extends IsBoardOwnerParams>({
	user,
	board,
	...rest
}: T): TE.TaskEither<ServerError, T> =>
	user.boards.some((b) => b.id === board.id)
		? TE.right({ user, board, ...rest } as T)
		: TE.left(
				createError('AuthorizationError', `User ${user.id} is not the owner of board ${board.id}`)
			);

interface IsNoteOwnerParams {
	note: Note;
	user: User;
}

/**
 *
 * @returns true if the user is the owner of the note
 * @deprecated Use isNoteOwnerOrEditor instead
 */
export const isNoteOwner = <T extends IsNoteOwnerParams>({
	note,
	user,
	...rest
}: T): TE.TaskEither<ServerError, T> =>
	user.boards.some((board) => board.id === note.boardId)
		? TE.right({ note, user, ...rest } as T)
		: TE.left(
				createError('AuthorizationError', `User ${user.id} is not the owner of note ${note.id}`)
			);

const tryFetchAuthUser = ({
	accessToken
}: {
	accessToken: string;
}): TE.TaskEither<ServerError, AuthUserProfile> =>
	TE.tryCatch(
		() => fetchAuthUser({ accessToken }),
		withError('FetchError', 'Failed to fetch user with access token')
	);

export const tryUpdateAuthUser = (params: UpdateAuthUserParams): TE.TaskEither<ServerError, void> =>
	TE.tryCatch(() => updateAuthUser(params), withError('FetchError', 'Failed to update user'));

interface GetOrCreateUserParams {
	authId: string;
	authUserProfile: AuthUserProfile;
}

export const getOrCreateUser = ({
	authId,
	authUserProfile
}: GetOrCreateUserParams): TE.TaskEither<ServerError, User> =>
	pipe(
		getUserByAuthId(authId),
		TE.orElse((err) => {
			if (err._tag === 'RecordNotFound') {
				return createUser({ authUserProfile });
			}
			return TE.left(err);
		})
	);

interface GetOrCreateParams {
	accessToken: string;
	authId: string;
}

export const getOrCreateUserByAuth = ({
	accessToken,
	authId
}: GetOrCreateParams): TE.TaskEither<ServerError, User> =>
	pipe(
		getUserByAuthId(authId),
		TE.orElse((err) => {
			if (err._tag === 'RecordNotFound') {
				return pipe(
					tryFetchAuthUser({ accessToken }),
					TE.flatMap((u) => createUser({ authUserProfile: u }))
				);
			}
			return TE.left(err);
		})
	);

export const getFriends = (userId: string): TE.TaskEither<ServerError, Friend[]> => {
	return pipe(
		getConnections(userId),
		TE.map((connections) => {
			return connections
				.filter((c) => c.type === 'connected')
				.map((c) => (c.userFirstId === userId ? c.userSecondId : c.userFirstId));
		}),
		TE.flatMap((friendIds) => getAllUsersById(friendIds)),
		TE.map((friends) => {
			return friends.map((friend) => {
				const data: Friend = {
					email: friend.email,
					id: friend.id,
					name: friend.name,
					picture: friend.picture
				};
				return data;
			});
		})
	);
};
