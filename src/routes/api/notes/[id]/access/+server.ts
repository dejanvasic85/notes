import { type RequestHandler, json } from '@sveltejs/kit';

import { getNoteById } from '$lib/server/services/noteService';
import { isBoardOwner } from '$lib/server/services/userService';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const noteId = params.id!;
	const note = await getNoteById(noteId);
	if (!note) {
		return json(null, { status: 404 });
	}

	if (!isBoardOwner(locals.user, note.boardId!)) {
		return json(null, { status: 403 });
	}

	const { email } = await request.json();

	// todo: check if another user exists with this email, otherwise send an invite and create note access invite

	return json({ email });
};
