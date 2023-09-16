import { json, type RequestHandler } from '@sveltejs/kit';

import db from '$lib/db';

export const GET: RequestHandler = async ({ locals, params }) => {
	const id = params.id;
	const note = await db.note.findUnique({
		where: {
			userId: locals.user.id,
			id
		}
	});

	return json({
		note
	});
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const id = params.id;
	await db.note.delete({
		where: {
			userId: locals.user.id,
			id
		}
	});

	return new Response(null, { status: 204 });
};
