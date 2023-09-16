import { json, type RequestHandler } from '@sveltejs/kit';
import db from '$lib/db';

export const GET: RequestHandler = async ({ locals }) => {
	const { id } = locals.user;
	const notes = await db.note.findMany({ where: { userId: id } });

	return json({
		notes
	});
};
