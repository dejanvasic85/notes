import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { fetchAuthUser } from '$lib/auth/fetchUser';
import { updateAuthUser, type UpdateAuthUserParams } from '$lib/auth/updateAuthUser';
import {
	createUser,
	getAllUsersById,
	getUserByAuthId,
	getUserByEmail,
	getConnections
} from '$lib/server/db/userDb';
import { createError, withError } from '$lib/server/errorFactory';
import type { AuthUserProfile, Board, Friend, ServerError, User } from '$lib/types';

interface IsBoardOwnerParams {
	board: Board;
	userId?: string;
}

export const isBoardOwner = ({
	board,
	userId
}: IsBoardOwnerParams): TE.TaskEither<ServerError, Board> =>
	board.userId === userId
		? TE.right(board)
		: TE.left(
				createError('AuthorizationError', `User ${userId} is not the owner of board ${board.id}`)
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
	email: string;
	authUserProfile: AuthUserProfile;
}

export const getOrCreateUser = ({
	email,
	authUserProfile
}: GetOrCreateUserParams): TE.TaskEither<ServerError, User> =>
	pipe(
		getUserByEmail(email),
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
