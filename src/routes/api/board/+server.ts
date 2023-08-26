import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals }) => {
	// console.log('headers', request.headers);
	// console.log('locals', locals);

	return json({
		hello: 'world'
	});
};
