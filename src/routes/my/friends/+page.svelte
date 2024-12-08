<script lang="ts">
	// import { enhance } from '$app/forms';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import type { ActionData, PageData } from './$types';

	import { createTabs, melt } from '@melt-ui/svelte';

	// import Input from '$components/Input.svelte';
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
</script>

<h1 class="text-2xl">Friends</h1>
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
		<div>
			{#if data.friends.length === 0}
				<p>No friends yet</p>
			{:else}
				{#each data.friends as friend}
					<div class="flex w-full items-center justify-between gap-2 rounded-lg bg-slate-800 p-4">
						<span>{friend.name}</span>
						<Button variant="ghost"><Icon icon="cross" /></Button>
					</div>
				{/each}
			{/if}
		</div>
	</div>
	<!-- <section class="mb-20 flex-1">
		<div>
			{#if data.friends.length === 0}
				<p>No friends yet</p>
			{:else}
				{#each data.friends as friend}
					<div>
						<p>{friend.name}</p>
					</div>
				{/each}
			{/if}
		</div>
		<div class="mt-4">
			Invite a friend by email.
			<form method="post" action="?/invite" use:enhance>
				<Input type="text" name="email" placeholder="Email" />
				<Button type="submit">Invite</Button>
			</form>
		</div>
	</section>

	<section class="flex-1">
		<h1 class="text-xl">Invites</h1>
		<div>
			<h3 class="text-lg">Sent invites</h3>
			{#each data.pendingSentInvites as invite}
				<div>
					<p>{invite.friendEmail}, sent: {invite.createdAt}</p>
				</div>
			{/each}
		</div>

		<div class="mt-8">
			<h3 class="text-lg">Incoming invites</h3>
			{#each data.pendingReceivedInvites as invite}
				<div class="flex gap-4">
					{invite.user.name}, sent: {invite.createdAt}
					<form method="post" action="?/accept" use:enhance>
						<input type="hidden" name="inviteId" value={invite.id} />
						<Button type="submit">Accept</Button>
					</form>
					<form method="post" action="?/ignore" use:enhance>
						<input type="hidden" name="inviteId" value={invite.id} />
						<Button variant="ghost" type="submit">Ignore</Button>
					</form>
				</div>
			{/each}
		</div>

		<div>
			{#if form?.success}
				<p>Invite sent</p>
			{:else if form?.message}
				<p>{form.message}</p>
			{/if}
			<hr />
		</div>
	</section> -->
</div>
