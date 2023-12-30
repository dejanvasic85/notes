<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { User } from '$lib/types';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Input from './Input.svelte';

	interface Person extends Pick<User, 'id' | 'email' | 'name'> {}

	// Events
	const dispatchSave = createEventDispatcher<{ save: { email: string } }>();

	// Props
	export let collaborators: Person[] = [];

	// Internal state
	let isEditMode = false;
	let email = '';

	function handleEditClick() {
		isEditMode = true;
	}

	function handleSave() {
		isEditMode = false;
		dispatchSave('save', { email });
		email = '';
	}
</script>

<div>
	{#each collaborators as { email }}<div>{email}</div>{/each}
	{#if isEditMode}
		<div class="flex flex-row gap-2">
			<Input
				id="email"
				type="email"
				label="email"
				placeholder="email"
				focusOnMount={true}
				bind:value={email}
			/>
			<Button on:click={() => (isEditMode = false)} variant="ghost"><Icon icon="cross" /></Button>
			<Button on:click={handleSave}><Icon icon="check" /></Button>
		</div>
	{:else}
		<Button on:click={handleEditClick}>
			<Icon icon="personAdd" />
		</Button>
	{/if}
</div>
