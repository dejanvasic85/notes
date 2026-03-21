import { json, type RequestHandler } from '@sveltejs/kit';

import { getUser } from '$lib/server/db/userDb';
import { mapToApiError } from '$lib/server/apiResultMapper';

export const GET: RequestHandler = async ({ locals }) => {
	const result = await getUser({ id: locals.user!.id }).mapErr(mapToApiError);

	return result.match(
		(user) => json(user),
		(err) => json({ message: err.message }, { status: err.status })
	);
};
