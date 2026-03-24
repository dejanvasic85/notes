import { type RequestHandler, json, error } from '@sveltejs/kit';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { acceptInvite } from '$lib/server/services/friendService';

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user!;
	const body = await request.json();

	const result = await acceptInvite(body.inviteId, {
		id: user.id,
		email: user.email!
	}).mapErr(mapToApiError);

	return result.match(
		(connection) => json(connection),
		(err) => error(err.status, { message: err.message })
	);
};
