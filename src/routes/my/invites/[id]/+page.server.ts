import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { acceptInvite } from '$lib/server/services/friendService';

export const load: PageServerLoad = async ({ params, locals }) => {
	const inviteId = params.id;
	const acceptedBy = locals.user!;

	const result = await acceptInvite(inviteId, {
		id: acceptedBy.id,
		email: acceptedBy.email
	}).mapErr(mapToApiError);

	return result.match(
		({ invitedBy, noteEditor }) => ({
			connected: true,
			friendName: invitedBy.name,
			noteEditor
		}),
		(err) => {
			throw error(err.status, err.message);
		}
	);
};
