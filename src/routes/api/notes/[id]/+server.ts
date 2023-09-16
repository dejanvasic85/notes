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

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const changes = await request.json();

	const note = await db.note.update({
		where: {
			userId: locals.user.id,
			id: params.id
		},
		data: {
			...changes
		}
	});

	return json({ note });
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
