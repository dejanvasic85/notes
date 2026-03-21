import { ResultAsync } from 'neverthrow';

import type { Board, IdParams, ServerError } from '$lib/types';
import db from '$lib/server/db';
import { tryDbTask, fromNullableRecord } from './utils';

export const getBoard = ({ id }: IdParams): ResultAsync<Board, ServerError> =>
	tryDbTask(() => db.board.findFirst({ where: { id }, include: { notes: true } })).andThen(
		fromNullableRecord(`Board ${id} not found`)
	);

export const getBoardByUserId = ({
	userId,
	includeNotes = true
}: {
	userId: string;
	includeNotes?: boolean;
}): ResultAsync<Board, ServerError> =>
	tryDbTask(() =>
		db.board.findFirst({
			where: { userId },
			include: { notes: includeNotes && { include: { editors: true } } }
		})
	).andThen(fromNullableRecord(`Board for user ${userId} not found`));

export const updateBoard = (board: Board): ResultAsync<Board, ServerError> => {
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
