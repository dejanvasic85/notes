import * as TE from 'fp-ts/TaskEither';

import { fetchAuthUser } from '$lib/auth/fetchUser';
import db from '$lib/db';
import { createUser, getUserByAuthId } from '$lib/db/userDb';
import type { AuthUserProfile, ServerError, User, FetchError } from '$lib/types';
import { pipe } from 'fp-ts/lib/function';

export function isBoardOwner(user: User, boardId: string): boolean {
	return user.boards.some((board) => board.id === boardId);
}

const tryFetchAuthUser = ({
	accessToken
}: {
	accessToken: string;
}): TE.TaskEither<ServerError, AuthUserProfile> =>
	TE.tryCatch(
		() => fetchAuthUser({ accessToken }),
		(reason) => {
			const fetchError: FetchError = {
				_tag: 'FetchError',
				message: `Failed to fetch user with access token`,
				originalError: reason
			};
			return fetchError;
		}
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
					TE.chain((u) => createUser({ authUserProfile: u }))
				);
			}
			return TE.left(err);
		})
	);

// Deprecate this method in favour of userDb
export async function getUserById(id: string, { boards = true, notes = true } = {}): Promise<User> {
	const user = await db.user.findUniqueOrThrow({
		where: { id },
		include: {
			boards: {
				include: {
					notes
				}
			}
		}
	});

	return {
		...user,
		boards: boards
			? user.boards.map((board) => ({ ...board, notes: notes ? board.notes : [] }))
			: []
	};
}
