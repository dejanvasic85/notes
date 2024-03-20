<script lang="ts">
	import type { ActionData, PageData } from './$types.js';

	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="container mx-auto">
	<h1>Invites</h1>
	<div>
		{#each data.invites as invite}
			<div>
				<p>{invite.friendEmail}, sent: {invite.createdAt}</p>
			</div>
		{/each}
	</div>

	<div>
		{#if form?.success}
			<p>Invite sent</p>
		{:else if form?.missing}
			<p>{form.missing} is a required field</p>
		{/if}
		Invite another friend to share your notes
		<form method="post">
			<Input type="text" name="email" placeholder="Email" />
			<Button type="submit">Invite</Button>
		</form>
	</div>
</div>
