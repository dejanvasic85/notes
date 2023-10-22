import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { getBoardById, updateBoard } from '$lib/services/boardService';
import { getUserById, isBoardOwner } from '$lib/services/userService';

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
  const boardId = params.id!;
  const userId = locals.user.id!;

  // todo: validate body
  const changes = await request.json();
  const user = await getUserById(userId, { boards: true, notes: false });
  if (!user) {
    return json(null, { status: 404 });
  }

  if (!isBoardOwner(user, boardId)) {
    return json(null, { status: 403 });
  }

  const board = await getBoardById(boardId);
  if (!board) {
    return json(null, { status: 404 });
  }

  const updatedBoard = await updateBoard({ ...board, ...changes });

  return json(updatedBoard);
};
