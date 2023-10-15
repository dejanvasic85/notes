<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getNoteCssClass } from '$lib/colours';
	import { draggable } from '$lib/draggable';
	import type { NoteOrdered } from '../types';

	export let note: NoteOrdered;
	export let index: number;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};

	$: className = getNoteCssClass({
		defaultClass: 'text-base border',
		variant: note.colour
	});
</script>

<div
	class="h-48 w-full overflow-y-hidden rounded-lg p-4 md:w-60 {className}"
	tabindex={index}
	role="button"
	aria-label={`Edit note ${index + 1}`}
	use:draggable={{ note, index }}
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
