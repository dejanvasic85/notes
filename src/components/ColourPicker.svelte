<script lang="ts">
	import { slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	import { colours, type Colour } from '$lib/colours';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';

	let isOpen = false;

	const dispatch = createEventDispatcher();

	function handleColourClick(colour: Colour | null) {
		dispatch('colourClick', { colour });
		isOpen = false;
	}
</script>

<div class="relative">
	<Button variant="ghost" onclick={() => (isOpen = !isOpen)}>
		<Icon icon="paintBrush" title="Choose colour" />
	</Button>
	{#if isOpen}
		<div
			class="absolute left-0 top-14 flex flex-col gap-1 bg-transparent"
			in:slide={{ duration: 100 }}
		>
			<div class="block text-gray-800">
				<button
					aria-label="No colour"
					class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-400 bg-white text-gray-600 dark:border-slate-200 dark:bg-slate-800"
					on:click={() => handleColourClick(null)}
				>
					<Icon icon="cross" size={30} title="No colour" />
				</button>
			</div>
			{#each colours as { cssClass, name }}
				<div class="block text-gray-800">
					<button
						aria-label={name}
						title={name}
						class="h-12 w-12 rounded-full border-2 border-slate-400 dark:border dark:border-slate-200 {cssClass}"
						on:click={() => handleColourClick(name)}
					></button>
				</div>
			{/each}
		</div>
	{/if}
</div>
