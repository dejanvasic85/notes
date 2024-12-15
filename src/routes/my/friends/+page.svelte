<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import type { ActionData, PageData } from './$types';

	import { createTabs, melt } from '@melt-ui/svelte';

	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import LinkButton from '$components/LinkButton.svelte';

	import { type IconName } from '$lib/icons';

	type Props = {
		data: PageData;
		form: ActionData;
	};

	let { data }: Props = $props();

	const {
		elements: { root, list, content, trigger },
		states: { value }
	} = createTabs({ defaultValue: 'friends' });

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});

	const tabTriggers = [
		{
			id: 'friends',
			label: 'Friends'
		},
		{
			id: 'invites',
			label: 'Invites'
		}
	];

	type FriendSnippetProps = {
		name: string;
		picture?: string | null;
		isPending: boolean;
		actions?: Array<{
			label: string;
			actionName: string;
			data: Record<string, unknown>;
			icon: IconName;
		}>;
	};
</script>

{#snippet Friend(props: FriendSnippetProps)}
	<div
		class="flex h-20 w-full items-center justify-between gap-2 rounded-lg bg-white p-4 dark:bg-slate-800"
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
					<form method="POST" action={action.actionName}>
						{#each Object.entries(action.data) as [key, value]}
							<input type="hidden" name={key} {value} />
						{/each}
						<Button variant="ghost" type="submit">
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
<div use:melt={$root} class="mt-4">
	<div use:melt={$list} aria-label="Manage your friends and invites">
		{#each tabTriggers as triggerItem}
			<button use:melt={$trigger(triggerItem.id)} class="trigger relative p-4 text-xl">
				{triggerItem.label}
				{#if $value === triggerItem.id}
					<div
						in:send={{ key: 'trigger' }}
						out:receive={{ key: 'trigger' }}
						class="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-tertiary"
					></div>
				{/if}
			</button>
		{/each}
	</div>
	<div use:melt={$content('friends')} class="mt-4">
		<div class="flex flex-col gap-4 lg:w-1/2">
			<LinkButton variant="primary" className="self-end" href="/my/friends/add"
				>Add friend</LinkButton
			>

			{#if data.friends.length && data.pendingSentInvites.length === 0}
				<p>No friends yet</p>
			{/if}

			{#each data.pendingSentInvites as invite}
				{@render Friend({
					name: invite.friendEmail,
					isPending: true,
					actions: [
						{
							actionName: '?/cancel-invite',
							data: { id: invite.id },
							icon: 'cross',
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
							data: { id: friend.id },
							icon: 'cross',
							label: 'Remove'
						}
					]
				})}
			{/each}
		</div>
	</div>

	<div use:melt={$content('invites')} class="mt-4">
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
								data: { id: invite.id },
								icon: 'check',
								label: 'Accept'
							},
							{
								actionName: '?/reject-invite',
								data: { id: invite.id },
								icon: 'cross',
								label: 'Reject'
							}
						]
					})}
				{/each}
			{/if}
		</div>
	</div>
</div>
