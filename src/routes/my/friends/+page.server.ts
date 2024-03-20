import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';
import { getUserInvites } from '$lib/server/db/userDb';
import { fail } from '@sveltejs/kit';

export const prerender = false;

export const load = async ({ locals }) => {
	return pipe(
		getUserInvites(locals.user!.id),
		TE.match(
			() => {
				throw new Error('Board not found');
			},
			(invites) => ({
				invites
			})
		)
	)();
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email');

		if (!email) {
			return fail(400, { missing: 'email' });
		}

		return { success: true };
	}
};
