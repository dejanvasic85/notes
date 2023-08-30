<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { getNoteCssClass } from '$lib/colours';
	import type { Note } from '../types';

	export let note: Note;
	export let index: number;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};

	$: className = getNoteCssClass({
		defaultClass: 'bg-transparent text-base border',
		variant: note.colour
	});
</script>

<!-- svelte-ignore a11y-interactive-supports-focus -->
<div
	class="min-h-48 w-full rounded-lg p-4 md:w-60 {className}"
	tabindex={index}
	role="button"
	aria-label={`Edit note ${index + 1}`}
	on:click={handleClick}
	on:keypress={handleClick}
	transition:fly={{ x: 15, duration: 400 }}
>
	{@html note.text}
</div>
