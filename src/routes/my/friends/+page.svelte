<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types.js';

	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="container mx-auto">
	<div class="flex">
		<section class="mb-20 flex-1">
			<h1 class="text-2xl">Friends</h1>
			<p>Having friends allows you to share notes with one another.</p>
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
		</section>
	</div>
</div>
