import { fail, error } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';

import { PUBLIC_BASE_URL } from '$env/static/public';
import { getUserInvites } from '$lib/server/db/userDb';
import { sendInvite } from '$lib/server/services/inviteService';
import { getFriends } from '$lib/server/services/userService';
import { mapToApiError } from '$lib/server/mapApi.js';

export const prerender = false;

export const load = async ({ locals }) => {
	const userId = locals.user!.id;
	return pipe(
		TE.Do,
		TE.bind('invites', () => getUserInvites(userId)),
		TE.bind('friends', () => getFriends(userId)),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => {
				throw error(err.status, err.message);
			},
			({ invites, friends }) => ({
				invites,
				friends
			})
		)
	)();
};

export const actions = {
	default: async ({ locals, request }) => {
		const userId = locals.user!.id;
		const name = locals.user!.name!;
		const data = await request.formData();
		const friendEmail = data.get('email') as string;

		if (!friendEmail) {
			return fail(400, { missing: 'friendEmail' });
		}

		await sendInvite({ baseUrl: PUBLIC_BASE_URL, userId, name, friendEmail })();

		return { success: true };
	}
};
