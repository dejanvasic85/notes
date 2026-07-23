import { runOptimisticUpdate, tryFetch } from '$lib/browserFetch';
import type { FriendsState } from './friendsState.svelte';
import type { ToastMessages } from './toastMessages.svelte';

export function createFriendsActions(friendsState: FriendsState, toastMessages: ToastMessages) {
	async function cancelInvite(id: string) {
		await runOptimisticUpdate({
			apply: () => friendsState.cancelInvite(id),
			request: () => tryFetch(`/api/invites/${id}`, { method: 'DELETE' }, { shouldParse: false }),
			revert: ([index, invite]) => friendsState.addInviteAtIndex(index, invite),
			errorMessage: 'There was a problem canceling the invite. Try again.',
			toastMessages
		});
	}

	async function removeFriend(id: string) {
		await runOptimisticUpdate({
			apply: () => friendsState.removeFriend(id),
			request: () => tryFetch(`/api/friends/${id}`, { method: 'DELETE' }, { shouldParse: false }),
			revert: ([index, friend]) => friendsState.addFriendAtIndex(index, friend),
			errorMessage: 'There was a problem removing the friend. Try again.',
			toastMessages
		});
	}

	async function acceptInvite(id: string) {
		const result = await runOptimisticUpdate({
			apply: () => friendsState.acceptInvite(id),
			request: () =>
				tryFetch(
					`/api/connections`,
					{ method: 'POST', body: JSON.stringify({ inviteId: id }) },
					{ clearQueueOnError: true }
				),
			revert: ([index, invite]) => {
				friendsState.addReceivedInviteAtIndex(index, invite);
				friendsState.removeFriend(invite.userId);
			},
			errorMessage: 'There was a problem removing the friend. Try again.',
			toastMessages
		});
		if (result.type !== 'error') {
			console.log('accepted invite', result.value);
		}
	}

	async function rejectInvite(id: string) {
		await runOptimisticUpdate({
			apply: () => friendsState.rejectInvite(id),
			request: () => tryFetch(`/api/friends/accept/${id}`, { method: 'POST' }),
			revert: ([index, invite]) => friendsState.addReceivedInviteAtIndex(index, invite),
			errorMessage: 'There was a problem removing the friend. Try again.',
			toastMessages
		});
	}

	return { cancelInvite, removeFriend, acceptInvite, rejectInvite };
}
