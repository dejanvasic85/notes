import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import type { Board, IdParams, ServerError } from '$lib/types';
import db from '$lib/server/db';
import { tryDbTask, fromNullableRecord } from './utils';
import { withError } from '../createError';

export const getBoard = ({ id }: IdParams): TE.TaskEither<ServerError, Board> =>
	pipe(
		tryDbTask(() => db.board.findUnique({ where: { id }, include: { notes: true } })),
		TE.flatMap(fromNullableRecord(`Board ${id} not found`))
	);

export const getBoardByUserId = ({
	userId,
	includeNotes = true
}: {
	userId: string;
	includeNotes?: boolean;
}): TE.TaskEither<ServerError, Board> =>
	pipe(
		tryDbTask(() =>
			db.board.findFirstOrThrow({ where: { userId }, include: { notes: includeNotes } })
		),
		TE.flatMap(fromNullableRecord(`Board for user ${userId} not found`))
	);

export const updateBoard = (board: Board): TE.TaskEither<ServerError, Board> => {
	return TE.tryCatch(
		async () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { notes, ...rest } = board;
			const updatedBoard = await db.board.update({
				where: { id: board.id },
				data: {
					...rest,
					updatedAt: new Date()
				},
				include: { notes: true }
			});
			return updatedBoard;
		},
		withError('DatabaseError', 'Failed to update board')
	);
};
