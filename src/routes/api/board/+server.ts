import { json, type RequestHandler } from '@sveltejs/kit';
//import db from '$lib/db';

export const GET: RequestHandler = async ({ locals }) => {
	console.log('locals', locals);

	return json({
		notes: []
	});
};
