import { error, type RequestHandler } from '@sveltejs/kit';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { cancelInvite } from '$lib/server/services/friendService';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	const result = await cancelInvite(params.id!).mapErr(mapToApiError);

	return result.match(
		() => new Response(null, { status: 204 }),
		(err) => error(err.status, { message: err.message })
	);
};
