import db from '$lib/db';

import type { Board } from '$lib/types';

export async function updateBoard(board: Board) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { notes, ...rest } = board;
  await db.board.update({
    where: { id: board.id },
    data: {
      ...rest,
      updatedAt: new Date(),
    },
  });
}
