import type { Board, ServerError } from '$lib/types';
import { taskEither as TE } from 'fp-ts';
import db from '$lib/server/db';
import { createFromError } from '../createError';

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
		createFromError('DatabaseError', 'Failed to update board')
	);
};
