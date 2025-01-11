<script lang="ts">
	import { crossfade, slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	import { createTabs, melt } from '@melt-ui/svelte';

	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import LinkButton from '$components/LinkButton.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';

	import { type IconName } from '$lib/icons';

	type Props = {
		data: PageData;
		form: ActionData;
	};

	let { data }: Props = $props();
	let itemsInProgress = $state<string[]>([]);
	const toastMessages = getToastMessages();

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

	type FriendSnippetProps = {
		name: string;
		picture?: string | null;
		isPending: boolean;
		actions?: Array<{
			id: string;
			label: string;
			actionName: string;
			icon: IconName;
		}>;
	};
</script>

{#snippet Friend(props: FriendSnippetProps)}
	<div
		class="flex h-friend w-full items-center justify-between gap-2 rounded-lg bg-white p-4 dark:bg-dark"
		role="listitem"
		out:slide={{ duration: 100 }}
	>
		<div class="flex items-center gap-2">
			{#if props.picture}
				<img src={props.picture} class="h-10 rounded-full" alt="picture of {props.name}" />
			{/if}
			<span class:italic={props.isPending} class:text-gray-400={props.isPending}
				>{props.name} {props.isPending ? '(pending)' : ''}</span
			>
		</div>

		<div class="flex gap-1">
			{#if props.actions}
				{#each props.actions as action}
					<form
						method="POST"
						action={action.actionName}
						use:enhance={() => {
							itemsInProgress = [...itemsInProgress, action.id];
							return async ({ result, update }) => {
								update();
								itemsInProgress = itemsInProgress.filter((id) => id !== action.id);
								if (result.type === 'failure') {
									toastMessages.addMessage({
										type: 'error',
										message: result.data?.message as string
									});
								}
							};
						}}
					>
						<input type="hidden" name="id" value={action.id} />
						<Button
							variant="ghost"
							disabled={itemsInProgress.includes(action.id)}
							label={action.label}
						>
							<Icon icon={action.icon} />
						</Button>
					</form>
				{/each}
			{/if}
		</div>
	</div>
{/snippet}

<h1 class="text-2xl">Friends</h1>
<p>Connect with your friends to share notes.</p>

<div class="mt-4">
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
					{#if data.pendingReceivedInvites.length > 0}
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
			<div class="flex flex-col gap-4 xl:w-1/2">
				<div class="flex justify-end">
					<LinkButton variant="primary" href="/my/friends/add">Add friend</LinkButton>
				</div>

				{#if data.friends.length === 0 && data.pendingSentInvites.length === 0}
					<p>No friends yet. Add a friend to invite someone to share your notes with.</p>
				{/if}

				{#each data.pendingSentInvites as invite (invite.id)}
					{@render Friend({
						name: invite.friendEmail,
						isPending: true,
						actions: [
							{
								actionName: '?/cancel-invite',
								id: invite.id,
								icon: 'x-mark',
								label: 'Cancel'
							}
						]
					})}
				{/each}

				{#each data.friends as friend}
					{@render Friend({
						name: friend.name!,
						isPending: false,
						picture: friend.picture,
						actions: [
							{
								actionName: '?/remove-friend',
								id: friend.id,
								icon: 'x-mark',
								label: 'Remove'
							}
						]
					})}
				{/each}
			</div>
		</div>

		<div use:melt={$content(tabs.invites)} class="mt-4">
			<div class="flex flex-col gap-4 lg:w-1/2">
				{#if data.pendingReceivedInvites.length === 0}
					<p>No incoming invites</p>
				{:else}
					{#each data.pendingReceivedInvites as invite}
						{@render Friend({
							name: invite.user.name!,
							isPending: false,
							actions: [
								{
									actionName: '?/accept-invite',
									id: invite.id,
									icon: 'check',
									label: 'Accept'
								},
								{
									actionName: '?/reject-invite',
									id: invite.id,
									icon: 'x-mark',
									label: 'Reject'
								}
							]
						})}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
