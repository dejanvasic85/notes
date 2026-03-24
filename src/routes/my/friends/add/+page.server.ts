import { redirect, fail, type Actions } from '@sveltejs/kit';

import { PUBLIC_BASE_URL } from '$env/static/public';
import { sendInvite } from '$lib/server/services/friendService';
import { mapToApiError } from '$lib/server/apiResultMapper';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const friendEmail = formData.get('email') as string;
		const invitedToNoteId = formData.get('invitedToNoteId') as string;
		const currentUser = locals.user!;

		const result = await sendInvite({
			baseUrl: PUBLIC_BASE_URL,
			friendEmail,
			name: currentUser.name!,
			userEmail: currentUser.email!,
			userId: currentUser.id,
			invitedToNoteId: invitedToNoteId || null
		}).mapErr(mapToApiError);

		return result.match(
			() => redirect(303, '/my/friends'),
			({ status, message }) => fail(status, { message, status })
		);
	}
} satisfies Actions;
