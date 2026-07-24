import { error, type RequestHandler } from '@sveltejs/kit';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { ignoreInvite } from '$lib/server/services/friendService';

export const POST: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	const result = await ignoreInvite(params.id!).mapErr(mapToApiError);

	return result.match(
		() => new Response(null, { status: 204 }),
		(err) => error(err.status, { message: err.message })
	);
};
