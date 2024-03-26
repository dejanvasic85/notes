import { fail } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';

import { PUBLIC_BASE_URL } from '$env/static/public';
import { getUserInvites } from '$lib/server/db/userDb';
import { sendInvite } from '$lib/server/services/userService';

export const prerender = false;

export const load = async ({ locals }) => {
	return pipe(
		getUserInvites(locals.user!.id),
		TE.match(
			(err) => {
				console.log('err', err);
				throw new Error('User not found');
			},
			(invites) => ({
				invites
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
