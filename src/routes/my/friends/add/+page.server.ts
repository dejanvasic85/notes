import { redirect, fail } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';

import { PUBLIC_BASE_URL } from '$env/static/public';
import { sendInvite } from '$lib/server/services/friendService';
import { mapToApiError } from '$lib/server/mapApi';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const friendEmail = formData.get('email') as string;
		const invitedToNoteId = formData.get('invitedToNoteId') as string;
		const currentUser = locals.user!;

		return pipe(
			sendInvite({
				baseUrl: PUBLIC_BASE_URL,
				friendEmail,
				name: currentUser.name!,
				userEmail: currentUser.email!,
				userId: currentUser.id,
				invitedToNoteId: invitedToNoteId || null
			}),
			TE.mapLeft(mapToApiError),
			TE.match(
				// @ts-ignore: fp-ts is expecting the same return types
				({ status, message }) => fail(status, { message, status }),
				() => redirect(303, '/my/friends')
			)
		)();
	}
};
