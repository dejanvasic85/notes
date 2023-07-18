<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let text: string;
	export let editMode: boolean;
	export let tabIndex: number;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};
</script>

{#if editMode}
	<div
		class="w-60 min-h-48 border p-4 bg-cyan-200 shadow-xl"
		contenteditable="true"
		bind:innerHTML={text}
	/>
{:else}
	<div
		class="w-60 min-h-48 border p-4 bg-cyan-50 shadow-xl"
		tabindex={tabIndex}
		role="button"
		on:click={handleClick}
		on:keypress={handleClick}
	>
		{@html text}
	</div>
{/if}
