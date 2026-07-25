import { ResultAsync } from 'neverthrow';

import type { Board, IdParams, ServerError } from '$lib/types';
import db from '$lib/server/db';
import { decryptNotes } from './noteEncryption';
import { tryDbTask, fromNullableRecord } from './utils';

const decryptBoardNotes = async (board: Board): Promise<Board> =>
	board.notes ? { ...board, notes: await decryptNotes(board.notes) } : board;

export const getBoard = ({ id }: IdParams): ResultAsync<Board, ServerError> =>
	tryDbTask(() => db.board.findFirst({ where: { id }, include: { notes: true } }))
		.andThen(fromNullableRecord(`Board ${id} not found`))
		.andThen((board) => tryDbTask(() => decryptBoardNotes(board), 'Failed to decrypt board notes'));

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
	)
		.andThen(fromNullableRecord(`Board for user ${userId} not found`))
		.andThen((board) => tryDbTask(() => decryptBoardNotes(board), 'Failed to decrypt board notes'));

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
	).andThen((updated) =>
		tryDbTask(() => decryptBoardNotes(updated), 'Failed to decrypt board notes')
	);
};
