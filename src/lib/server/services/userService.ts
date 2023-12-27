import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { fetchAuthUser } from '$lib/auth/fetchUser';
import { createUser, getUserByAuthId } from '$lib/server/db/userDb';
import { createError, withError } from '$lib/server/createError';
import type { AuthUserProfile, Board, Note, ServerError, User } from '$lib/types';

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

export const getCurrentBoardForUserNote = ({
	note,
	user
}: {
	note: Note;
	user: User;
}): TE.TaskEither<ServerError, { note: Note; user: User; board: Board }> => {
	const boardId = note.boardId;
	const board = user.boards.find((b) => b.id === boardId);
	if (!board) {
		return TE.left(createError('RecordNotFound', `Board ${boardId} not found`));
	}
	return TE.right({ note, user, board });
};
