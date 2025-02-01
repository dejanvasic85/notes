<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { createLabel, melt } from '@melt-ui/svelte';

	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';

	type Props = {
		data: { displayName: string };
		form?: {
			errors: {
				displayName: string;
			};
		};
	};

	let loading = $state(false);
	let props: Props = $props();

	const toastMessages = getToastMessages();

	const {
		elements: { root }
	} = createLabel();
</script>

<div class="mb-4">
	<a href="/my/friends" class="mb-4">
		<Icon icon="arrow-left" />
	</a>
</div>

<h1 class="text-2xl">Account settings</h1>
<p>Manage your personal details.</p>
<form
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ result, update }) => {
			await update();
			loading = false;
			if (result.type === 'failure' && result.data?.message) {
				toastMessages.addMessage({ type: 'error', message: result.data?.message as string });
			}
			if (result.type === 'redirect') {
				goto(result.location);
			}
			if (result.type === 'success') {
				toastMessages.addMessage({ type: 'success', message: 'Account updated' });
			}
		};
	}}
>
	<div class="mt-4 flex w-full flex-col gap-2 lg:w-1/2">
		<label for="displayName" class:text-error={!!props.form?.errors?.displayName} use:melt={$root}
			>Display name</label
		>
		<div class="flex-1">
			<Input
				id="displayName"
				type="text"
				name="displayName"
				invalid={!!props.form?.errors?.displayName}
				value={props.data.displayName}
			/>
		</div>
		{#if props.form?.errors?.displayName}
			<p class="mt-2 text-sm text-error">{props.form?.errors?.displayName}</p>
		{/if}
		<div class="flex justify-end">
			<Button type="submit" {loading}>Update</Button>
		</div>
	</div>
</form>
