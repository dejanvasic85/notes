import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { fetchAuthUserByEmail } from '$lib/auth/fetchUser';
import { updateAuthUser } from '$lib/auth/updateAuthUser';
import { createUser, getAllUsersById, getUserByEmail, getConnections } from '$lib/server/db/userDb';
import { createError } from '$lib/server/errorFactory';
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

type UpdateUserParams = {
	email: string;
	name: string;
};

export const tryUpdateAuthUser = (params: UpdateUserParams): TE.TaskEither<ServerError, void> =>
	pipe(
		fetchAuthUserByEmail(params.email),
		TE.flatMap((user) =>
			updateAuthUser({
				authId: user.user_id,
				name: params.name
			})
		)
	);

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
