import { ResultAsync, Result, ok, err, errAsync } from 'neverthrow';

import { fetchAuthUserByEmail } from '$lib/auth/fetchUser';
import { updateAuthUser } from '$lib/auth/updateAuthUser';
import { createUser, getAllUsersById, getUserByEmail, getConnections } from '$lib/server/db/userDb';
import { createError } from '$lib/server/errorFactory';
import type { AuthUserProfile, Board, Friend, ServerError, User } from '$lib/types';

interface IsBoardOwnerParams {
	board: Board;
	userId?: string;
}

export const isBoardOwner = ({ board, userId }: IsBoardOwnerParams): Result<Board, ServerError> =>
	board.userId === userId
		? ok(board)
		: err(
				createError('AuthorizationError', `User ${userId} is not the owner of board ${board.id}`)
			);

type UpdateUserParams = {
	email: string;
	name: string;
};

export const tryUpdateAuthUser = (params: UpdateUserParams): ResultAsync<void, ServerError> =>
	fetchAuthUserByEmail(params.email).andThen((user) =>
		updateAuthUser({
			authId: user.user_id,
			name: params.name
		})
	);

interface GetOrCreateUserParams {
	email: string;
	authUserProfile: AuthUserProfile;
}

export const getOrCreateUser = ({
	email,
	authUserProfile
}: GetOrCreateUserParams): ResultAsync<User, ServerError> =>
	getUserByEmail(email).orElse((e) => {
		if (e._tag === 'RecordNotFound') {
			return createUser({ authUserProfile });
		}
		return errAsync(e);
	});

export const getFriends = (userId: string): ResultAsync<Friend[], ServerError> =>
	getConnections(userId)
		.map((connections) =>
			connections
				.filter((c) => c.type === 'connected')
				.map((c) => (c.userFirstId === userId ? c.userSecondId : c.userFirstId))
		)
		.andThen((friendIds) => getAllUsersById(friendIds))
		.map((friends) =>
			friends.map((friend) => {
				const data: Friend = {
					email: friend.email,
					id: friend.id,
					name: friend.name,
					picture: friend.picture
				};
				return data;
			})
		);
