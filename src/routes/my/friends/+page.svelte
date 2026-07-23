<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { Tabs } from 'bits-ui';

	import { Check, X } from '@lucide/svelte';

	import Skeleton from '$components/Skeleton.svelte';
	import LinkButton from '$components/LinkButton.svelte';
	import FriendListItem from '$components/FriendListItem.svelte';
	import { getFriendsState } from '$lib/state/friendsState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import { createFriendsActions } from '$lib/state/friendsActions';

	const tabs = {
		friends: 'Friends',
		invites: 'Invites'
	} as const;

	type TabValue = (typeof tabs)[keyof typeof tabs];

	let activeTab: TabValue = $state(tabs.friends);

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});

	const friendsState = getFriendsState();
	const toastMessages = getToastMessages();
	const numberOfSkeletons = 4;

	let loading = $derived(friendsState.loading);

	const {
		cancelInvite: handleCancelInvite,
		removeFriend,
		acceptInvite: handleAcceptInvite,
		rejectInvite: handleRejectInvite
	} = createFriendsActions(friendsState, toastMessages);

	async function handleRemoveFriend(id: string) {
		if (!confirm('Are you sure you want to remove this friend?')) {
			return;
		}
		await removeFriend(id);
	}
</script>

<h1 class="text-2xl">Friends</h1>
<p>Connect with your friends to share notes.</p>

<div class="xl:w-1/2">
	{#if loading}
		<div class="mt-16">
			<div class="grid gap-2">
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each Array(numberOfSkeletons) as _, __}
					<div class="h-friend w-full">
						<Skeleton />
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List aria-label="Manage your friends and invites">
				<Tabs.Trigger value={tabs.friends} class="trigger relative p-4 text-xl">
					<div class="relative p-2">Friends</div>
					{#if activeTab === tabs.friends}
						<div
							in:send={{ key: 'trigger' }}
							out:receive={{ key: 'trigger' }}
							class="bg-secondary absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full"
						></div>
					{/if}
				</Tabs.Trigger>
				<Tabs.Trigger value={tabs.invites} class="trigger relative p-4 text-xl">
					<div class="relative p-2">
						Invites
						{#if friendsState.pendingReceivedInvites.length > 0}
							<span
								role="status"
								aria-label="You have pending invites"
								class="bg-secondary absolute top-0 right-0 h-3 w-3 rounded-full"
							></span>
						{/if}
					</div>
					{#if activeTab === tabs.invites}
						<div
							in:send={{ key: 'trigger' }}
							out:receive={{ key: 'trigger' }}
							class="bg-secondary absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full"
						></div>
					{/if}
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value={tabs.friends} class="mt-4">
				<div class="flex justify-end">
					<LinkButton variant="secondary" href="/my/friends/add">Add friend</LinkButton>
				</div>
				<div class="mt-4 flex flex-col rounded-lg">
					{#if friendsState.friends.length === 0 && friendsState.pendingSentInvites.length === 0}
						<p class="p-4">
							No friends yet. Add a friend to invite someone to share your notes with.
						</p>
					{/if}
					{#each friendsState.pendingSentInvites as invite (invite.id)}
						<FriendListItem
							name={invite.friendEmail}
							showPending={true}
							actions={[
								{
									id: invite.id,
									icon: X,
									label: 'Cancel',
									onclick: handleCancelInvite
								}
							]}
						/>
					{/each}

					{#each friendsState.friends as friend (friend.id)}
						<FriendListItem
							name={friend.name!}
							showPending={false}
							picture={friend.picture}
							actions={[
								{
									id: friend.id,
									icon: X,
									label: 'Remove',
									onclick: handleRemoveFriend
								}
							]}
						/>
					{/each}
				</div>
			</Tabs.Content>

			<Tabs.Content value={tabs.invites} class="mt-4">
				<div class="mt-4 flex flex-col rounded-lg">
					{#if friendsState.pendingReceivedInvites.length === 0}
						<p class="p-4">No incoming invites</p>
					{:else}
						{#each friendsState.pendingReceivedInvites as invite (invite.id)}
							<FriendListItem
								name={invite.user.name!}
								picture={invite.user.picture}
								showPending={false}
								actions={[
									{
										id: invite.id,
										icon: Check,
										label: 'Accept',
										onclick: handleAcceptInvite
									},
									{
										id: invite.id,
										icon: X,
										label: 'Reject',
										onclick: handleRejectInvite
									}
								]}
							/>
						{/each}
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>
