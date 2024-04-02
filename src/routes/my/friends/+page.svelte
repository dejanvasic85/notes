<script lang="ts">
	import type { ActionData, PageData } from './$types.js';

	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="container mx-auto">
	<h1>
		Friends
		{#if data.friends.length === 0}
			<p>No friends yet</p>
		{:else}
			{#each data.friends as friend}
				<div>
					<p>{friend.userFirstId}+{friend.userSecondId}:{friend.type}</p>
				</div>
			{/each}
		{/if}
	</h1>

	<hr />

	<h1>Invites</h1>
	<div>
		Sent invites
		{#each data.invites as invite}
			<div>
				<p>{invite.friendEmail}, sent: {invite.createdAt}</p>
			</div>
		{/each}
	</div>

	<div>
		{#if form?.success}
			<p>Invite sent</p>
		{:else if form?.message}
			<p>{form.message}</p>
		{/if}
		Invite another friend to share your notes
		<form method="post">
			<Input type="text" name="email" placeholder="Email" />
			<Button type="submit">Invite</Button>
		</form>
	</div>
</div>
