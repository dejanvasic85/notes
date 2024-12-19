import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import type { Board, IdParams, ServerError } from '$lib/types';
import db from '$lib/server/db';
import { tryDbTask, fromNullableRecord } from './utils';

export const getBoard = ({ id }: IdParams): TE.TaskEither<ServerError, Board> =>
	pipe(
		tryDbTask(() => db.board.findFirst({ where: { id }, include: { notes: true } })),
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
			db.board.findFirst({
				where: { userId },
				include: { notes: includeNotes && { include: { editors: true } } }
			})
		),
		TE.flatMap(fromNullableRecord(`Board for user ${userId} not found`))
	);

export const updateBoard = (board: Board): TE.TaskEither<ServerError, Board> => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { notes, ...rest } = board;
	return tryDbTask(() =>
		db.board.update({
			where: { id: board.id },
			data: {
				...rest,
				updatedAt: new Date()
			},
			include: { notes: true }
		})
	);
};
