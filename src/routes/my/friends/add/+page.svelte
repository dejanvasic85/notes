<script lang="ts">
	let { form } = $props();

	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';

	const formError = form?.status === 400;
</script>

<h1 class="text-2xl">Invite friend</h1>
<p>Adding a friend allows you select notes for them to see.</p>
<form method="POST">
	<div class="mt-4 flex w-full flex-col gap-2 lg:w-1/2">
		<label for="email" class:text-red-500={formError}>Email</label>
		<Input id="email" type="text" class="flex-1" invalid={formError} name="email" />
		{#if formError}
			<p class="mt-2 text-sm text-red-600 dark:text-red-500">Email is required</p>
		{/if}
		<Button type="submit" className="self-end">Send invite</Button>
	</div>
</form>
