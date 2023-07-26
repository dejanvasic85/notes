<script lang="ts">
	import { slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { colours, type Colour } from '$lib/colours';

	let isOpen = false;

	const dispatch = createEventDispatcher();

	function handleColourClick(colour: Colour) {
		dispatch('colourClick', { colour });
		isOpen = false;
	}
</script>

<div class="relative">
	<Button variant="ghost" on:click={() => (isOpen = !isOpen)}>
		<Icon icon="paintBrush" title="Choose colour" />
	</Button>
	{#if isOpen}
		<div
			class="absolute flex flex-col gap-1 left-0 top-14 bg-transparent"
			in:slide={{ duration: 200 }}
		>
			{#each colours as { cssClass, name }}
				<li class="block text-gray-800">
					<button
						aria-label={name}
						class="h-12 w-12 border-2 rounded-full {cssClass}"
						on:click={() => handleColourClick(name)}
					/>
				</li>
			{/each}
		</div>
	{/if}
</div>
