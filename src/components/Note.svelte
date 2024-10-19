<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import { getNoteCssClass } from '$lib/colours';
	import { draggable } from '$lib/draggable';
	import type { NoteOrdered, SharedNote } from '$lib/types';

	export let note: NoteOrdered | SharedNote;
	export let index: number;
	export let isDraggable: boolean = true;

	let divElement: HTMLElement;

	onMount(() => {
		if (isDraggable) {
			draggable(divElement, { index });
		}
	});

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};

	$: className = getNoteCssClass({
		defaultClass: 'text-base border',
		variant: note.colour ?? ''
	});
</script>

<div
	class="h-72 w-full overflow-y-hidden rounded-lg p-4 md:w-64 {className} hover:ring-2"
	tabindex={index}
	role="button"
	aria-label={`Edit note ${index + 1}`}
	bind:this={divElement}
	on:click={handleClick}
	on:keypress={handleClick}
>
	{@html note.text}
</div>

<style>
	.dragging {
		opacity: 0.5;
		background-color: transparent;
	}
</style>
