<script lang="ts">
	import { onMount } from 'svelte';
	import { crossfade, slide, fade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	import { createTabs, melt } from '@melt-ui/svelte';

	import Skeleton from '$components/Skeleton.svelte';
	import Button from '$components/Button.svelte';
	import LinkButton from '$components/LinkButton.svelte';
	import Icon from '$components/Icon.svelte';

	import { getFriendsState } from '$lib/state/friendsState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import { getFetchState } from '$lib/state/fetchState.svelte';
	import type { IconName } from '$lib/icons';
	import { tryFetch } from '$lib/browserFetch';

	const {
		elements: { root: tabRoot, list, content, trigger },
		states: { value }
	} = createTabs({ defaultValue: 'Friends' });

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});

	const tabs = {
		friends: 'Friends',
		invites: 'Invites'
	} as const;

	const friendsState = getFriendsState();
	const toastMessages = getToastMessages();
	const fetchState = getFetchState();
	const numberOfSkeletons = 4;

	let loading = $state(false);
	let loadingError = $state('');

	onMount(() => {
		if (fetchState.shouldFetch('friends')) {
			loading = true;
			fetch('/api/friends')
				.then((data) => data.json())
				.then((data) => {
					loading = false;
					friendsState.setState(data.friends, data.pendingSentInvites, data.pendingReceivedInvites);
					fetchState.setFetched('friends');
				})
				.catch((err) => {
					loadingError = err.message;
				});
		}
	});

	async function handleCancelInvite(id: string) {
		const [index, invite] = friendsState.cancelInvite(id);
		const result = await tryFetch(`/api/invites/${id}`, { method: 'DELETE' });
		if (result.type === 'error') {
			toastMessages.addMessage({
				type: 'error',
				message: 'There was a problem canceling the invite. Try again.'
			});
			friendsState.addInviteAtIndex(index, invite);
		}
	}

	async function handleRemoveFriend(id: string) {
		const [index, friend] = friendsState.removeFriend(id);
		const result = await tryFetch(`/api/friends/${id}`, { method: 'DELETE' });
		if (result.type === 'error') {
			toastMessages.addMessage({
				type: 'error',
				message: 'There was a problem removing the friend. Try again.'
			});
			friendsState.addFriendAtIndex(index, friend);
		}
	}

	async function handleAcceptInvite(id: string) {
		const [index, invite] = friendsState.acceptInvite(id);
		const result = await tryFetch(`/api/connections`, {
			method: 'POST',
			body: JSON.stringify({
				inviteId: id
			})
		});
		if (result.type === 'error') {
			toastMessages.addMessage({
				type: 'error',
				message: 'There was a problem removing the friend. Try again.'
			});
			friendsState.addReceivedInviteAtIndex(index, invite);
			friendsState.removeFriend(invite.userId);
		} else {
			console.log('accepted invite', result.value);
		}
	}

	async function handleRejectInvite(id: string) {
		const [index, invite] = friendsState.rejectInvite(id);
		const result = await tryFetch(`/api/friends/accept/${id}`, { method: 'POST' });
		if (result.type === 'error') {
			toastMessages.addMessage({
				type: 'error',
				message: 'There was a problem removing the friend. Try again.'
			});
			friendsState.addReceivedInviteAtIndex(index, invite);
		}
	}

	type FriendSnippetProps = {
		name: string;
		picture?: string | null;
		showPending: boolean;
		actions?: Array<{
			id: string;
			label: string;
			icon: IconName;
			onclick: (id: string) => void;
		}>;
	};
</script>

{#snippet Friend(props: FriendSnippetProps)}
	<div
		class="flex h-friend w-full items-center justify-between gap-2 p-4 dark:bg-dark"
		role="listitem"
		in:fade
		out:slide={{ duration: 250 }}
	>
		<div class="flex items-center gap-2">
			{#if props.picture}
				<img src={props.picture} class="h-10 rounded-full" alt="picture of {props.name}" />
			{/if}
			<span class:italic={props.showPending} class:text-gray-400={props.showPending}
				>{props.name} {props.showPending ? '(pending)' : ''}</span
			>
		</div>

		<div class="flex gap-1">
			{#if props.actions}
				{#each props.actions as action}
					<Button variant="ghost" label={action.label} onclick={() => action.onclick(action.id)}>
						<Icon icon={action.icon} fill="none" />
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
				{#each Array(numberOfSkeletons) as _, i}
					<div class="h-friend w-full">
						<Skeleton />
					</div>
				{/each}
			</div>
		</div>
	{:else if loadingError}
		<p class="text-error" role="alert">There was a problem loading your friends.</p>
		<Button onclick={() => window.location.reload()}>Retry</Button>
	{:else}
		<div use:melt={$tabRoot}>
			<div use:melt={$list} aria-label="Manage your friends and invites">
				<button use:melt={$trigger(tabs.friends)} class="trigger relative p-4 text-xl">
					<div class="relative p-2">Friends</div>
					{#if $value === tabs.friends}
						<div
							in:send={{ key: 'trigger' }}
							out:receive={{ key: 'trigger' }}
							class="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-tertiary"
						></div>
					{/if}
				</button>
				<button use:melt={$trigger(tabs.invites)} class="trigger relative p-4 text-xl">
					<div class="relative p-2">
						Invites
						{#if friendsState.pendingReceivedInvites.length > 0}
							<span
								role="status"
								aria-label="You have pending invites"
								class="absolute right-0 top-0 h-3 w-3 rounded-full bg-tertiary"
							></span>
						{/if}
					</div>
					{#if $value === tabs.invites}
						<div
							in:send={{ key: 'trigger' }}
							out:receive={{ key: 'trigger' }}
							class="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-tertiary"
						></div>
					{/if}
				</button>
			</div>
			<div use:melt={$content(tabs.friends)} class="mt-4">
				<div class="flex justify-end">
					<LinkButton variant="primary" href="/my/friends/add">Add friend</LinkButton>
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
									icon: 'x-mark',
									label: 'Cancel',
									onclick: handleCancelInvite
								}
							]
						})}
					{/each}

					{#each friendsState.friends as friend}
						{@render Friend({
							name: friend.name!,
							showPending: false,
							picture: friend.picture,
							actions: [
								{
									id: friend.id,
									icon: 'x-mark',
									label: 'Remove',
									onclick: handleRemoveFriend
								}
							]
						})}
					{/each}
				</div>
			</div>

			<div use:melt={$content(tabs.invites)} class="mt-4">
				<div class="mt-4 flex flex-col rounded-lg">
					{#if friendsState.pendingReceivedInvites.length === 0}
						<p class="p-4">No incoming invites</p>
					{:else}
						{#each friendsState.pendingReceivedInvites as invite}
							{@render Friend({
								name: invite.user.name!,
								picture: invite.user.picture,
								showPending: false,
								actions: [
									{
										id: invite.id,
										icon: 'check',
										label: 'Accept',
										onclick: handleAcceptInvite
									},
									{
										id: invite.id,
										icon: 'x-mark',
										label: 'Reject',
										onclick: handleRejectInvite
									}
								]
							})}
						{/each}
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
