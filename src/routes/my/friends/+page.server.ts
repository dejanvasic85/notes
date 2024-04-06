import { fail, error, type ActionFailure } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';

import { PUBLIC_BASE_URL } from '$env/static/public';
import { getPendingReceivedInvites, getPendingSentInvites } from '$lib/server/db/userDb';
import { acceptInvite, sendInvite } from '$lib/server/services/inviteService';
import { getFriends } from '$lib/server/services/userService';
import { mapToApiError } from '$lib/server/mapApi';

export const prerender = false;

export const load = async ({ locals }) => {
	const user = locals.user!;
	return pipe(
		TE.Do,
		TE.bind('pendingSentInvites', () => getPendingSentInvites(user.id)),
		TE.bind('pendingReceivedInvites', () => getPendingReceivedInvites(user.email!)),
		TE.bind('friends', () => getFriends(user.id)),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => {
				throw error(err.status, err.message);
			},
			({ friends, pendingReceivedInvites, pendingSentInvites }) => ({
				friends,
				pendingReceivedInvites,
				pendingSentInvites
			})
		)
	)();
};

type SendInviteResult = Promise<ActionFailure<{ message: string }> | { success: boolean }>;
type AcceptInviteResult = Promise<ActionFailure<{ message: string }> | { acceptedInvite: boolean }>;

export const actions = {
	invite: async ({ locals, request }): SendInviteResult => {
		const currentUser = locals.user!;
		const data = await request.formData();
		const friendEmail = data.get('email') as string;

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
				() => ({ success: true })
			)
		)();
	},

	acceptInvite: async ({ locals, request }): AcceptInviteResult => {
		const user = locals.user!;
		const data = await request.formData();
		const inviteId = data.get('inviteId') as string;

		return pipe(
			acceptInvite(inviteId, { id: user.id, email: user.email! }),
			TE.mapLeft(mapToApiError),
			TE.match(
				// @ts-ignore: fp-ts is expecting the same return types
				({ status, message }) => fail(status, { message }),
				() => ({ acceptedInvite: true })
			)
		)();
	}
};
