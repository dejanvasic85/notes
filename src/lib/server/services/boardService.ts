import db from '$lib/db';

import type { Board } from '$lib/types';

export async function updateBoard(board: Board, includeNotes: boolean = false): Promise<Board> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { notes, ...rest } = board;
	const updatedBoard = await db.board.update({
		where: { id: board.id },
		data: {
			...rest,
			updatedAt: new Date()
		},
		include: { notes: includeNotes }
	});

	return updatedBoard;
}

export async function getBoardById(id: string): Promise<Board | null> {
	return await db.board.findUnique({
		where: { id },
		include: { notes: true }
	});
}
