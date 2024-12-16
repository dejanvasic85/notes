import { fail, error, type ActionFailure } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';

import { getPendingReceivedInvites, getPendingSentInvites } from '$lib/server/db/userDb';
import {
	acceptInvite,
	ignoreInvite,
	cancelInvite,
	removeConnection
} from '$lib/server/services/inviteService';
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

type AcceptInviteResult = Promise<ActionFailure<{ message: string }> | { acceptedInvite: boolean }>;
type IgnoreInviteResult = Promise<ActionFailure<{ message: string }> | { ignoredInvite: boolean }>;

export const actions = {
	['accept-invite']: async ({ locals, request }): AcceptInviteResult => {
		const user = locals.user!;
		const data = await request.formData();
		const inviteId = data.get('id') as string;

		return pipe(
			acceptInvite(inviteId, { id: user.id, email: user.email! }),
			TE.mapLeft(mapToApiError),
			TE.match(
				// @ts-ignore: fp-ts is expecting the same return types
				({ status, message }) => fail(status, { message }),
				() => ({ acceptedInvite: true })
			)
		)();
	},

	// todo: authorization (does the invite id belong to the user?)
	['cancel-invite']: async ({ request }) => {
		const data = await request.formData();
		const inviteId = data.get('id') as string;

		return pipe(
			cancelInvite(inviteId),
			TE.mapLeft(mapToApiError),
			TE.match(
				// @ts-ignore: fp-ts is expecting the same return types
				({ status, message }) => fail(status, { message }),
				() => ({ canceledInvite: true })
			)
		)();
	},

	// todo: authorization (does the invite id belong to the user?)
	['reject-invite']: async ({ request }): IgnoreInviteResult => {
		const data = await request.formData();
		const inviteId = data.get('id') as string;

		return pipe(
			ignoreInvite(inviteId),
			TE.mapLeft(mapToApiError),
			TE.match(
				// @ts-ignore: fp-ts is expecting the same return types
				({ status, message }) => fail(status, { message }),
				() => ({ ignoredInvite: true })
			)
		)();
	},

	['remove-friend']: async ({ locals, request }) => {
		const formData = await request.formData();
		const friendId = formData.get('id') as string;

		return pipe(
			removeConnection(locals.user!.id, friendId),
			TE.mapLeft(mapToApiError),
			TE.match(
				// @ts-ignore: fp-ts is expecting the same return types
				({ status, message }) => fail(status, { message }),
				() => ({ connectionRemoved: true })
			)
		)();
	}
};
