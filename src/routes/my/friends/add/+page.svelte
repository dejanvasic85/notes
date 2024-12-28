<script lang="ts">
	import { createLabel, melt } from '@melt-ui/svelte';

	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';

	let { form } = $props();
	const {
		elements: { root }
	} = createLabel();
	const formError = form?.status === 400;
</script>

<div class="mb-4">
	<a href="/my/friends" class="mb-4">
		<Icon icon="arrow-left" />
	</a>
</div>

<h1 class="text-2xl">Invite friend</h1>
<p>Adding a friend allows you select notes for them to see.</p>
<form method="POST">
	<div class="mt-4 flex w-full flex-col gap-2 lg:w-1/2">
		<label for="email" class:text-error={formError} use:melt={$root}>Email</label>
		<div class="flex-1">
			<Input id="email" type="text" invalid={formError} name="email" />
		</div>
		{#if formError}
			<p class="mt-2 text-sm text-error">Email is required</p>
		{/if}
		<div class="flex justify-end">
			<Button type="submit">Send invite</Button>
		</div>
	</div>
</form>
