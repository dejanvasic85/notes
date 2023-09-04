import { json, type RequestHandler } from '@sveltejs/kit';
import db from '$lib/db';

export const GET: RequestHandler = async () => {
	const data = await db.note.create({
		data: {
			colour: 'red',
			sequence: 1,
			text: 'hello world',
			userId: 'f07414a4-e445-4fd3-8926-03974446c0f5'
		}
	});

	return json({
		hello: data
	});
};
