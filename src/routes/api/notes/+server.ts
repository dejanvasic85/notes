import { json, type RequestHandler } from '@sveltejs/kit';

import db from '$lib/db';
import { colours } from '$lib/colours';

export const POST: RequestHandler = async ({ locals }) => {
	const note = await db.note.create({
		data: {
			text: '',
			sequence: 0,
			userId: locals.user.id,
			colour: colours[0].name
		}
	});

	return json(
		{
			note
		},
		{ status: 201 }
	);
};
