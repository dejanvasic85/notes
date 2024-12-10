<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import type { ActionData, PageData } from './$types';

	import { createTabs, melt } from '@melt-ui/svelte';

	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';

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

	const triggers = [
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
		label: 'Remove friend' | 'Remove invite' | 'Accept';
		isPending: boolean;
		picture?: string | null;
		onclick: () => void;
	};
</script>

{#snippet Friend({ label, isPending, onclick, picture, name }: FriendSnippetProps)}
	<div class="flex h-20 w-full items-center justify-between gap-2 rounded-lg p-4 dark:bg-slate-800">
		<div class="flex items-center gap-2">
			{#if picture}
				<img src={picture} class="h-10 rounded-full" alt="picture of {name}" />
			{/if}

			<span class={isPending ? 'italic text-gray-400' : ''}
				>{name} {isPending ? '(pending)' : ''}</span
			>
		</div>
		{#if label === 'Accept'}
			<Button variant="ghost" {label} on:click={onclick}><Icon icon="check" />Accept</Button>
		{:else}
			<Button variant="ghost" {label} on:click={onclick}><Icon icon="cross" /></Button>
		{/if}
	</div>
{/snippet}

<h1 class="text-2xl">Friends</h1>
<p>Connect with your friends to share notes.</p>
<div use:melt={$root} class="mt-4">
	<div use:melt={$list} aria-label="Manage your friends and invites">
		{#each triggers as triggerItem}
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
			<Button type="submit" className="self-end">Add friend</Button>
			{#if data.friends.length === 0}
				<p>No friends yet</p>
			{:else}
				{#each data.pendingSentInvites as invite}
					{@render Friend({
						name: invite.friendEmail,
						label: 'Remove invite',
						isPending: true,
						onclick: () => console.log('todo: remove', invite.id)
					})}
				{/each}

				{#each data.friends as friend}
					{@render Friend({
						name: friend.name!,
						label: 'Remove friend',
						isPending: false,
						picture: friend.picture,
						onclick: () => console.log('todo: remove', friend.id)
					})}
				{/each}
			{/if}
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
						label: 'Accept',
						isPending: false,
						onclick: () => console.log('todo: accept', invite.id)
					})}
				{/each}
			{/if}
		</div>
	</div>
</div>
