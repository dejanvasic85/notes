<script lang="ts">
	import { crossfade, slide, fade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { Tabs } from 'bits-ui';

	import { Check, X, type LucideIcon } from '@lucide/svelte';

	import Skeleton from '$components/Skeleton.svelte';
	import Button from '$components/Button.svelte';
	import LinkButton from '$components/LinkButton.svelte';
	import UserAvatar from '$components/UserAvatar.svelte';
	import { getFriendsState } from '$lib/state/friendsState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import { runOptimisticUpdate, tryFetch } from '$lib/browserFetch';

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

	async function handleCancelInvite(id: string) {
		await runOptimisticUpdate({
			apply: () => friendsState.cancelInvite(id),
			request: () => tryFetch(`/api/invites/${id}`, { method: 'DELETE' }, { shouldParse: false }),
			revert: ([index, invite]) => friendsState.addInviteAtIndex(index, invite),
			errorMessage: 'There was a problem canceling the invite. Try again.',
			toastMessages
		});
	}

	async function handleRemoveFriend(id: string) {
		if (!confirm('Are you sure you want to remove this friend?')) {
			return;
		}
		await runOptimisticUpdate({
			apply: () => friendsState.removeFriend(id),
			request: () => tryFetch(`/api/friends/${id}`, { method: 'DELETE' }, { shouldParse: false }),
			revert: ([index, friend]) => friendsState.addFriendAtIndex(index, friend),
			errorMessage: 'There was a problem removing the friend. Try again.',
			toastMessages
		});
	}

	async function handleAcceptInvite(id: string) {
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

	async function handleRejectInvite(id: string) {
		await runOptimisticUpdate({
			apply: () => friendsState.rejectInvite(id),
			request: () => tryFetch(`/api/friends/accept/${id}`, { method: 'POST' }),
			revert: ([index, invite]) => friendsState.addReceivedInviteAtIndex(index, invite),
			errorMessage: 'There was a problem removing the friend. Try again.',
			toastMessages
		});
	}

	type FriendSnippetProps = {
		name: string;
		picture?: string | null;
		showPending: boolean;
		actions?: Array<{
			id: string;
			label: string;
			icon: LucideIcon;
			onclick: (id: string) => void;
		}>;
	};
</script>

{#snippet Friend(props: FriendSnippetProps)}
	<div
		class="h-friend dark:bg-dark flex w-full items-center justify-between gap-2 p-4"
		role="listitem"
		in:fade
		out:slide={{ duration: 250 }}
	>
		<div class="flex items-center gap-2">
			{#if props.picture}
				<UserAvatar picture={props.picture} name={props.name} size={8} showTooltip={false} />
			{/if}

			<div class:italic={props.showPending} class:text-gray-400={props.showPending}>
				{props.name}
				{#if props.showPending}
					<span class="text-xs text-gray-400 italic">(pending)</span>
				{/if}
			</div>
		</div>

		<div class="flex gap-1">
			{#if props.actions}
				{#each props.actions as action}
					{@const ActionIcon = action.icon}
					<Button
						variant="ghost"
						label={action.label}
						onclick={() => action.onclick(action.id)}
						tooltip={action.label}
					>
						<ActionIcon />
					</Button>
				{/each}
			{/if}
		</div>
	</div>
{/snippet}

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
						{@render Friend({
							name: invite.friendEmail,
							showPending: true,
							actions: [
								{
									id: invite.id,
									icon: X,
									label: 'Cancel',
									onclick: handleCancelInvite
								}
							]
						})}
					{/each}

					{#each friendsState.friends as friend (friend.id)}
						{@render Friend({
							name: friend.name!,
							showPending: false,
							picture: friend.picture,
							actions: [
								{
									id: friend.id,
									icon: X,
									label: 'Remove',
									onclick: handleRemoveFriend
								}
							]
						})}
					{/each}
				</div>
			</Tabs.Content>

			<Tabs.Content value={tabs.invites} class="mt-4">
				<div class="mt-4 flex flex-col rounded-lg">
					{#if friendsState.pendingReceivedInvites.length === 0}
						<p class="p-4">No incoming invites</p>
					{:else}
						{#each friendsState.pendingReceivedInvites as invite (invite.id)}
							{@render Friend({
								name: invite.user.name!,
								picture: invite.user.picture,
								showPending: false,
								actions: [
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
								]
							})}
						{/each}
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>
