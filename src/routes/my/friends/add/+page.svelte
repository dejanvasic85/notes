<script lang="ts">
	import { enhance } from '$app/forms';
	import { createLabel, melt } from '@melt-ui/svelte';

	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';

	let loading = $state(false);
	let error = $state('');

	const {
		elements: { root }
	} = createLabel();
</script>

<div class="mb-4">
	<a href="/my/friends" class="mb-4">
		<Icon icon="arrow-left" />
	</a>
</div>

<h1 class="text-2xl">Invite friend</h1>
<p>Adding a friend allows you select notes for them to see.</p>
<form
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ result }) => {
			loading = false;
			if (result.type === 'failure') {
				error = result.data?.message as string;
			}
		};
	}}
>
	<div class="mt-4 flex w-full flex-col gap-2 lg:w-1/2">
		<label for="email" class:text-error={!!error} use:melt={$root}>Email</label>
		<div class="flex-1">
			<Input id="email" type="text" invalid={!!error} name="email" />
		</div>
		{#if error}
			<p class="mt-2 text-sm text-error">{error}</p>
		{/if}
		<div class="flex justify-end">
			<Button type="submit" {loading}>Send invite</Button>
		</div>
	</div>
</form>
