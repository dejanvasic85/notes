import { json, type RequestHandler } from '@sveltejs/kit';

import db from '$lib/db';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { id, text, colour = null } = await request.json();

	// todo: validate id, text, colour

	const note = await db.note.create({
		data: {
			id,
			text,
			userId: locals.user.id,
			colour
		}
	});

	return json(
		{
			note
		},
		{ status: 201 }
	);
};
