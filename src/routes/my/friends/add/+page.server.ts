import { redirect } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';

import { PUBLIC_BASE_URL } from '$env/static/public';
import { sendInvite } from '$lib/server/services/inviteService';
import { mapToApiError } from '$lib/server/mapApi';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const friendEmail = formData.get('email') as string;

		if (!friendEmail) {
			return {
				status: 400,
				body: {
					message: 'Email is required'
				},
				data: { email: friendEmail }
			};
		}

		const currentUser = locals.user!;

		return pipe(
			sendInvite({
				baseUrl: PUBLIC_BASE_URL,
				friendEmail,
				name: currentUser.name!,
				userEmail: currentUser.email!,
				userId: currentUser.id
			}),
			TE.mapLeft(mapToApiError),
			TE.match(
				// @ts-ignore: fp-ts is expecting the same return types
				({ status, message }) => fail(status, { message }),
				() => redirect(303, '/my/friends')
			)
		)();
	}
};
